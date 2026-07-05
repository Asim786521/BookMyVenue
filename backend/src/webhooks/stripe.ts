import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { stripe } from "../config/stripe";


export const stripeWebhook = async (req: any, res: any) => {
  console.log("🔥 WEBHOOK HIT");

  const sig = req.headers["stripe-signature"];
  console.log("📩 Stripe Signature:", sig);

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );

    console.log("✅ Webhook verified successfully");
    console.log("📦 Event type:", event.type);
  } catch (err: any) {
    console.error("❌ Webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error`);
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      console.log("💰 Payment succeeded event received");

      const paymentIntent = event.data.object;
      console.log("🧾 PaymentIntent ID:", paymentIntent.id);
      console.log("📌 Metadata:", paymentIntent.metadata);

      const bookingId = paymentIntent.metadata.bookingId;

      console.log("📍 Booking ID from metadata:", bookingId);

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { bookingId },
          data: {
            status: "SUCCESS",
            transactionId: paymentIntent.id
          }
        });

        await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: "CONFIRMED"
          }
        });

        await tx.bookingHistory.create({
          data: {
            bookingId,
            status: "CONFIRMED",
            note: "Payment successful via Stripe"
          }
        });
      });
      break;
    }

    case "payment_intent.payment_failed":
      console.log("❌ Payment failed event received");
      break;

    default:
      console.log("⚠️ Unhandled event type:", event.type);
  }

  res.json({ received: true });
};