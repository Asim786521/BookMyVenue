import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({ bookingId: z.string().uuid() })
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid(),
    stripeOrderId: z.string(),
    stripePaymentIntentId: z.string(),
    stripeSignature: z.string()
  })
});
