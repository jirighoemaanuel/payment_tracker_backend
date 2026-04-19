import express from "express";

import {
  createUnit,
  getUnits,
  getUnit,
  updateUnit,
  deleteUnit,
} from "../controllers/unitController.js";
import validateRequest from "../middlewares/validateRequest.js";
import { unitValidationRules, mongoIdValidationRule } from "../validators/index.js";

const router = express.Router();

router.post("/", unitValidationRules.create, validateRequest, createUnit);
router.get("/", getUnits);
router.get("/:id", mongoIdValidationRule("id"), validateRequest, getUnit);
router.put("/:id", unitValidationRules.update, validateRequest, updateUnit);
router.delete("/:id", mongoIdValidationRule("id"), validateRequest, deleteUnit);

export default router;
