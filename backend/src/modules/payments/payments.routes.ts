import express, { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { Roles } from "../../types/domain";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { createOrderSchema, verifyPaymentSchema } from "./payment.schemas";
import { paymentsService } from "./payments.service";
import { stripeWebhook } from "../../webhooks/stripe";

export const paymentsRoutes = Router();

/* =========================
   STRIPE WEBHOOK (NO AUTH)
========================= */
paymentsRoutes.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

/* =========================
   PROTECTED ROUTES
========================= */
paymentsRoutes.use(authenticate, authorize(Roles.USER));

paymentsRoutes.post(
  "/create-order",
  validate(createOrderSchema),
  asyncHandler(async (req, res) => {
    res
      .status(201)
      .json(await paymentsService.createOrder(req.user!.id, req.body.bookingId));
  })
);