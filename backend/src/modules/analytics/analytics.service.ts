import { prisma } from "../../config/prisma";
import { redis } from "../../config/redis";
import { Role } from "../../types/domain";

export class AnalyticsService {
  async adminOverview() {
    const cacheKey = "analytics:admin";
    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached);

    const [totalUsers, totalVenues, totalBookings, revenue] = await prisma.$transaction([
      prisma.user.count(),
      prisma.venue.count(),
      prisma.booking.count(),
      prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } })
    ]);
    const result = { totalUsers, totalVenues, totalBookings, totalRevenue: revenue._sum.amount ?? 0 };
    await redis.set(cacheKey, JSON.stringify(result), "EX", 60).catch(() => undefined);
    return result;
  }

  async ownerOverview(ownerId: string) {
    const [totalBookings, revenue] = await prisma.$transaction([
      prisma.booking.count({ where: { venue: { ownerId } } }),
      prisma.payment.aggregate({ where: { status: "SUCCESS", booking: { venue: { ownerId } } }, _sum: { amount: true } })
    ]);
    return { totalBookings, monthlyRevenue: revenue._sum.amount ?? 0 };
  }

  roleLabel(role: Role) {
    return role;
  }
}

export const analyticsService = new AnalyticsService();
