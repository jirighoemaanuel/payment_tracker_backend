import nodemailer from "nodemailer";

import Receipt from "../models/Receipt.js";

const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    });
  }

  // This keeps the first version easy to run locally even without email credentials.
  return nodemailer.createTransport({
    jsonTransport: true,
  });
};

const sendReceiptToAdmin = async ({ receipt, agreement, payment }) => {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.log("ADMIN_EMAIL is not set. Skipping receipt email.");
    return receipt;
  }

  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "no-reply@renttracker.local",
      to: adminEmail,
      subject: `New payment receipt - ${receipt.receiptNumber}`,
      text: [
        `Receipt Number: ${receipt.receiptNumber}`,
        `Tenant: ${agreement.tenant.fullName}`,
        `Unit: ${agreement.unit.name}`,
        `Payment Amount: ${payment.amount}`,
        `Agreement Balance: ${agreement.outstandingBalance}`,
      ].join("\n"),
    });

    receipt.status = "sent-to-admin";
    await receipt.save();
  } catch (error) {
    receipt.status = "failed";
    await receipt.save();
    console.error("Failed to send receipt email:", error.message);
  }

  return Receipt.findById(receipt._id)
    .populate("payment")
    .populate("agreement")
    .populate("tenant");
};

export default sendReceiptToAdmin;
