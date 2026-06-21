import { NextFunction, Request, Response } from "express";
import { Role } from "../types/domain";
import { AppError } from "../utils/app-error";
import { verifyAccessToken } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
      };
    }
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw new AppError(401, "Missing access token", "UNAUTHORIZED");
    console.log("udoysdy8stfsdiufsidutf"+header)
  req.user = verifyAccessToken(header.slice(7));

  next();
};

export const authorize =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw new AppError(401, "Authentication required", "UNAUTHORIZED");
    if (!roles.includes(req.user.role)) throw new AppError(403, "Insufficient permissions", "FORBIDDEN");
    next();
  };
