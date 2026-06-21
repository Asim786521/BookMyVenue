import { z } from "zod";

export const adminVenueDecisionSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ reason: z.string().optional() }).default({})
});
