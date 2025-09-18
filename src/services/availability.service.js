import Booking from "../models/booking.model.js";
import Vehicle from "../models/vehicle.model.js";
import CustomError from "../utils/CustomError.js";

export const calculateRideDuration = (fromPincode, toPincode) => {
  const fromNum = parseInt(fromPincode, 10);
  const toNum = parseInt(toPincode, 10);
  if (Number.isNaN(fromNum) || Number.isNaN(toNum)) {
    throw new CustomError("Invalid pincode format", 400);
  }
  const duration = Math.abs(toNum - fromNum) % 24;
 
  return duration === 0 ? 24 : duration;
};

export const verifyVehicleAvailability = async (
  vehicleId,
  newStartTime,
  newEndTime
) => {
  const conflict = await Booking.exists({
    vehicleId,
    startTime: { $lt: newEndTime },
    endTime: { $gt: newStartTime },
  });
  return !conflict;
};

export const findAvailableVehicles = async (
  capacityRequired,
  fromPincode,
  toPincode,
  startTime
) => {
  const estimatedRideDurationHours = calculateRideDuration(
    fromPincode,
    toPincode
  );
  const endTime = new Date(
    new Date(startTime).getTime() + estimatedRideDurationHours * 3600 * 1000
  );

  const candidates = await Vehicle.find({
    capacityKg: { $gte: capacityRequired },
  }).lean();

  if (candidates.length === 0) return [];

  const available = [];
  for (const v of candidates) {
    const isAvailable = await verifyVehicleAvailability(
      v._id,
      startTime,
      endTime
    );
    if (isAvailable) {
      available.push({ ...v, estimatedRideDurationHours });
    }
  }

  return available;
};
