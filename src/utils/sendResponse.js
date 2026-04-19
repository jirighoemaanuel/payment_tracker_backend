import { StatusCodes } from "http-status-codes";

const sendResponse = (
  res,
  {
    statusCode = StatusCodes.OK,
    success = true,
    message = "Request completed successfully",
    data = null,
  }
) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
  });
};

export default sendResponse;
