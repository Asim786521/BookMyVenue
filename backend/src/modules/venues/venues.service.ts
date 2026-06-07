import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { redis } from "../../config/redis";
import { AppError } from "../../utils/app-error";
import { VenueStatuses } from "../../types/domain";

const searchCacheTtl = 60;

type VenuePayload = {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  capacity: number;
  price: number;
  amenities: string[];
};

export class VenuesService {
  async search(query: {
    city?: string;
    capacity?: number;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page: number;
    limit: number;
  }) {
    const cacheKey = `venues:search:${JSON.stringify(query)}`;
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached);

    const where: Prisma.VenueWhereInput = {
      status: VenueStatuses.APPROVED,
      city: query.city ? { contains: query.city, mode: "insensitive" as Prisma.QueryMode } : undefined,
      capacity: query.capacity ? { gte: query.capacity } : undefined,
      price:
        query.minPrice || query.maxPrice
          ? { gte: query.minPrice, lte: query.maxPrice }
          : undefined
    };
    const orderBy =
      query.sort === "price_desc"
        ? { price: "desc" as const }
        : query.sort === "capacity_desc"
          ? { capacity: "desc" as const }
          : { price: "asc" as const };

    const [items, total] = await prisma.$transaction([
      prisma.venue.findMany({
        where,
        orderBy,
        include: { images: true, slots: true },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      prisma.venue.count({ where })
    ]);

    const result = { items, total, page: query.page, limit: query.limit };
    await redis.set(cacheKey, JSON.stringify(result), "EX", searchCacheTtl).catch(() => undefined);
    return result;
  }

  async getById(id: string) {
    const venue = await prisma.venue.findUnique({ where: { id }, include: { images: true, slots: true } });
    if (!venue || venue.status !== VenueStatuses.APPROVED) throw new AppError(404, "Venue not found", "VENUE_NOT_FOUND");
    return venue;
  }

  async availability(venueId: string, date: string) {
    const venue = await prisma.venue.findUnique({ where: { id: venueId }, include: { slots: true } });
    if (!venue) throw new AppError(404, "Venue not found", "VENUE_NOT_FOUND");
    const bookings = await prisma.booking.findMany({
      where: { venueId, date: new Date(date), status: { in: ["PENDING_PAYMENT", "CONFIRMED"] } },
      select: { slotId: true }
    });
    const booked = new Set(bookings.map((booking: { slotId: string }) => booking.slotId));
    return venue.slots.map((slot: { id: string }) => ({ ...slot, available: !booked.has(slot.id) }));
  }

  async createOwnerVenue(ownerId: string, data: VenuePayload) {
    return prisma.venue.create({ data: { ...data, owner: { connect: { id: ownerId } } } });
  }

  async updateOwnerVenue(ownerId: string, venueId: string, data: Prisma.VenueUpdateInput) {
    const venue = await prisma.venue.findFirst({ where: { id: venueId, ownerId } });
    if (!venue) throw new AppError(404, "Venue not found", "VENUE_NOT_FOUND");
    return prisma.venue.update({ where: { id: venueId }, data });
  }

  async ownerVenues(ownerId: string) {
    return prisma.venue.findMany({ where: { ownerId }, include: { images: true, slots: true }, orderBy: { createdAt: "desc" } });
  }

  async addSlot(ownerId: string, venueId: string, slot: { label: string; startTime: string; endTime: string }) {
    const venue = await prisma.venue.findFirst({ where: { id: venueId, ownerId }, include: { slots: true } });
    if (!venue) throw new AppError(404, "Venue not found", "VENUE_NOT_FOUND");
    if (slot.startTime >= slot.endTime) throw new AppError(400, "Slot end time must be after start time", "INVALID_SLOT");
    const overlaps = venue.slots.some((existing: { startTime: string; endTime: string }) => slot.startTime < existing.endTime && slot.endTime > existing.startTime);
    if (overlaps) throw new AppError(409, "Slot overlaps an existing slot", "SLOT_OVERLAP");
    return prisma.venueSlot.create({ data: { venueId, ...slot } });
  }
}

export const venuesService = new VenuesService();
