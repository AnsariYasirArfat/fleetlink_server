import { validationResult } from "express-validator";
import CustomError from "../utils/CustomError.js";
import Vehicle from "../models/vehicle.model.js";
import {
  calculateRideDuration,
  verifyVehicleAvailability,
} from "../services/availability.service.js";
import Booking from "../models/booking.model.js";

export const createBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError(errors.array()[0].msg, 400);
  }

  const { vehicleId, fromPincode, toPincode, startTime, customerId } = req.body;

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new CustomError("Vehicle not found!", 404);
  }

  const hours = calculateRideDuration(fromPincode, toPincode);
  const start = new Date(startTime);
  const end = new Date(start.getTime() + hours * 3600 * 1000);

  const available = await verifyVehicleAvailability(vehicleId, start, end);
  if (!available) {
    throw new CustomError(
      "Vehicle is already booked for that time window",
      409
    );
  }

  const booking = await Booking.create({
    vehicleId,
    fromPincode,
    toPincode,
    startTime: start,
    endTime: end,
    customerId,
  });

  return res.status(201).json({ success: true, data: booking });
};
