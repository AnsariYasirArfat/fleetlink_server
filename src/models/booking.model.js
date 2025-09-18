import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Booking must have a vehicleId"],
    },
    fromPincode: {
      type: String,
      required: [true, "From pincode is required"],
      match: [/^\d{6}$/, "Pincode must be 6 digits"],
    },
    toPincode: {
      type: String,
      required: [true, "To pincode is required"],
      match: [/^\d{6}$/, "Pincode must be 6 digits"],
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "End time is required"],
    },
    customerId: {
      type: String,
      required: [true, "Customer ID is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
