import { body, param } from "express-validator";

const mongoIdValidationRule = (fieldName) =>
  param(fieldName).isMongoId().withMessage(`${fieldName} must be a valid MongoDB id`);

const tenantValidationRules = {
  create: [
    body("fullName").notEmpty().withMessage("fullName is required"),
    body("phone").notEmpty().withMessage("phone is required"),
    body("email")
      .optional({ values: "falsy" })
      .isEmail()
      .withMessage("email must be valid"),
    body("alternateName").optional().isString().withMessage("alternateName must be a string"),
    body("notes").optional().isString().withMessage("notes must be a string"),
  ],
  update: [
    mongoIdValidationRule("id"),
    body("fullName").optional().notEmpty().withMessage("fullName cannot be empty"),
    body("phone").optional().notEmpty().withMessage("phone cannot be empty"),
    body("email")
      .optional({ values: "falsy" })
      .isEmail()
      .withMessage("email must be valid"),
    body("alternateName").optional().isString().withMessage("alternateName must be a string"),
    body("notes").optional().isString().withMessage("notes must be a string"),
  ],
};

const unitValidationRules = {
  create: [
    body("name").notEmpty().withMessage("name is required"),
    body("category").notEmpty().withMessage("category is required"),
    body("description").optional().isString().withMessage("description must be a string"),
    body("rentAmount").isFloat({ min: 0 }).withMessage("rentAmount must be a positive number"),
    body("status")
      .optional()
      .isIn(["available", "occupied", "maintenance"])
      .withMessage("status is invalid"),
  ],
  update: [
    mongoIdValidationRule("id"),
    body("name").optional().notEmpty().withMessage("name cannot be empty"),
    body("category").optional().notEmpty().withMessage("category cannot be empty"),
    body("description").optional().isString().withMessage("description must be a string"),
    body("rentAmount").optional().isFloat({ min: 0 }).withMessage("rentAmount must be a positive number"),
    body("status")
      .optional()
      .isIn(["available", "occupied", "maintenance"])
      .withMessage("status is invalid"),
  ],
};

const agreementValidationRules = {
  create: [
    body("tenant").isMongoId().withMessage("tenant must be a valid MongoDB id"),
    body("unit").isMongoId().withMessage("unit must be a valid MongoDB id"),
    body("paymentType")
      .isIn(["monthly", "quarterly", "yearly", "custom"])
      .withMessage("paymentType is invalid"),
    body("startDate").isISO8601().withMessage("startDate must be a valid date"),
    body("endDate").isISO8601().withMessage("endDate must be a valid date"),
    body("amountDue").isFloat({ min: 0 }).withMessage("amountDue must be a positive number"),
    body("status")
      .optional()
      .isIn(["active", "completed", "overdue", "cancelled"])
      .withMessage("status is invalid"),
    body("reminderSettings.enabled")
      .optional()
      .isBoolean()
      .withMessage("reminderSettings.enabled must be true or false"),
    body("reminderSettings.daysBeforeDue")
      .optional()
      .isInt({ min: 0 })
      .withMessage("reminderSettings.daysBeforeDue must be 0 or more"),
  ],
  update: [
    mongoIdValidationRule("id"),
    body("tenant").optional().isMongoId().withMessage("tenant must be a valid MongoDB id"),
    body("unit").optional().isMongoId().withMessage("unit must be a valid MongoDB id"),
    body("paymentType")
      .optional()
      .isIn(["monthly", "quarterly", "yearly", "custom"])
      .withMessage("paymentType is invalid"),
    body("startDate").optional().isISO8601().withMessage("startDate must be a valid date"),
    body("endDate").optional().isISO8601().withMessage("endDate must be a valid date"),
    body("amountDue").optional().isFloat({ min: 0 }).withMessage("amountDue must be a positive number"),
    body("status")
      .optional()
      .isIn(["active", "completed", "overdue", "cancelled"])
      .withMessage("status is invalid"),
    body("reminderSettings.enabled")
      .optional()
      .isBoolean()
      .withMessage("reminderSettings.enabled must be true or false"),
    body("reminderSettings.daysBeforeDue")
      .optional()
      .isInt({ min: 0 })
      .withMessage("reminderSettings.daysBeforeDue must be 0 or more"),
  ],
};

const paymentValidationRules = {
  create: [
    body("agreement").isMongoId().withMessage("agreement must be a valid MongoDB id"),
    body("amount").isFloat({ min: 0.01 }).withMessage("amount must be greater than 0"),
    body("paymentDate").optional().isISO8601().withMessage("paymentDate must be a valid date"),
    body("paymentMethod")
      .optional()
      .isIn(["cash", "bank-transfer", "card", "mobile-money", "other"])
      .withMessage("paymentMethod is invalid"),
    body("note").optional().isString().withMessage("note must be a string"),
  ],
};

export {
  mongoIdValidationRule,
  tenantValidationRules,
  unitValidationRules,
  agreementValidationRules,
  paymentValidationRules,
};
