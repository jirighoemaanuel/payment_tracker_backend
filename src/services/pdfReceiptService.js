import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import amountToWords from "../utils/amountToWords.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_PATH = path.resolve(__dirname, "../../assets/receipt-template.pdf");
const OUTPUT_DIRECTORY = path.resolve(__dirname, "../../uploads/receipts");
const TEMPLATE_COLOR = rgb(0.06, 0.25, 0.6);

const fitText = (text = "", maxLength = 70) => {
  if (text.length <= maxLength) {
    return [text];
  }

  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;

    if (testLine.length > maxLength) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 2);
};

const formatDate = (dateValue) => {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateValue));
};

const formatPeriod = (agreement, payment) => {
  const start = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(agreement.startDate));

  const end = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(agreement.endDate));

  const paymentType = agreement.paymentType
    ? agreement.paymentType.charAt(0).toUpperCase() + agreement.paymentType.slice(1)
    : "Rent";

  return `${paymentType} rent from ${start} to ${end} (paid ${formatDate(payment.paymentDate)})`;
};

const formatMoneyParts = (amount) => {
  const safeAmount = Number(amount) || 0;
  const whole = Math.floor(safeAmount);
  const decimal = Math.round((safeAmount - whole) * 100);

  return {
    whole: whole.toLocaleString("en-NG"),
    decimal: decimal.toString().padStart(2, "0"),
  };
};

const generateReceiptPdf = async ({ receipt, agreement, payment }) => {
  const templateBytes = await readFile(TEMPLATE_PATH);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const page = pdfDoc.getPage(0);
  const pageHeight = page.getHeight();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const drawText = (text, x, y, options = {}) => {
    page.drawText(String(text ?? ""), {
      x,
      y: pageHeight - y,
      size: options.size || 15,
      font: options.bold ? boldFont : font,
      color: options.color || TEMPLATE_COLOR,
    });
  };

  const amountWords = amountToWords(payment.amount);
  const amountWordsLines = fitText(
    `${amountWords.nairaWords} naira only`,
    56
  );
  const paidAmountParts = formatMoneyParts(payment.amount);
  const balanceAmountParts = formatMoneyParts(agreement.outstandingBalance);
  const receiptCode = receipt.receiptNumber.replace("RCT-", "").slice(-4);

  drawText(receiptCode, 732, 120, { size: 18, bold: true, color: rgb(0.1, 0.1, 0.1) });
  drawText(formatDate(receipt.issuedAt), 590, 208, { size: 15 });
  drawText(agreement.tenant.fullName, 210, 278, { size: 17 });
  drawText(amountWordsLines[0], 170, 352, { size: 16 });

  if (amountWordsLines[1]) {
    drawText(amountWordsLines[1], 160, 394, { size: 16 });
  }

  drawText(amountWords.decimalAmount.toString().padStart(2, "0"), 735, 394, { size: 16 });
  drawText(formatPeriod(agreement, payment), 355, 442, { size: 15 });
  drawText(paidAmountParts.whole, 183, 525, { size: 20, bold: true });
  drawText(paidAmountParts.decimal, 365, 525, { size: 18, bold: true });
  drawText(balanceAmountParts.whole, 582, 525, { size: 20, bold: true });
  drawText(balanceAmountParts.decimal, 763, 525, { size: 18, bold: true });

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
