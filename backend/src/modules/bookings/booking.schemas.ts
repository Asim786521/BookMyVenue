import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    venueId: z.string().uuid(),
    slotId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  })
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().uuid() })
});
