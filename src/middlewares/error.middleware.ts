import { NextFunction, Request, Response } from "express";
import logger from "../config/logger.config";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/api-error";
import { ZodError } from "zod";

interface IError extends Error {
  statusCode: number;
  message: string;
  name: string;
  stack?: string;
  errors?: any;
  data?: any;
}

const buildError = (params: {
  statusCode: number;
  message: string;
  code?: string;
  details?: Array<{ path: string; message: string }>;
}) => {
  const { statusCode, message, code, details } = params;
  return {
    statusCode,
    body: { success: false, message, error: { code, details } },
  };
};

export const appErrorHandler = (
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err);

  // Zod validation error
  if (err instanceof ZodError) {
    const details = err.errors.map((e: import("zod").ZodIssue) => ({
      path: e.path.join("."),
      message: e.message,
    }));
    const { statusCode, body } = buildError({
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Validation failed",
      code: "ZOD_VALIDATION_ERROR",
      details,
    });
    res.status(statusCode).json(body);
    return;
  }

  // Mongoose validation error
  if (err.name === "ValidationError" && (err as any).errors) {
    const errors = (err as any).errors;
    const details = Object.values(errors).map((e: any) => ({
      path: e.path,
      message: e.message,
    }));
    const { statusCode, body } = buildError({
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Validation failed",
      code: "MONGOOSE_VALIDATION_ERROR",
      details,
    });
    res.status(statusCode).json(body);
    return;
  }

  // Mongo duplicate key or server errors
  if ((err as any).code === 11000) {
    const keys = Object.keys((err as any).keyPattern || {});
    const details = keys.map((k) => ({
      path: k,
      message: `${k} already exists`,
    }));
    const { statusCode, body } = buildError({
      statusCode: StatusCodes.CONFLICT,
      message: "Duplicate key",
      code: "MONGO_DUPLICATE_KEY",
      details,
    });
    res.status(statusCode).json(body);
    return;
  }

  // Custom ApiError
  if (err instanceof ApiError) {
    const { statusCode, body } = buildError({
      statusCode: err.statusCode,
      message: err.message,
      code: err.name,
    });
    res.status(statusCode).json(body);
    return;
  }

  // Fallback
  const { statusCode, body } = buildError({
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: "Internal Server Error",
    code: "INTERNAL_SERVER_ERROR",
  });
  res.status(statusCode).json(body);
  return;
};
