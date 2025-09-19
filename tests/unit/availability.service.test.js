import { 
  calculateRideDuration, 
  verifyVehicleAvailability, 
  findAvailableVehicles 
} from "../../src/services/availability.service.js";
import Vehicle from "../../src/models/vehicle.model.js";
import Booking from "../../src/models/booking.model.js";

describe("Availability Service", () => {
  describe("calculateRideDuration", () => {
    test("should calculate correct duration for different pincodes", () => {
      expect(calculateRideDuration("110001", "110002")).toBe(1);
      expect(calculateRideDuration("110001", "110025")).toBe(24);
    });

    test("should handle edge cases", () => {
      expect(calculateRideDuration("999999", "000001")).toBe(14);
    });

    test("should handle same pincode (return 24 hours)", () => {
      expect(calculateRideDuration("110001", "110001")).toBe(24);
    });

    test("should throw error for invalid pincode format", () => {
      expect(() => calculateRideDuration("invalid", "110001")).toThrow("Invalid pincode format");
      expect(() => calculateRideDuration("110001", "invalid")).toThrow("Invalid pincode format");
    });

    test("should handle empty strings", () => {
      expect(() => calculateRideDuration("", "110001")).toThrow("Invalid pincode format");
      expect(() => calculateRideDuration("110001", "")).toThrow("Invalid pincode format");
    });
  });

  describe("verifyVehicleAvailability", () => {
    let vehicleId;

    beforeEach(async () => {
      const vehicle = await Vehicle.create({
        name: 'Test Truck',
        capacityKg: 1000,
        tyres: 6
      });
      vehicleId = vehicle._id;
    });

    test("should return true when vehicle has no bookings", async () => {
      const startTime = new Date('2024-01-01T10:00:00Z');
      const endTime = new Date('2024-01-01T11:00:00Z');

      const result = await verifyVehicleAvailability(vehicleId, startTime, endTime);
      expect(result).toBe(true);
    });

    test("should return false when vehicle has overlapping booking", async () => {
      // Create a booking that overlaps
      await Booking.create({
        vehicleId,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        customerId: 'customer1'
      });

      const startTime = new Date('2024-01-01T10:30:00Z'); // Overlapping time
      const endTime = new Date('2024-01-01T11:30:00Z');

      const result = await verifyVehicleAvailability(vehicleId, startTime, endTime);
      expect(result).toBe(false);
    });

    test("should return true when vehicle has non-overlapping booking", async () => {
      // Create a booking that doesn't overlap
      await Booking.create({
        vehicleId,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: new Date('2024-01-01T12:00:00Z'),
        endTime: new Date('2024-01-01T13:00:00Z'),
        customerId: 'customer1'
      });

      const startTime = new Date('2024-01-01T10:00:00Z'); // Different time
      const endTime = new Date('2024-01-01T11:00:00Z');

      const result = await verifyVehicleAvailability(vehicleId, startTime, endTime);
      expect(result).toBe(true);
    });

    test("should return true when booking ends exactly when new booking starts", async () => {
      // Create a booking that ends exactly when new booking starts
      await Booking.create({
        vehicleId,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        customerId: 'customer1'
      });

      const startTime = new Date('2024-01-01T11:00:00Z'); // Starts exactly when previous ends
      const endTime = new Date('2024-01-01T12:00:00Z');

      const result = await verifyVehicleAvailability(vehicleId, startTime, endTime);
      expect(result).toBe(true);
    });

    test("should return false when new booking starts exactly when existing booking ends", async () => {
      // Create a booking
      await Booking.create({
        vehicleId,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        customerId: 'customer1'
      });

      const startTime = new Date('2024-01-01T10:30:00Z'); // Starts during existing booking
      const endTime = new Date('2024-01-01T11:30:00Z'); // Ends after existing booking

      const result = await verifyVehicleAvailability(vehicleId, startTime, endTime);
      expect(result).toBe(false);
    });
  });

  describe("findAvailableVehicles", () => {
    beforeEach(async () => {
      // Create test vehicles
      await Vehicle.create([
        { name: 'Truck A', capacityKg: 1000, tyres: 6 },
        { name: 'Truck B', capacityKg: 500, tyres: 4 },
        { name: 'Van C', capacityKg: 200, tyres: 4 }
      ]);
    });

    test("should return vehicles with sufficient capacity", async () => {
      const result = await findAvailableVehicles(
        300, 
        '110001', 
        '110002', 
        new Date('2024-01-01T10:00:00Z')
      );

      expect(result).toHaveLength(2); // Truck A and Truck B
      expect(result[0].capacityKg).toBeGreaterThanOrEqual(300);
      expect(result[1].capacityKg).toBeGreaterThanOrEqual(300);
      expect(result[0]).toHaveProperty('estimatedRideDurationHours');
    });

    test("should return empty array when no vehicles meet capacity", async () => {
      const result = await findAvailableVehicles(
        2000, 
        '110001', 
        '110002', 
        new Date('2024-01-01T10:00:00Z')
      );

      expect(result).toHaveLength(0);
    });

    test("should exclude vehicles with booking conflicts", async () => {
      const truckA = await Vehicle.findOne({ name: 'Truck A' });
      
      // Create conflicting booking for Truck A
      await Booking.create({
        vehicleId: truckA._id,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        customerId: 'customer1'
      });

      const result = await findAvailableVehicles(
        300, 
        '110001', 
        '110002', 
        new Date('2024-01-01T10:30:00Z') // Overlapping time
      );

      expect(result).toHaveLength(1); // Only Truck B
      expect(result[0].name).not.toBe('Truck A');
    });

    test("should include vehicles when no booking conflicts", async () => {
      const truckA = await Vehicle.findOne({ name: 'Truck A' });
      
      // Create non-conflicting booking for Truck A
      await Booking.create({
        vehicleId: truckA._id,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: new Date('2024-01-02T10:00:00Z'), // Different day
        endTime: new Date('2024-01-02T11:00:00Z'),
        customerId: 'customer1'
      });

      const result = await findAvailableVehicles(
        300, 
        '110001', 
        '110002', 
        new Date('2024-01-01T10:00:00Z') // Different day
      );

      expect(result).toHaveLength(2); // Truck A and Truck B
    });

    test("should calculate correct ride duration for all vehicles", async () => {
      const result = await findAvailableVehicles(
        200, 
        '110001', 
        '110025', // Different pincode
        new Date('2024-01-01T10:00:00Z')
      );

      expect(result).toHaveLength(3); // All vehicles
      expect(result[0].estimatedRideDurationHours).toBe(24);
      expect(result[1].estimatedRideDurationHours).toBe(24);
      expect(result[2].estimatedRideDurationHours).toBe(24);
    });

    test("should handle edge case with exact capacity match", async () => {
      const result = await findAvailableVehicles(
        500, // Exact match for Truck B
        '110001', 
        '110002', 
        new Date('2024-01-01T10:00:00Z')
      );

      expect(result).toHaveLength(2); // Truck A and Truck B
      expect(result.some(v => v.capacityKg === 500)).toBe(true); // Truck B included
    });

    test("should throw error for invalid pincode format", async () => {
      await expect(
        findAvailableVehicles(
          300, 
          'invalid', 
          '110002', 
          new Date('2024-01-01T10:00:00Z')
        )
      ).rejects.toThrow('Invalid pincode format');
    });
  });
});
