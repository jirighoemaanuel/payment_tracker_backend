import { customAlphabet } from "nanoid";

const randomCode = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);

const generateReceiptNumber = () => {
  return `RCT-${randomCode()}`;
};

export default generateReceiptNumber;
