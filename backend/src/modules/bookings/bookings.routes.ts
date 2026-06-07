import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { Roles } from "../../types/domain";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { bookingsService } from "./bookings.service";
import { createBookingSchema, idParamSchema } from "./booking.schemas";

export const bookingsRoutes = Router();

bookingsRoutes.use(authenticate);
bookingsRoutes.post("/", authorize(Roles.USER), validate(createBookingSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await bookingsService.create(req.user!.id, req.body));
}));
bookingsRoutes.get("/my", authorize(Roles.USER), asyncHandler(async (req, res) => {
  res.json(await bookingsService.myBookings(req.user!.id));
}));
bookingsRoutes.patch("/:id/cancel", authorize(Roles.USER), validate(idParamSchema), asyncHandler(async (req, res) => {
  res.json(await bookingsService.cancel(req.user!.id, String(req.params.id)));
}));
