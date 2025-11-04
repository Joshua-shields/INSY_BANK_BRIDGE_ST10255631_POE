const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

beforeAll(async () => {
  const mongoUri = 'mongodb://localhost:27017/bank_bridge_test';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication Endpoints', () => {
  
  describe('POST /login', () => {
    test('should reject login without credentials', async () => {
      const csrfResponse = await request(app).get('/csrf-token');
      const csrfToken = csrfResponse.body.csrfToken;
      
      const response = await request(app)
        .post('/login')
        .set('Cookie', csrfResponse.headers['set-cookie'])
        .set('X-CSRF-Token', csrfToken)
        .send({});
      
      expect(response.status).toBe(400);
    });

    test('should reject login with invalid account number format', async () => {
      const csrfResponse = await request(app).get('/csrf-token');
      const csrfToken = csrfResponse.body.csrfToken;
      
      const response = await request(app)
        .post('/login')
        .set('Cookie', csrfResponse.headers['set-cookie'])
        .set('X-CSRF-Token', csrfToken)
        .send({
          accountNumber: 'invalid123!@#',
          password: 'Test123!'
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('POST /register', () => {
    test('should reject weak passwords', async () => {
      const csrfResponse = await request(app).get('/csrf-token');
      const csrfToken = csrfResponse.body.csrfToken;
      
      const response = await request(app)
        .post('/register')
        .set('Cookie', csrfResponse.headers['set-cookie'])
        .set('X-CSRF-Token', csrfToken)
        .send({
          name: 'Test User',
          idNumber: '1234567890',
          accountNumber: '9876543210',
          email: 'test@example.com',
          password: 'weak',
          confirmPassword: 'weak'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('should reject mismatched passwords', async () => {
      const csrfResponse = await request(app).get('/csrf-token');
      const csrfToken = csrfResponse.body.csrfToken;
      
      const response = await request(app)
        .post('/register')
        .set('Cookie', csrfResponse.headers['set-cookie'])
        .set('X-CSRF-Token', csrfToken)
        .send({
          name: 'Test User',
          idNumber: '1234567890',
          accountNumber: '9876543210',
          email: 'test@example.com',
          password: 'Test123!',
          confirmPassword: 'Different123!'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Password Validation', () => {
    test('should enforce minimum length', async () => {
      const csrfResponse = await request(app).get('/csrf-token');
      const csrfToken = csrfResponse.body.csrfToken;
      
      const response = await request(app)
        .post('/register')
        .set('Cookie', csrfResponse.headers['set-cookie'])
        .set('X-CSRF-Token', csrfToken)
        .send({
          name: 'Test',
          idNumber: '1234567890',
          accountNumber: '9876543210',
          email: 'test@test.com',
          password: 'Aa1!',
          confirmPassword: 'Aa1!'
        });
      
      expect(response.status).toBe(400);
    });
  });
});
