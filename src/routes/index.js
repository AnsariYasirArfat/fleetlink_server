import { Router } from "express";
import vehicleRoutes from "./vehicle.routes.js";
import availabilityRoutes from "./availability.routes.js";
import bookingRoutes from "./booking.routes.js";

const router = Router();

router.use("/vehicles", vehicleRoutes);
router.use("/vehicles", availabilityRoutes);
router.use("/bookings", bookingRoutes);

export default router;