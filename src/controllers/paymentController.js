import { StatusCodes } from "http-status-codes";

import Payment from "../models/Payment.js";
import asyncHandler from "../utils/asyncHandler.js";
import sendResponse from "../utils/sendResponse.js";
import {
  recordAgreementPayment,
  getAgreementPaymentHistory,
} from "../services/paymentService.js";

const createPayment = asyncHandler(async (req, res) => {
  const result = await recordAgreementPayment(req.body);

  return sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    message: "Payment recorded successfully",
    data: result,
  });
});

const getPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate({
      path: "agreement",
      populate: [
        { path: "tenant" },
        { path: "unit" },
      ],
    })
    .sort({ paymentDate: -1 });

  return sendResponse(res, {
    message: "Payments fetched successfully",
    data: payments,
  });
});

const getPaymentHistoryByAgreement = asyncHandler(async (req, res) => {
  const paymentHistory = await getAgreementPaymentHistory(req.params.agreementId);

  return sendResponse(res, {
    message: "Payment history fetched successfully",
    data: paymentHistory,
  });
});

export {
  createPayment,
  getPayments,
  getPaymentHistoryByAgreement,
};
