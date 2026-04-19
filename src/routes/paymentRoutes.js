import express from "express";

import {
  createPayment,
  getPayments,
  getPaymentHistoryByAgreement,
} from "../controllers/paymentController.js";
import validateRequest from "../middlewares/validateRequest.js";
import { paymentValidationRules, mongoIdValidationRule } from "../validators/index.js";

const router = express.Router();

router.post("/", paymentValidationRules.create, validateRequest, createPayment);
router.get("/", getPayments);
router.get(
  "/agreement/:agreementId",
  mongoIdValidationRule("agreementId"),
  validateRequest,
  getPaymentHistoryByAgreement
);

export default router;
