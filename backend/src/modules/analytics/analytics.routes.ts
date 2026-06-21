import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { Roles } from "../../types/domain";
import { asyncHandler } from "../../utils/async-handler";
import { analyticsService } from "./analytics.service";

export const analyticsRoutes = Router();

analyticsRoutes.get("/owner", authenticate, authorize(Roles.VENUE_OWNER), asyncHandler(async (req, res) => {
  res.json(await analyticsService.ownerOverview(req.user!.id));
}));
