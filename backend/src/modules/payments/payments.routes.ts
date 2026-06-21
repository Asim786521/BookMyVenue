import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { Roles } from "../../types/domain";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { createOrderSchema, verifyPaymentSchema } from "./payment.schemas";
import { paymentsService } from "./payments.service";

export const paymentsRoutes = Router();

paymentsRoutes.use(authenticate, authorize(Roles.USER));
paymentsRoutes.post("/create-order", validate(createOrderSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await paymentsService.createOrder(req.user!.id, req.body.bookingId));
}));
paymentsRoutes.post("/verify", validate(verifyPaymentSchema), asyncHandler(async (req, res) => {
  res.json(await paymentsService.verify(req.user!.id, req.body));
}));
