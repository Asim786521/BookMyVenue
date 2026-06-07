import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { redisLockService } from "../../services/redis-lock.service";
import { publishEvent } from "../../kafka/producers/event-producer";
import { kafkaTopics } from "../../kafka/topics/topics";
import { AppError } from "../../utils/app-error";
import { BookingStatuses, VenueStatuses } from "../../types/domain";

export class BookingsService {
  async create(userId: string, input: { venueId: string; slotId: string; date: string }) {
    const lockKey = `lock:venue:${input.venueId}:date:${input.date}:slot:${input.slotId}`;
    const lockToken = await redisLockService.acquire(lockKey, 300);
    if (!lockToken) throw new AppError(409, "Slot is being booked, try again", "BOOKING_LOCKED");

    try {
      return await prisma.$transaction(async (tx: any) => {
        await tx.$queryRaw`SELECT id FROM venue_slots WHERE id = ${input.slotId}::uuid FOR UPDATE`;

        const venue = await tx.venue.findFirst({
          where: { id: input.venueId, status: VenueStatuses.APPROVED, slots: { some: { id: input.slotId } } }
        });
        if (!venue) throw new AppError(404, "Venue or slot not available", "VENUE_NOT_AVAILABLE");

        const existing = await tx.booking.findFirst({
          where: {
            venueId: input.venueId,
            date: new Date(input.date),
            slotId: input.slotId,
            status: { in: [BookingStatuses.PENDING_PAYMENT, BookingStatuses.CONFIRMED] }
          }
        });
        if (existing) {
          throw new AppError(409, "Slot already booked", "SLOT_BOOKED");
        }

        const booking = await tx.booking.create({
          data: {
            userId,
            venueId: input.venueId,
            slotId: input.slotId,
            date: new Date(input.date),
            amount: venue.price,
            status: BookingStatuses.PENDING_PAYMENT,
            history: { create: { status: BookingStatuses.PENDING_PAYMENT, note: "Booking created" } },
            payment: { create: { amount: venue.price } }
          },
          include: { venue: true, slot: true, payment: true }
        });

        return booking;
      });
    } finally {
      await redisLockService.release(lockKey, lockToken);
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
