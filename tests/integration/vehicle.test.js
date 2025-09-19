import request from 'supertest';
import app from '../../src/app.js';
import Vehicle from '../../src/models/vehicle.model.js';

describe('Vehicle API', () => {
  describe('POST /api/vehicles', () => {
    // SUCCESS CASES
    test('should create vehicle with valid data', async () => {
      const vehicleData = {
        name: 'Test Truck',
        capacityKg: 1000,
        tyres: 6
      };

      const response = await request(app)
        .post('/api/vehicles')
        .send(vehicleData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Truck');
    });

    // VALIDATION ERROR CASES
    test('should reject vehicle with missing name', async () => {
      const invalidData = {
        capacityKg: 1000,
        tyres: 6
      };

      const response = await request(app)
        .post('/api/vehicles')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should reject vehicle with invalid capacity', async () => {
      const invalidData = {
        name: 'Test Truck',
        capacityKg: -100,
        tyres: 6
      };

      const response = await request(app)
        .post('/api/vehicles')
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    test('should reject vehicle with too many tyres', async () => {
      const invalidData = {
        name: 'Test Truck',
        capacityKg: 1000,
        tyres: 33 // Too many tyres
      };

      const response = await request(app)
        .post('/api/vehicles')
        .send(invalidData);

      expect(response.status).toBe(400);
    });

    // BUSINESS LOGIC ERROR CASES
    test('should reject duplicate vehicle name', async () => {
      // Create first vehicle
      await Vehicle.create({
        name: 'Duplicate Truck',
        capacityKg: 1000,
        tyres: 6
      });

      // Try to create duplicate
      const response = await request(app)
        .post('/api/vehicles')
        .send({
          name: 'Duplicate Truck',
          capacityKg: 500,
          tyres: 4
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    // EDGE CASES
    test('should handle maximum name length', async () => {
      const edgeCaseData = {
        name: 'A'.repeat(100), // Maximum length
        capacityKg: 1000,
        tyres: 6
      };

      const response = await request(app)
        .post('/api/vehicles')
        .send(edgeCaseData);

      expect(response.status).toBe(201);
    });

    test('should handle minimum values', async () => {
      const edgeCaseData = {
        name: 'Min Truck',
        capacityKg: 1, // Minimum capacity
        tyres: 4 // Minimum tyres
      };

      const response = await request(app)
        .post('/api/vehicles')
        .send(edgeCaseData);

      expect(response.status).toBe(201);
    });
  });
});
