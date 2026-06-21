import { NextFunction, Request, Response } from "express";

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
    (req: Request, res: Response, next: NextFunction) => {
      console.log("🚀 [ASYNC HANDLER] Wrapping function:", fn.name);
      Promise.resolve(fn(req, res, next)).catch(next);
    };
