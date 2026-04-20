import Receipt from "../models/Receipt.js";
import generateReceiptNumber from "../utils/generateReceiptNumber.js";
import generateReceiptPdf from "./pdfReceiptService.js";

const createReceipt = async ({ payment, agreement }) => {
  const receipt = await Receipt.create({
    payment: payment._id,
    agreement: agreement._id,
    tenant: agreement.tenant._id,
    receiptNumber: generateReceiptNumber(),
    amount: payment.amount,
  });

  const pdfFile = await generateReceiptPdf({
    receipt,
    agreement,
    payment,
  });

  receipt.pdfPath = pdfFile.relativeFilePath;
  await receipt.save();

  return Receipt.findById(receipt._id)
    .populate("payment")
    .populate("agreement")
    .populate("tenant");
};

export default createReceipt;
