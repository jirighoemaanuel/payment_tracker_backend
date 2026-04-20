import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

import Receipt from "../models/Receipt.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const verifyEmailSetup = async () => {
  const hasAdminEmail = Boolean(process.env.ADMIN_EMAIL);
  const hasSmtpConfig = Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );

  if (!hasAdminEmail) {
    console.log("Email setup: ADMIN_EMAIL is missing, so receipt emails will be skipped.");
    return {
      ready: false,
      mode: "missing-admin-email",
    };
  }

  if (!hasSmtpConfig) {
    console.log(
      "Email setup: SMTP credentials are incomplete. The app will use local JSON transport and will not send real emails."
    );
    return {
      ready: false,
      mode: "json-transport",
    };
  }

  const transporter = createTransporter();

  try {
    await transporter.verify();
    console.log(`Email setup: SMTP connection verified for ${process.env.SMTP_USER}.`);
    return {
      ready: true,
      mode: "smtp",
    };
  } catch (error) {
    console.error(`Email setup: SMTP verification failed - ${error.message}`);
    return {
      ready: false,
      mode: "smtp-error",
      error,
    };
  }
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
      attachments: receipt.pdfPath
        ? [
            {
              filename: `${receipt.receiptNumber}.pdf`,
              path: path.resolve(__dirname, "../../", receipt.pdfPath),
            },
          ]
        : [],
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
export { verifyEmailSetup };
