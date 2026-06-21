import { Router } from "express";
import { prisma } from "../../config/prisma";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { analyticsService } from "../analytics/analytics.service";
import { adminVenueDecisionSchema } from "./admin.schemas";
import { Roles, VenueStatuses } from "../../types/domain";

export const adminRoutes = Router();

adminRoutes.use(authenticate, authorize(Roles.ADMIN));

adminRoutes.get("/pending-venues", asyncHandler(async (_req, res) => {
  res.json(await prisma.venue.findMany({
    where: { status: VenueStatuses.PENDING_APPROVAL },
    include: { owner: { select: { id: true, name: true, email: true } }, images: true },
    orderBy: { createdAt: "asc" }
  }));
}));

adminRoutes.patch("/venues/:id/approve", validate(adminVenueDecisionSchema), asyncHandler(async (req, res) => {
  const reason = typeof req.body.reason === "string" ? req.body.reason : undefined;
  const venue = await prisma.venue.update({
    where: { id: String(req.params.id) },
    data: {
      status: VenueStatuses.APPROVED,
      approvals: { create: { adminId: req.user!.id, status: VenueStatuses.APPROVED, reason } }
    }
  });
  res.json(venue);
}));

adminRoutes.patch("/venues/:id/reject", validate(adminVenueDecisionSchema), asyncHandler(async (req, res) => {
  const reason = typeof req.body.reason === "string" ? req.body.reason : undefined;
  const venue = await prisma.venue.update({
    where: { id: String(req.params.id) },
    data: {
      status: VenueStatuses.REJECTED,
      approvals: { create: { adminId: req.user!.id, status: VenueStatuses.REJECTED, reason } }
    }
  });
  res.json(venue);
}));

adminRoutes.get("/users", asyncHandler(async (_req, res) => {
  res.json(await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } }));
}));

adminRoutes.get("/bookings", asyncHandler(async (_req, res) => {
  res.json(await prisma.booking.findMany({
    include: { user: { select: { id: true, name: true, email: true } }, venue: true, slot: true, payment: true },
    orderBy: { createdAt: "desc" }
  }));
}));

adminRoutes.get("/analytics", asyncHandler(async (_req, res) => {
  res.json(await analyticsService.adminOverview());
}));
