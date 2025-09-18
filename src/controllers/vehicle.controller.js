import { validationResult } from "express-validator";
import CustomError from "../utils/CustomError.js";
import Vehicle from "../models/vehicle.model.js";

export const createVehicle = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new CustomError(errors.array()[0].msg, 400);

  const { name, capacityKg, tyres } = req.body;
  const existing = await Vehicle.findOne({ name });
  if (existing) {
    throw new CustomError("Vehicle with this name already exists", 409);
  }

  const vehicle = await Vehicle.create({ name, capacityKg, tyres });
  return res.status(201).json({ success: true, data: vehicle });
};
