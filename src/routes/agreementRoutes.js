import express from "express";

import {
  createAgreement,
  getAgreements,
  getAgreement,
  updateAgreement,
  deleteAgreement,
} from "../controllers/agreementController.js";
import validateRequest from "../middlewares/validateRequest.js";
import { agreementValidationRules, mongoIdValidationRule } from "../validators/index.js";

const router = express.Router();

router.post("/", agreementValidationRules.create, validateRequest, createAgreement);
router.get("/", getAgreements);
router.get("/:id", mongoIdValidationRule("id"), validateRequest, getAgreement);
router.put("/:id", agreementValidationRules.update, validateRequest, updateAgreement);
router.delete("/:id", mongoIdValidationRule("id"), validateRequest, deleteAgreement);

export default router;
