import express from "express";

import {
  createTenant,
  getTenants,
  getTenant,
  updateTenant,
  deleteTenant,
} from "../controllers/tenantController.js";
import validateRequest from "../middlewares/validateRequest.js";
import { tenantValidationRules, mongoIdValidationRule } from "../validators/index.js";

const router = express.Router();

router.post("/", tenantValidationRules.create, validateRequest, createTenant);
router.get("/", getTenants);
router.get("/:id", mongoIdValidationRule("id"), validateRequest, getTenant);
router.put("/:id", tenantValidationRules.update, validateRequest, updateTenant);
router.delete("/:id", mongoIdValidationRule("id"), validateRequest, deleteTenant);

export default router;
