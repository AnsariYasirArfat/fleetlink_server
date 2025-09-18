import { Router } from "express";
import { validateVehicle } from "../middleware/validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createVehicle } from "../controllers/vehicle.controller.js";

const router = Router();
router.post("/", validateVehicle, asyncHandler(createVehicle));

export default router;
