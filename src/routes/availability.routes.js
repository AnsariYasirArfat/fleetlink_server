import { Router } from "express";
import { validateAvailabilitySearch } from "../middleware/validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getAvailableVehicles } from "../controllers/availability.controller.js";

const router = Router();
router.get(
  "/available",
  validateAvailabilitySearch,
  asyncHandler(getAvailableVehicles)
);

export default router;
