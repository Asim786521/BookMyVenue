import crypto from "crypto";
import Razorpay from "razorpay";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { AppError } from "../../utils/app-error";
import { bookingsService } from "../bookings/bookings.service";
import { publishEvent } from "../../kafka/producers/event-producer";
import { kafkaTopics } from "../../kafka/topics/topics";
import { PaymentStatuses } from "../../types/domain";

const razorpay =
  env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET
    ? new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET })
    : null;

export class PaymentsService {
  async createOrder(userId: string, bookingId: string) {
    const booking = await prisma.booking.findFirst({ where: { id: bookingId, userId }, include: { payment: true } });
    if (!booking) throw new AppError(404, "Booking not found", "BOOKING_NOT_FOUND");
    if (!razorpay) throw new AppError(503, "Razorpay is not configured", "PAYMENT_PROVIDER_UNAVAILABLE");

    const order = await razorpay.orders.create({
      amount: Number(booking.amount) * 100,
      currency: "INR",
      receipt: booking.id
    });

    await prisma.payment.update({
      where: { bookingId },
      data: { razorpayOrderId: order.id, status: PaymentStatuses.PENDING }
    });

    return { orderId: order.id, amount: order.amount, currency: order.currency, keyId: env.RAZORPAY_KEY_ID };
  }

  async verify(userId: string, input: { bookingId: string; razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) {
    const booking = await prisma.booking.findFirst({ where: { id: input.bookingId, userId } });
    if (!booking) throw new AppError(404, "Booking not found", "BOOKING_NOT_FOUND");
    const expected = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET ?? "")
      .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
      .digest("hex");

    if (expected !== input.razorpaySignature) {
      await prisma.payment.update({ where: { bookingId: input.bookingId }, data: { status: PaymentStatuses.FAILED } });
      throw new AppError(400, "Payment verification failed", "PAYMENT_VERIFY_FAILED");
    }

    return prisma.$transaction(async (tx: any) => {
      await tx.payment.update({
        where: { bookingId: input.bookingId },
        data: {
          transactionId: input.razorpayPaymentId,
          razorpayOrderId: input.razorpayOrderId,
          status: PaymentStatuses.SUCCESS
        }
      });
      const confirmed = await bookingsService.confirmPayment(input.bookingId, input.razorpayPaymentId, tx);
      await publishEvent(kafkaTopics.paymentEvents, { type: "PAYMENT_SUCCESS", payload: { bookingId: input.bookingId } }).catch(() => undefined);
      await publishEvent(kafkaTopics.notificationEvents, { type: "PAYMENT_SUCCESS", payload: { bookingId: input.bookingId, userId } }).catch(() => undefined);
      return confirmed;
    });
  }
}

export const paymentsService = new PaymentsService();
