import { validationResult } from "express-validator";
import CustomError from "../utils/CustomError.js";
import { findAvailableVehicles } from "../services/availability.service.js";

export const getAvailableVehicles = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new CustomError(errors.array()[0].msg, 400);
  }

  const { capacityRequired, fromPincode, toPincode, startTime } = req.query;

  const list = await findAvailableVehicles(
    parseInt(capacityRequired, 10),
    fromPincode,
    toPincode,
    new Date(startTime)
  );
  return res.status(200).json({ success: true, data: list });
};
