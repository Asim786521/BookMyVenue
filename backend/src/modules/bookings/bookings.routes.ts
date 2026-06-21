import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { Roles } from "../../types/domain";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { bookingsService } from "./bookings.service";
import { createBookingSchema, idParamSchema } from "./booking.schemas";

export const bookingsRoutes = Router();

bookingsRoutes.use(authenticate);
bookingsRoutes.post(
  "/",
  authorize(Roles.USER),
  validate(createBookingSchema),
  asyncHandler(async (req, res) => {
    console.log("🚀 [BOOKING ROUTE HIT]");
    console.log("👤 USER ID:", req.user?.id);
    console.log("📦 BODY:", req.body);

    const result = await bookingsService.create(req.user!.id, req.body);

    console.log("✅ [BOOKING SUCCESS] ID:", result.id);

    return res.status(201).json(result);
  })
);
bookingsRoutes.get("/my", authorize(Roles.USER), asyncHandler(async (req, res) => {
   res.json(await bookingsService.myBookings(req.user!.id));
}));
bookingsRoutes.patch("/:id/cancel", authorize(Roles.USER), validate(idParamSchema), asyncHandler(async (req, res) => {
  res.json(await bookingsService.cancel(req.user!.id, String(req.params.id)));
}));
