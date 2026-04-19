import { validationResult } from "express-validator";
import { StatusCodes } from "http-status-codes";

import sendResponse from "../utils/sendResponse.js";

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: "Validation failed",
      data: errors.array(),
    });
  }

  next();
};

export default validateRequest;
