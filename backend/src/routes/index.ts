import { Router } from "express";
import { adminRoutes } from "../modules/admin/admin.routes";
import { analyticsRoutes } from "../modules/analytics/analytics.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { bookingsRoutes } from "../modules/bookings/bookings.routes";
import { paymentsRoutes } from "../modules/payments/payments.routes";
import { usersRoutes } from "../modules/users/users.routes";
import { ownerVenueRoutes, venuesRoutes } from "../modules/venues/venues.routes";

export const apiRoutes = Router();

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/users", usersRoutes);
apiRoutes.use("/venues", venuesRoutes);
apiRoutes.use("/bookings", bookingsRoutes);
apiRoutes.use("/payments", paymentsRoutes);
apiRoutes.use("/owner", ownerVenueRoutes);
apiRoutes.use("/admin", adminRoutes);
apiRoutes.use("/analytics", analyticsRoutes);
