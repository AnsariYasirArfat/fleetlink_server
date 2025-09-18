import { body, query } from "express-validator";

export const validateVehicle = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Vehicle name is required")
    .isLength({ max: 100 }),
  body("capacityKg")
    .isInt({ min: 1, max: 50000 })
    .withMessage("Capacity must be between 1 and 50000"),
  body("tyres")
    .isInt({ min: 4, max: 18 })
    .withMessage("Tyres must be between 4 and 18"),
];

export const validateAvailabilitySearch = [
  query("capacityRequired")
    .isInt({ min: 1, max: 50000 })
    .withMessage("Capacity must be between 1 and 50000"),
  query("fromPincode")
    .matches(/^\d{6}$/)
    .withMessage("fromPincode must be 6 digits"),
  query("toPincode")
    .matches(/^\d{6}$/)
    .withMessage("toPincode must be 6 digits"),
  query("startTime").isISO8601().withMessage("startTime must be ISO 8601"),
];

export const validateBooking = [
  body("vehicleId").isMongoId().withMessage("Valid vehicleId required"),
  body("fromPincode")
    .matches(/^\d{6}$/)
    .withMessage("fromPincode must be 6 digits"),
  body("toPincode")
    .matches(/^\d{6}$/)
    .withMessage("toPincode must be 6 digits"),
  body("startTime").isISO8601().withMessage("startTime must be ISO 8601"),
  body("customerId").trim().notEmpty().withMessage("customerId is required"),
];
