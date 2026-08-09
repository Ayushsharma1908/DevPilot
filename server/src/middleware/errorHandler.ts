import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    logger.error("request failed", { path: req.path, code: err.code, status: err.status, message: err.message });
    res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
    return;
  }

  const message = err instanceof Error ? err.message : "Unknown error";
  logger.error("unhandled error", { path: req.path, message });
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong.", details: undefined } });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: { code: "NOT_FOUND", message: `No route for ${req.method} ${req.path}` } });
}
