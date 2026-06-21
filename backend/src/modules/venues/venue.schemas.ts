import { z } from "zod";

export const venueInputSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    description: z.string().min(10),
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4),
    capacity: z.number().int().positive(),
    price: z.number().positive(),
    amenities: z.array(z.string()).default([])
  })
});

export const slotInputSchema = z.object({
  body: z.object({
    label: z.string().min(2),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)
  })
});

export const searchSchema = z.object({
  query: z.object({
    city: z.string().optional(),
    capacity: z.coerce.number().int().positive().optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    date: z.string().optional(),
    sort: z.enum(["price_asc", "price_desc", "capacity_desc"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(12)
  })
});
