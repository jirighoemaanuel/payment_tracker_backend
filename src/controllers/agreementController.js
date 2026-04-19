import { StatusCodes } from "http-status-codes";

import Agreement from "../models/Agreement.js";
import Tenant from "../models/Tenant.js";
import Unit from "../models/Unit.js";
import asyncHandler from "../utils/asyncHandler.js";
import sendResponse from "../utils/sendResponse.js";

const createAgreement = asyncHandler(async (req, res) => {
  const { tenant, unit, amountDue } = req.body;

  const tenantExists = await Tenant.findById(tenant);
  if (!tenantExists) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Tenant not found",
      data: null,
    });
  }

  const unitExists = await Unit.findById(unit);
  if (!unitExists) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Unit not found",
      data: null,
    });
  }

  const agreement = await Agreement.create({
    ...req.body,
    totalPaid: 0,
    outstandingBalance: amountDue,
  });

  const populatedAgreement = await Agreement.findById(agreement._id)
    .populate("tenant")
    .populate("unit");

  return sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    message: "Agreement created successfully",
    data: populatedAgreement,
  });
});

const getAgreements = asyncHandler(async (req, res) => {
  const agreements = await Agreement.find()
    .populate("tenant")
    .populate("unit")
    .sort({ createdAt: -1 });

  return sendResponse(res, {
    message: "Agreements fetched successfully",
    data: agreements,
  });
});

const getAgreement = asyncHandler(async (req, res) => {
  const agreement = await Agreement.findById(req.params.id)
    .populate("tenant")
    .populate("unit");

  if (!agreement) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Agreement not found",
      data: null,
    });
  }

  return sendResponse(res, {
    message: "Agreement fetched successfully",
    data: agreement,
  });
});

const updateAgreement = asyncHandler(async (req, res) => {
  const agreement = await Agreement.findById(req.params.id);

  if (!agreement) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Agreement not found",
      data: null,
    });
  }

  if (req.body.tenant) {
    const tenantExists = await Tenant.findById(req.body.tenant);
    if (!tenantExists) {
      return sendResponse(res, {
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: "Tenant not found",
        data: null,
      });
    }
  }

  if (req.body.unit) {
    const unitExists = await Unit.findById(req.body.unit);
    if (!unitExists) {
      return sendResponse(res, {
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: "Unit not found",
        data: null,
      });
    }
  }

  Object.assign(agreement, req.body);

  if (typeof req.body.amountDue === "number") {
    agreement.outstandingBalance = Math.max(
      req.body.amountDue - agreement.totalPaid,
      0
    );
  }

  await agreement.save();

  const updatedAgreement = await Agreement.findById(agreement._id)
    .populate("tenant")
    .populate("unit");

  return sendResponse(res, {
    message: "Agreement updated successfully",
    data: updatedAgreement,
  });
});

const deleteAgreement = asyncHandler(async (req, res) => {
  const agreement = await Agreement.findByIdAndDelete(req.params.id);

  if (!agreement) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Agreement not found",
      data: null,
    });
  }

  return sendResponse(res, {
    message: "Agreement deleted successfully",
    data: agreement,
  });
});

export {
  createAgreement,
  getAgreements,
  getAgreement,
  updateAgreement,
  deleteAgreement,
};
