import { StatusCodes } from "http-status-codes";

import Tenant from "../models/Tenant.js";
import asyncHandler from "../utils/asyncHandler.js";
import sendResponse from "../utils/sendResponse.js";

const normalizeTenantPayload = (payload) => {
  const normalizedPayload = { ...payload };

  // Email is optional, so an empty value should not block tenant creation or updates.
  if (typeof normalizedPayload.email === "string" && normalizedPayload.email.trim() === "") {
    normalizedPayload.email = "";
  }

  return normalizedPayload;
};

const createTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.create(normalizeTenantPayload(req.body));

  return sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    message: "Tenant created successfully",
    data: tenant,
  });
});

const getTenants = asyncHandler(async (req, res) => {
  const tenants = await Tenant.find().sort({ createdAt: -1 });

  return sendResponse(res, {
    message: "Tenants fetched successfully",
    data: tenants,
  });
});

const getTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.params.id);

  if (!tenant) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Tenant not found",
      data: null,
    });
  }

  return sendResponse(res, {
    message: "Tenant fetched successfully",
    data: tenant,
  });
});

const updateTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findByIdAndUpdate(
    req.params.id,
    normalizeTenantPayload(req.body),
    {
    new: true,
    runValidators: true,
    }
  );

  if (!tenant) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Tenant not found",
      data: null,
    });
  }

  return sendResponse(res, {
    message: "Tenant updated successfully",
    data: tenant,
  });
});

const deleteTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findByIdAndDelete(req.params.id);

  if (!tenant) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: "Tenant not found",
      data: null,
    });
  }

  return sendResponse(res, {
    message: "Tenant deleted successfully",
    data: tenant,
  });
});

export {
  createTenant,
  getTenants,
  getTenant,
  updateTenant,
  deleteTenant,
};
