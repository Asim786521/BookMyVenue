import crypto from "crypto";
import Razorpay from "razorpay";
import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { AppError } from "../../utils/app-error";
import { bookingsService } from "../bookings/bookings.service";
import { publishEvent } from "../../kafka/producers/event-producer";
import { kafkaTopics } from "../../kafka/topics/topics";
import { PaymentStatuses } from "../../types/domain";
import { stripe } from "../../config/stripe";
 

export class PaymentsService {
async createOrder(userId: string, bookingId: string) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: { payment: true }
  });

  if (!booking) throw new AppError(404, "Booking not found", "BOOKING_NOT_FOUND");

  if (!stripe) {
    throw new AppError(503, "Stripe not configured", "PAYMENT_PROVIDER_UNAVAILABLE");
  }

  const amount = Math.round(Number(booking.amount) * 100); // paise

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "inr",
    metadata: {
      bookingId,
      userId
    }
  });

  await prisma.payment.update({
    where: { bookingId },
    data: {
      stripePaymentIntentId: paymentIntent.id,
      status: PaymentStatuses.PENDING
    }
  });

  return {
    clientSecret: paymentIntent.client_secret, // IMPORTANT
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    publishableKey: env.STRIPE_PUBLISHABLE_KEY
  };
}

  // async verify(userId: string, input: { bookingId: string; stripeOrderId: string; stripePaymentIntentId: string; stripeSignature: string }) {
  //   const booking = await prisma.booking.findFirst({ where: { id: input.bookingId, userId } });
  //   if (!booking) throw new AppError(404, "Booking not found", "BOOKING_NOT_FOUND");
  //   const expected = crypto
  //     .createHmac("sha256", env.STRIPE_SECRET_KEY ?? "")
  //     .update(`${input.stripeOrderId}|${input.stripePaymentIntentId}`)
  //     .digest("hex");

  //   if (expected !== input.stripeSignature) {
  //     await prisma.payment.update({ where: { bookingId: input.bookingId }, data: { status: PaymentStatuses.FAILED } });
  //     throw new AppError(400, "Payment verification failed", "PAYMENT_VERIFY_FAILED");
  //   }

  //   return prisma.$transaction(async (tx: any) => {
  //     await tx.payment.update({
  //       where: { bookingId: input.bookingId },
  //       data: {
  //         transactionId: input.stripePaymentIntentId,
  //         stripeOrderId: input.stripeOrderId,
  //         status: PaymentStatuses.SUCCESS
  //       }
  //     });
  //     const confirmed = await bookingsService.confirmPayment(input.bookingId, input.stripePaymentIntentId, tx);
  //     await publishEvent(kafkaTopics.paymentEvents, { type: "PAYMENT_SUCCESS", payload: { bookingId: input.bookingId } }).catch(() => undefined);
  //     await publishEvent(kafkaTopics.notificationEvents, { type: "PAYMENT_SUCCESS", payload: { bookingId: input.bookingId, userId } }).catch(() => undefined);
  //     return confirmed;
  //   });
  // }
}

export const paymentsService = new PaymentsService();
