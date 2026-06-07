import { Router } from "express";
import { prisma } from "../../config/prisma";
import { authenticate } from "../../middleware/auth";
import { asyncHandler } from "../../utils/async-handler";

export const usersRoutes = Router();

usersRoutes.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.json(user);
  })
);
