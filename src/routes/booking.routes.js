import { Router } from "express";
import { validateBooking } from "../middleware/validation.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createBooking } from "../controllers/booking.controller.js";

const router = Router();

router.post("/", validateBooking, asyncHandler(createBooking));

export default router;
