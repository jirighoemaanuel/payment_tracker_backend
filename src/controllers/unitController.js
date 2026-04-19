import { StatusCodes } from "http-status-codes";

import Unit from "../models/Unit.js";
import asyncHandler from "../utils/asyncHandler.js";
import sendResponse from "../utils/sendResponse.js";

const createUnit = asyncHandler(async (req, res) => {
  const unit = await Unit.create(req.body);

  return sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    message: "Unit created successfully",
    data: unit,
  });
});

const getUnits = asyncHandler(async (req, res) => {
  const units = await Unit.find().sort({ createdAt: -1 });

  return sendResponse(res, {
    message: "Units fetched successfully",
    data: units,
  });
});

const getUnit = asyncHandler(async (req, res) => {
  const unit = await Unit.findById(req.params.id);

  if (!unit) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Unit not found",
      data: null,
    });
  }

  return sendResponse(res, {
    message: "Unit fetched successfully",
    data: unit,
  });
});

const updateUnit = asyncHandler(async (req, res) => {
  const unit = await Unit.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!unit) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Unit not found",
      data: null,
    });
  }

  return sendResponse(res, {
    message: "Unit updated successfully",
    data: unit,
  });
});

const deleteUnit = asyncHandler(async (req, res) => {
  const unit = await Unit.findByIdAndDelete(req.params.id);

  if (!unit) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Unit not found",
      data: null,
    });
  }

  return sendResponse(res, {
    message: "Unit deleted successfully",
    data: unit,
  });
});

export {
  createUnit,
  getUnits,
  getUnit,
  updateUnit,
  deleteUnit,
};
