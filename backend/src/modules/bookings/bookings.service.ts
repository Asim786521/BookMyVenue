import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { redisLockService } from "../../services/redis-lock.service";
import { publishEvent } from "../../kafka/producers/event-producer";
import { kafkaTopics } from "../../kafka/topics/topics";
import { AppError } from "../../utils/app-error";
import { BookingStatuses, VenueStatuses } from "../../types/domain";
import { parseDateToUTC } from "../../utils/date-utils";

export class BookingsService {
  async create(userId: string, input: { venueId: string; slotId: string; date: string }) {
    console.log("🟡 STEP 1: ENTER CREATE");

    const lockKey = `lock:venue:${input.venueId}:date:${input.date}:slot:${input.slotId}`;
    console.log("🔒 LOCK KEY:", lockKey);

    // const lockToken = await redisLockService.acquire(lockKey, 300);
    // console.log("🔐 LOCK TOKEN:", lockToken);

    // if (!lockToken) {
    //   console.log("❌ LOCK FAILED");
    //   throw new AppError(409, "Slot is being booked, try again", "BOOKING_LOCKED");
    // }

    try {
      console.log("🟡 STEP 2: START TRANSACTION");

      return await prisma.$transaction(async (tx: any) => {
        console.log("🟡 STEP 3: LOCK SLOT ROW");

        await tx.$queryRaw`
        SELECT id FROM venue_slots 
        WHERE id = ${input.slotId}::uuid 
        FOR UPDATE
      `;

        console.log("🟡 STEP 4: FIND VENUE");

        const venue = await tx.venue.findFirst({
          where: {
            id: input.venueId,
            status: VenueStatuses.APPROVED,
            slots: { some: { id: input.slotId } },
          },
        });

        console.log("VENUE FOUND:", !!venue);

        if (!venue) {
          console.log("❌ VENUE NOT FOUND");
          throw new AppError(404, "Venue or slot not available", "VENUE_NOT_AVAILABLE");
        }

        console.log("🟡 STEP 5: CHECK EXISTING BOOKING");

        const existing = await tx.booking.findFirst({
          where: {
            venueId: input.venueId,
            date: new Date(input.date),
            slotId: input.slotId,
            status: {
              in: [BookingStatuses.PENDING_PAYMENT, BookingStatuses.CONFIRMED],
            },
          },
        });

        console.log("EXISTING BOOKING:", !!existing);

        if (existing) {
          console.log("❌ SLOT ALREADY BOOKED");
          throw new AppError(409, "Slot already booked", "SLOT_BOOKED");
        }
 
        const bookingDate = parseDateToUTC(input.date);
         console.log("PARSED BOOKING DATE (UTC):", bookingDate.toISOString());
        const booking = await tx.booking.create({
          data: {
            userId,
            venueId: input.venueId,
            slotId: input.slotId,
            date: bookingDate,
            amount: venue.price,
            status: BookingStatuses.PENDING_PAYMENT,
            history: {
              create: {
                status: BookingStatuses.PENDING_PAYMENT,
                note: "Booking created",
              },
            },
            payment: {
              create: { amount: venue.price },
            },
          },
          include: { venue: true, slot: true, payment: true },
        });

        console.log("✅ STEP 7: BOOKING CREATED");

        return booking;
      });
    } catch (err) {
      console.error("🔥 BOOKING CREATE ERROR:");
      console.error(err);
      throw err;
    } finally {
      console.log("🧹 RELEASING LOCK");
      // await redisLockService.release(lockKey, lockToken);
    }
  }

  async myBookings(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      include: { venue: true, slot: true, payment: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async cancel(userId: string, bookingId: string) {
    const booking = await prisma.booking.findFirst({ where: { id: bookingId, userId } });
    if (!booking) throw new AppError(404, "Booking not found", "BOOKING_NOT_FOUND");
    const cancellableStatuses: string[] = [BookingStatuses.PENDING_PAYMENT, BookingStatuses.CONFIRMED];
    if (!cancellableStatuses.includes(booking.status)) {
      throw new AppError(400, "Booking cannot be cancelled", "BOOKING_NOT_CANCELLABLE");
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatuses.CANCELLED,
        history: { create: { status: BookingStatuses.CANCELLED, note: "Cancelled by user" } }
      }
    });

    await publishEvent(kafkaTopics.bookingEvents, { type: "BOOKING_CANCELLED", payload: { bookingId } }).catch(() => undefined);
    await publishEvent(kafkaTopics.notificationEvents, { type: "BOOKING_CANCELLED", payload: { bookingId, userId } }).catch(() => undefined);
    return updated;
  }

  async confirmPayment(bookingId: string, transactionId: string, tx: Prisma.TransactionClient = prisma) {
    const booking = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatuses.CONFIRMED,
        history: { create: { status: BookingStatuses.CONFIRMED, note: "Payment verified" } }
      }
    });
    await publishEvent(kafkaTopics.bookingEvents, { type: "BOOKING_CONFIRMED", payload: { bookingId, transactionId } }).catch(() => undefined);
    return booking;
  }
}

export const bookingsService = new BookingsService();
