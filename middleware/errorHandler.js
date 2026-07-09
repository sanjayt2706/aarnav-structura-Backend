import logger from "../config/logger.js";
import { validationResult } from "express-validator";

// Wrap async route handlers so thrown errors reach errorHandler instead of crashing the process.
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Call this at the top of a controller after express-validator rules run.
export function checkValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ success: false, message: "Validation failed", errors: errors.array() });
    return true; // caller should `return` if this is true
  }
  return false;
}

export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  logger.error(`${req.method} ${req.originalUrl} — ${err.message}\n${err.stack}`);

  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === "production" && status === 500 ? "Internal server error" : err.message;

  res.status(status).json({ success: false, message });
}
