import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message, code: err.code });
  }

  if ("code" in err && err.code === "P2002") {
    return res.status(409).json({ message: "Resource already exists", code: "UNIQUE_CONSTRAINT" });
  }

  if (err.name === "ZodError") {
    return res.status(400).json({ message: "Invalid request payload", code: "VALIDATION_ERROR" });
  }

  const status = err.name === "JsonWebTokenError" ? 401 : 500;
  const message = status === 500 ? "Internal server error" : "Invalid token";
  return res.status(status).json({ message, code: status === 500 ? "INTERNAL_ERROR" : "UNAUTHORIZED" });
};
