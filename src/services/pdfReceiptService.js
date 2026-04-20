import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import amountToWords from "../utils/amountToWords.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIRECTORY = path.resolve(__dirname, "../../uploads/receipts");

const COLORS = {
  primary: rgb(0.08, 0.34, 0.72),
  primaryLight: rgb(0.93, 0.96, 1),
  accent: rgb(0.95, 0.57, 0.14),
  text: rgb(0.15, 0.2, 0.28),
  muted: rgb(0.42, 0.48, 0.58),
  border: rgb(0.84, 0.88, 0.94),
  success: rgb(0.1, 0.55, 0.28),
  white: rgb(1, 1, 1),
};

const PAGE = {
  width: 595,
  height: 842,
  margin: 40,
};

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const formatDateTime = (value) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const formatCurrency = (value) =>
  `NGN ${Number(value || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const toTitleCase = (value = "") =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const buildCoverageText = (agreement) =>
  `${formatDate(agreement.startDate)} to ${formatDate(agreement.endDate)}`;

const wrapText = (text, font, size, maxWidth) => {
  if (!text) {
    return [""];
  }

  const words = String(text).split(/\s+/);
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, size);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

const drawWrappedText = (page, text, x, topY, options) => {
  const {
    font,
    size,
    color = COLORS.text,
    maxWidth,
    lineHeight = size + 4,
  } = options;

  const lines = wrapText(text, font, size, maxWidth);

  lines.forEach((line, index) => {
    page.drawText(line, {
      x,
      y: topY - size - index * lineHeight,
      size,
      font,
      color,
    });
  });

  return lines.length;
};

const drawLabelValue = (page, label, value, x, topY, width, fonts, options = {}) => {
  const labelSize = options.labelSize || 9;
  const valueSize = options.valueSize || 12;

  page.drawText(label, {
    x,
    y: topY - labelSize,
    size: labelSize,
    font: fonts.bold,
    color: COLORS.muted,
  });

  const linesUsed = drawWrappedText(page, value || "-", x, topY - 16, {
    font: fonts.regular,
    size: valueSize,
    maxWidth: width,
    color: COLORS.text,
    lineHeight: valueSize + 4,
  });

  return topY - 20 - linesUsed * (valueSize + 4);
};

const drawSection = (page, title, topY, height) => {
  const x = PAGE.margin;
  const width = PAGE.width - PAGE.margin * 2;

  page.drawRectangle({
    x,
    y: topY - height,
    width,
    height,
    color: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
  });

  page.drawText(title, {
    x: x + 18,
    y: topY - 24,
    size: 12,
    color: COLORS.primary,
    font: page.docFonts.bold,
  });

  return {
    x,
    y: topY,
    width,
    height,
  };
};

const drawHouseMark = (page, x, y) => {
  page.drawRectangle({
    x,
    y,
    width: 36,
    height: 24,
    color: COLORS.white,
    borderColor: COLORS.white,
    borderWidth: 2,
  });

  page.drawLine({
    start: { x: x - 4, y: y + 24 },
    end: { x: x + 18, y: y + 42 },
    color: COLORS.white,
    thickness: 3,
  });

  page.drawLine({
    start: { x: x + 18, y: y + 42 },
    end: { x: x + 40, y: y + 24 },
    color: COLORS.white,
    thickness: 3,
  });

  page.drawRectangle({
    x: x + 14,
    y,
    width: 8,
    height: 12,
    color: COLORS.primary,
    borderColor: COLORS.white,
    borderWidth: 2,
  });
};

const generateReceiptPdf = async ({ receipt, agreement, payment }) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE.width, PAGE.height]);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  page.docFonts = { regular, bold };

  const amountWords = amountToWords(payment.amount);
  const amountInWords = `${amountWords.nairaWords} naira and ${amountWords.koboWords} kobo only`;

  page.drawRectangle({
    x: 0,
    y: PAGE.height - 140,
    width: PAGE.width,
    height: 140,
    color: COLORS.primary,
  });

  page.drawRectangle({
    x: PAGE.margin,
    y: PAGE.height - 176,
    width: PAGE.width - PAGE.margin * 2,
    height: 72,
    color: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 18,
  });

  drawHouseMark(page, PAGE.margin + 18, PAGE.height - 84);

  page.drawText("BIG JOHNNY MINI ESTATE", {
    x: PAGE.margin + 70,
    y: PAGE.height - 52,
    size: 24,
    font: bold,
    color: COLORS.white,
  });

  page.drawText("No 6 Estate Rd, Beach Koko, Delta State", {
    x: PAGE.margin + 70,
    y: PAGE.height - 78,
    size: 13,
    font: regular,
    color: COLORS.white,
  });

  page.drawText("08160272905  |  07064224272", {
    x: PAGE.margin + 70,
    y: PAGE.height - 98,
    size: 11,
    font: regular,
    color: COLORS.white,
  });

  page.drawText("RENT PAYMENT RECEIPT", {
    x: PAGE.margin + 22,
    y: PAGE.height - 145,
    size: 20,
    font: bold,
    color: COLORS.primary,
  });

  page.drawText("Status: Payment Recorded", {
    x: PAGE.width - PAGE.margin - 152,
    y: PAGE.height - 146,
    size: 11,
    font: bold,
    color: COLORS.success,
  });

  page.drawText(receipt.receiptNumber, {
    x: PAGE.width - PAGE.margin - 145,
    y: PAGE.height - 62,
    size: 16,
    font: bold,
    color: COLORS.accent,
  });

  page.drawText("Receipt Number", {
    x: PAGE.width - PAGE.margin - 145,
    y: PAGE.height - 82,
    size: 9,
    font: regular,
    color: COLORS.white,
  });

  const heroTop = PAGE.height - 192;
  const heroHeight = 108;

  page.drawRectangle({
    x: PAGE.margin,
    y: heroTop - heroHeight,
    width: PAGE.width - PAGE.margin * 2,
    height: heroHeight,
    color: COLORS.primaryLight,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
  });

  page.drawText("Amount Paid", {
    x: PAGE.margin + 22,
    y: heroTop - 22,
    size: 10,
    font: bold,
    color: COLORS.muted,
  });

  page.drawText(formatCurrency(payment.amount), {
    x: PAGE.margin + 22,
    y: heroTop - 54,
    size: 26,
    font: bold,
    color: COLORS.primary,
  });

  page.drawText("Outstanding Balance", {
    x: PAGE.margin + 22,
    y: heroTop - 80,
    size: 10,
    font: bold,
    color: COLORS.muted,
  });

  page.drawText(formatCurrency(agreement.outstandingBalance), {
    x: PAGE.margin + 150,
    y: heroTop - 80,
    size: 12,
    font: bold,
    color: COLORS.text,
  });

  page.drawRectangle({
    x: PAGE.width - PAGE.margin - 160,
    y: heroTop - 78,
    width: 138,
    height: 52,
    color: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
  });

  page.drawText("Payment Date", {
    x: PAGE.width - PAGE.margin - 144,
    y: heroTop - 42,
    size: 9,
    font: bold,
    color: COLORS.muted,
  });

  page.drawText(formatDate(payment.paymentDate), {
    x: PAGE.width - PAGE.margin - 144,
    y: heroTop - 63,
    size: 12,
    font: bold,
    color: COLORS.text,
  });

  let currentTop = heroTop - heroHeight - 18;

  const detailsSection = drawSection(page, "Tenant and Property Details", currentTop, 160);
  const detailsTop = detailsSection.y - 44;
  const leftX = detailsSection.x + 18;
  const rightX = detailsSection.x + detailsSection.width / 2 + 8;
  const columnWidth = detailsSection.width / 2 - 30;

  drawLabelValue(page, "Tenant Name", agreement.tenant.fullName, leftX, detailsTop, columnWidth, page.docFonts);
  drawLabelValue(page, "Phone", agreement.tenant.phone || "-", leftX, detailsTop - 52, columnWidth, page.docFonts);
  drawLabelValue(page, "Unit", agreement.unit.name, rightX, detailsTop, columnWidth, page.docFonts);
  drawLabelValue(
    page,
    "Unit Category",
    agreement.unit.category || "-",
    rightX,
    detailsTop - 52,
    columnWidth,
    page.docFonts
  );

  currentTop -= 178;

  const paymentSection = drawSection(page, "Payment Details", currentTop, 182);
  const paymentTop = paymentSection.y - 44;

  drawLabelValue(page, "Payment Method", toTitleCase(payment.paymentMethod), leftX, paymentTop, columnWidth, page.docFonts);
  drawLabelValue(page, "Payment Type", toTitleCase(agreement.paymentType), leftX, paymentTop - 52, columnWidth, page.docFonts);
  drawLabelValue(page, "Amount Due", formatCurrency(agreement.amountDue), leftX, paymentTop - 104, columnWidth, page.docFonts);

  drawLabelValue(page, "Total Paid So Far", formatCurrency(agreement.totalPaid), rightX, paymentTop, columnWidth, page.docFonts);
  drawLabelValue(
    page,
    "Agreement Balance",
    formatCurrency(agreement.outstandingBalance),
    rightX,
    paymentTop - 52,
    columnWidth,
    page.docFonts
  );
  drawLabelValue(
    page,
    "Reference",
    String(agreement._id || receipt.receiptNumber),
    rightX,
    paymentTop - 104,
    columnWidth,
    page.docFonts
  );

  currentTop -= 200;

  const coverageSection = drawSection(page, "Coverage and Notes", currentTop, 170);
  const coverageTop = coverageSection.y - 44;

  drawLabelValue(
    page,
    "Rent Period Covered",
    buildCoverageText(agreement),
    leftX,
    coverageTop,
    detailsSection.width - 36,
    page.docFonts
  );

  drawLabelValue(
    page,
    "Amount in Words",
    amountInWords,
    leftX,
    coverageTop - 56,
    detailsSection.width - 36,
    page.docFonts,
    { valueSize: 11 }
  );

  drawLabelValue(
    page,
    "Payment Note",
    payment.note || "No additional note provided.",
    leftX,
    coverageTop - 112,
    detailsSection.width - 36,
    page.docFonts,
    { valueSize: 11 }
  );

  page.drawText("Generated by Big Johnny Mini Estate Rent Tracker", {
    x: PAGE.margin,
    y: 34,
    size: 9,
    font: regular,
    color: COLORS.muted,
  });

  page.drawText(`Issued ${formatDateTime(receipt.issuedAt)}`, {
    x: PAGE.width - PAGE.margin - 150,
    y: 34,
    size: 9,
    font: regular,
    color: COLORS.muted,
  });

  await mkdir(OUTPUT_DIRECTORY, { recursive: true });

  const fileName = `${receipt.receiptNumber}.pdf`;
  const absoluteFilePath = path.join(OUTPUT_DIRECTORY, fileName);
  const relativeFilePath = path.posix.join("uploads", "receipts", fileName);

  const pdfBytes = await pdfDoc.save();
  await writeFile(absoluteFilePath, pdfBytes);

  return {
    absoluteFilePath,
    relativeFilePath,
  };
};

export default generateReceiptPdf;
