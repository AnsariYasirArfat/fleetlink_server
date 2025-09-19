import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: [100, "Vehicle name cannot exceed 100 characters"],
    },
    capacityKg: {
      type: Number,
      required: [true, "Vehicle capacity is required"],
      min: [1, "Capacity must be at least 1 kg"],
      max: [50000, "Capacity cannot exceed 50,000 kg"],
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer.",
      },
    },
    tyres:{
        type : Number,
        required: true,
        min: [4, "Vehicle must have at least 4 tyres"],
        max: [32, "Vehicle cannot have more than 32 tyres"]
    }
  },
  { timestamps: true }
);
export default mongoose.model("Vehicle", vehicleSchema);
