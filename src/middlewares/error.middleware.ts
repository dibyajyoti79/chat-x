import { NextFunction, Request, Response } from "express";
import logger from "../config/logger.config";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/api-error";

export const appErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    logger.error(err);

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    logger.error(err);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
