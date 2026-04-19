import { StatusCodes } from "http-status-codes";

import sendResponse from "../utils/sendResponse.js";

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

  if (err.name === "ValidationError") {
    return sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: err.message,
      data: null,
    });
  }

  if (err.name === "CastError") {
    return sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: "Invalid resource id",
      data: null,
    });
  }

  if (err.code === 11000) {
    return sendResponse(res, {
      statusCode: StatusCodes.BAD_REQUEST,
      success: false,
      message: "A record with one of these values already exists",
      data: null,
    });
  }

  return sendResponse(res, {
    statusCode,
    success: false,
    message: err.message || "Something went wrong",
    data: null,
  });
};

export default errorHandler;
