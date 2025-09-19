import request from 'supertest';
import app from '../../src/app.js';
import Vehicle from '../../src/models/vehicle.model.js';
import Booking from '../../src/models/booking.model.js';

describe('Availability API', () => {
  beforeEach(async () => {
    // Create test vehicles for each test
    await Vehicle.create([
      { name: 'Truck A', capacityKg: 1000, tyres: 6 },
      { name: 'Truck B', capacityKg: 500, tyres: 4 },
      { name: 'Van C', capacityKg: 200, tyres: 4 }
    ]);
  });

  describe('GET /api/vehicles/available', () => {
    // SUCCESS CASES
    test('should return available vehicles with valid query parameters', async () => {
      const response = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: 300,
          fromPincode: '110001',
          toPincode: '110002',
          startTime: '2024-01-01T10:00:00Z'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2); // Truck A and Truck B
      expect(response.body.data[0]).toHaveProperty('estimatedRideDurationHours');
    });

    test('should return vehicles with exact capacity match', async () => {
      const response = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: 500,
          fromPincode: '110001',
          toPincode: '110002',
          startTime: '2024-01-01T10:00:00Z'
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2); // Truck A and Truck B
    });

    test('should return empty array when no vehicles meet capacity', async () => {
      const response = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: 2000,
          fromPincode: '110001',
          toPincode: '110002',
          startTime: '2024-01-01T10:00:00Z'
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    // VALIDATION ERROR CASES
    test('should reject request with missing capacityRequired', async () => {
      const response = await request(app)
        .get('/api/vehicles/available')
        .query({
          fromPincode: '110001',
          toPincode: '110002',
          startTime: '2024-01-01T10:00:00Z'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject request with invalid capacityRequired', async () => {
      const response = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: 'invalid',
          fromPincode: '110001',
          toPincode: '110002',
          startTime: '2024-01-01T10:00:00Z'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject request with invalid fromPincode', async () => {
      const response = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: 300,
          fromPincode: '123', // Invalid: not 6 digits
          toPincode: '110002',
          startTime: '2024-01-01T10:00:00Z'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject request with invalid toPincode', async () => {
      const response = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: 300,
          fromPincode: '110001',
          toPincode: '456', // Invalid: not 6 digits
          startTime: '2024-01-01T10:00:00Z'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject request with invalid startTime', async () => {
      const response = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: 300,
          fromPincode: '110001',
          toPincode: '110002',
          startTime: 'invalid-date' // Invalid: not ISO 8601
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject request with negative capacityRequired', async () => {
      const response = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: -100,
          fromPincode: '110001',
          toPincode: '110002',
          startTime: '2024-01-01T10:00:00Z'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject request with capacityRequired exceeding maximum', async () => {
      const response = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: 60000, // Exceeds max of 50000
          fromPincode: '110001',
          toPincode: '110002',
          startTime: '2024-01-01T10:00:00Z'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    // BUSINESS LOGIC TESTS
    test('should exclude vehicles with existing bookings', async () => {
      const truckA = await Vehicle.findOne({ name: 'Truck A' });
      
      // Create a booking for Truck A
      await Booking.create({
        vehicleId: truckA._id,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        customerId: 'customer1'
      });

      const response = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: 300,
          fromPincode: '110001',
          toPincode: '110002',
          startTime: '2024-01-01T10:30:00Z' // Overlapping time
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1); // Only Truck B and Van C
      expect(response.body.data[0].name).not.toBe('Truck A');
    });

    test('should include vehicles when booking time does not overlap', async () => {
      const truckA = await Vehicle.findOne({ name: 'Truck A' });
      
      // Create a booking for Truck A at different time
      await Booking.create({
        vehicleId: truckA._id,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: new Date('2024-01-02T10:00:00Z'), // Different day
        endTime: new Date('2024-01-02T11:00:00Z'),
        customerId: 'customer1'
      });

      const response = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: 300,
          fromPincode: '110001',
          toPincode: '110002',
          startTime: '2024-01-01T10:00:00Z' // Different day
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2); // Truck A and Truck B
    });

    // EDGE CASES
    test('should handle minimum capacity requirement', async () => {
      const response = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: 1, // Minimum capacity
          fromPincode: '110001',
          toPincode: '110002',
          startTime: '2024-01-01T10:00:00Z'
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3); // All vehicles
    });

    test('should handle maximum capacity requirement', async () => {
      const response = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: 1000, // Maximum capacity
          fromPincode: '110001',
          toPincode: '110002',
          startTime: '2024-01-01T10:00:00Z'
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1); // Only Truck A
    });

    test('should calculate correct ride duration for different pincodes', async () => {
      const response = await request(app)
        .get('/api/vehicles/available')
        .query({
          capacityRequired: 300,
          fromPincode: '110001',
          toPincode: '110025', // Different pincode
          startTime: '2024-01-01T10:00:00Z'
        });

      expect(response.status).toBe(200);
      expect(response.body.data[0].estimatedRideDurationHours).toBe(24);
    });
  });
});
