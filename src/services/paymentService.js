import { StatusCodes } from "http-status-codes";

import Agreement from "../models/Agreement.js";
import Payment from "../models/Payment.js";
import Receipt from "../models/Receipt.js";
import createReceipt from "./receiptService.js";
import sendReceiptToAdmin from "./emailService.js";

const recordAgreementPayment = async (paymentPayload) => {
  const agreement = await Agreement.findById(paymentPayload.agreement)
    .populate("tenant")
    .populate("unit");

  if (!agreement) {
    const error = new Error("Agreement not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  const payment = await Payment.create(paymentPayload);

  agreement.totalPaid += payment.amount;
  agreement.outstandingBalance = Math.max(agreement.amountDue - agreement.totalPaid, 0);

  if (agreement.outstandingBalance === 0) {
    agreement.status = "completed";
  }

  await agreement.save();

  const receipt = await createReceipt({
    payment,
    agreement,
  });

  const emailedReceipt = await sendReceiptToAdmin({
    receipt,
    agreement,
    payment,
  });

  const updatedAgreement = await Agreement.findById(agreement._id)
    .populate("tenant")
    .populate("unit");

  return {
    payment,
    receipt: emailedReceipt,
    agreement: updatedAgreement,
  };
};

const getAgreementPaymentHistory = async (agreementId) => {
  const agreement = await Agreement.findById(agreementId)
    .populate("tenant")
    .populate("unit");

  if (!agreement) {
    const error = new Error("Agreement not found");
    error.statusCode = StatusCodes.NOT_FOUND;
    throw error;
  }

  const payments = await Payment.find({ agreement: agreementId }).sort({ paymentDate: -1 });
  const receipts = await Receipt.find({ agreement: agreementId }).sort({ issuedAt: -1 });

  return {
    agreement,
    payments,
    receipts,
  };
};

export {
  recordAgreementPayment,
  getAgreementPaymentHistory,
};
