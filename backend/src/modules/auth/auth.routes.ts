import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authController } from "./auth.controller";
import { loginSchema, refreshSchema, registerSchema } from "./auth.schemas";

export const authRoutes = Router();

authRoutes.post("/register", validate(registerSchema), authController.register);
authRoutes.post("/login", validate(loginSchema), authController.login);
authRoutes.post("/refresh", validate(refreshSchema), authController.refresh);
authRoutes.post("/logout", validate(refreshSchema), authController.logout);
