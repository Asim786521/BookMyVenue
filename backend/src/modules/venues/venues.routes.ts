import { Router } from "express";
import multer from "multer";
import { prisma } from "../../config/prisma";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { asyncHandler } from "../../utils/async-handler";
import { AppError } from "../../utils/app-error";
import { Roles } from "../../types/domain";
import { searchSchema, slotInputSchema, venueInputSchema } from "./venue.schemas";
import { venuesService } from "./venues.service";

export const venuesRoutes = Router();
export const ownerVenueRoutes = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

venuesRoutes.get("/search", validate(searchSchema), asyncHandler(async (req, res) => res.json(await venuesService.search(req.query as any))));
venuesRoutes.get("/:id", asyncHandler(async (req, res) => res.json(await venuesService.getById(String(req.params.id)))));
venuesRoutes.get("/:id/availability", asyncHandler(async (req, res) => res.json(await venuesService.availability(String(req.params.id), String(req.query.date)))));

ownerVenueRoutes.use(authenticate, authorize(Roles.VENUE_OWNER));
ownerVenueRoutes.post("/venues", validate(venueInputSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await venuesService.createOwnerVenue(req.user!.id, req.body));
}));
ownerVenueRoutes.put("/venues/:id", validate(venueInputSchema), asyncHandler(async (req, res) => {
  res.json(await venuesService.updateOwnerVenue(req.user!.id, String(req.params.id), req.body));
}));
ownerVenueRoutes.get("/venues", asyncHandler(async (req, res) => res.json(await venuesService.ownerVenues(req.user!.id))));
ownerVenueRoutes.post("/venues/:id/slots", validate(slotInputSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await venuesService.addSlot(req.user!.id, String(req.params.id), req.body));
}));
ownerVenueRoutes.post("/venues/:id/images", upload.array("images", 5), asyncHandler(async (req, res) => {
  const venue = await prisma.venue.findFirst({ where: { id: String(req.params.id), ownerId: req.user!.id } });
  if (!venue) throw new AppError(404, "Venue not found", "VENUE_NOT_FOUND");
  const files = (req.files as Express.Multer.File[]) ?? [];
  const images = await prisma.$transaction(files.map((file) => prisma.venueImage.create({
    data: { venueId: venue.id, bytes: file.buffer, mimeType: file.mimetype }
  })));
  res.status(201).json(images);
}));
ownerVenueRoutes.get("/bookings", asyncHandler(async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { venue: { ownerId: req.user!.id } },
    include: { venue: true, slot: true, user: { select: { id: true, name: true, email: true } }, payment: true },
    orderBy: { createdAt: "desc" }
  });
  res.json(bookings);
}));
