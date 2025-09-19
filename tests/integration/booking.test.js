import request from 'supertest';
import app from '../../src/app.js';
import Vehicle from '../../src/models/vehicle.model.js';
import Booking from '../../src/models/booking.model.js';

describe('Booking API', () => {
  let vehicleId;

  beforeEach(async () => {
    // Create test vehicle for each test
    const vehicle = await Vehicle.create({
      name: 'Test Truck',
      capacityKg: 1000,
      tyres: 6
    });
    vehicleId = vehicle._id.toString();
  });

  describe('POST /api/bookings', () => {
    // SUCCESS CASES
    test('should create booking with valid data', async () => {
      const bookingData = {
        vehicleId: vehicleId,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: '2024-01-01T10:00:00Z',
        customerId: 'customer123'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.vehicleId).toBe(vehicleId);
      expect(response.body.data.customerId).toBe('customer123');
      expect(response.body.data.fromPincode).toBe('110001');
      expect(response.body.data.toPincode).toBe('110002');
    });

    test('should create booking with different pincodes', async () => {
      const bookingData = {
        vehicleId: vehicleId,
        fromPincode: '400001',
        toPincode: '110001',
        startTime: '2024-01-01T10:00:00Z',
        customerId: 'customer456'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.customerId).toBe('customer456');
    });

    // VALIDATION ERROR CASES
    test('should reject booking with missing vehicleId', async () => {
      const invalidData = {
        fromPincode: '110001',
        toPincode: '110002',
        startTime: '2024-01-01T10:00:00Z',
        customerId: 'customer123'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject booking with invalid vehicleId format', async () => {
      const invalidData = {
        vehicleId: 'invalid-id',
        fromPincode: '110001',
        toPincode: '110002',
        startTime: '2024-01-01T10:00:00Z',
        customerId: 'customer123'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject booking with missing fromPincode', async () => {
      const invalidData = {
        vehicleId: vehicleId,
        toPincode: '110002',
        startTime: '2024-01-01T10:00:00Z',
        customerId: 'customer123'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject booking with invalid fromPincode format', async () => {
      const invalidData = {
        vehicleId: vehicleId,
        fromPincode: '123', // Invalid: not 6 digits
        toPincode: '110002',
        startTime: '2024-01-01T10:00:00Z',
        customerId: 'customer123'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject booking with invalid toPincode format', async () => {
      const invalidData = {
        vehicleId: vehicleId,
        fromPincode: '110001',
        toPincode: '456', // Invalid: not 6 digits
        startTime: '2024-01-01T10:00:00Z',
        customerId: 'customer123'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject booking with missing startTime', async () => {
      const invalidData = {
        vehicleId: vehicleId,
        fromPincode: '110001',
        toPincode: '110002',
        customerId: 'customer123'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject booking with invalid startTime format', async () => {
      const invalidData = {
        vehicleId: vehicleId,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: 'invalid-date',
        customerId: 'customer123'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject booking with missing customerId', async () => {
      const invalidData = {
        vehicleId: vehicleId,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: '2024-01-01T10:00:00Z'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject booking with empty customerId', async () => {
      const invalidData = {
        vehicleId: vehicleId,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: '2024-01-01T10:00:00Z',
        customerId: ''
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    // BUSINESS LOGIC ERROR CASES
    test('should reject booking for non-existent vehicle', async () => {
      const nonExistentVehicleId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but doesn't exist
      
      const bookingData = {
        vehicleId: nonExistentVehicleId,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: '2024-01-01T10:00:00Z',
        customerId: 'customer123'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Vehicle not found!');
    });

    test('should reject overlapping bookings for same vehicle', async () => {
      // Create first booking
      await Booking.create({
        vehicleId: vehicleId,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        customerId: 'customer1'
      });

      // Try to create overlapping booking
      const overlappingBooking = {
        vehicleId: vehicleId,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: '2024-01-01T10:30:00Z', // Overlapping time
        customerId: 'customer2'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(overlappingBooking);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Vehicle is already booked for that time window');
    });

    test('should allow non-overlapping bookings for same vehicle', async () => {
      // Create first booking
      await Booking.create({
        vehicleId: vehicleId,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        customerId: 'customer1'
      });

      // Create non-overlapping booking
      const nonOverlappingBooking = {
        vehicleId: vehicleId,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: '2024-01-01T12:00:00Z', // Different time
        customerId: 'customer2'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(nonOverlappingBooking);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    test('should allow bookings for different vehicles at same time', async () => {
      // Create another vehicle
      const vehicle2 = await Vehicle.create({
        name: 'Truck B',
        capacityKg: 500,
        tyres: 4
      });

      // Create booking for first vehicle
      await Booking.create({
        vehicleId: vehicleId,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T11:00:00Z'),
        customerId: 'customer1'
      });

      // Create booking for second vehicle at same time
      const bookingData = {
        vehicleId: vehicle2._id.toString(),
        fromPincode: '110001',
        toPincode: '110002',
        startTime: '2024-01-01T10:00:00Z',
        customerId: 'customer2'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    // EDGE CASES
    test('should handle booking with minimum ride duration', async () => {
      const bookingData = {
        vehicleId: vehicleId,
        fromPincode: '110001',
        toPincode: '110001', // Same pincode = 0 hours
        startTime: '2024-01-01T10:00:00Z',
        customerId: 'customer123'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    test('should handle booking with maximum ride duration', async () => {
      const bookingData = {
        vehicleId: vehicleId,
        fromPincode: '000001',
        toPincode: '999999', // Maximum difference
        startTime: '2024-01-01T10:00:00Z',
        customerId: 'customer123'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    test('should handle booking with special characters in customerId', async () => {
      const bookingData = {
        vehicleId: vehicleId,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: '2024-01-01T10:00:00Z',
        customerId: 'customer-123_test@company.com'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.customerId).toBe('customer-123_test@company.com');
    });

    test('should handle booking with different time zones', async () => {
      const bookingData = {
        vehicleId: vehicleId,
        fromPincode: '110001',
        toPincode: '110002',
        startTime: '2024-01-01T10:00:00+05:30', // Different timezone
        customerId: 'customer123'
      };

      const response = await request(app)
        .post('/api/bookings')
        .send(bookingData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });
});
