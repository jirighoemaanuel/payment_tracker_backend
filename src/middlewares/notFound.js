import { StatusCodes } from "http-status-codes";

import sendResponse from "../utils/sendResponse.js";

const notFound = (req, res) => {
  return sendResponse(res, {
    statusCode: StatusCodes.NOT_FOUND,
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    data: null,
  });
};

export default notFound;
