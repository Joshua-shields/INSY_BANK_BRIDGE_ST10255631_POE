const request = require('supertest');
const app = require('../server');

describe('Security Middleware Tests', () => {
  
  describe('Helmet Security Headers', () => {
    test('should set security headers', async () => {
      const response = await request(app).get('/csrf-token');
      
      expect(response.headers['x-dns-prefetch-control']).toBeDefined();
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('Rate Limiting', () => {
    test('should allow requests within rate limit', async () => {
      const response = await request(app)
        .get('/csrf-token');
      
      expect(response.status).toBe(200);
    });
  });

  describe('CSRF Protection', () => {
    test('should provide CSRF token on GET request', async () => {
      const response = await request(app)
        .get('/csrf-token');
      
      expect(response.status).toBe(200);
      expect(response.body.csrfToken).toBeDefined();
    });

    test('should reject POST without CSRF token', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          name: 'Test User',
          idNumber: '1234567890',
          accountNumber: '1234567890',
          email: 'test@test.com',
          password: 'Test123!',
          confirmPassword: 'Test123!'
        });
      
      expect([400, 403]).toContain(response.status);
    });
  });

  describe('Input Size Limits', () => {
    test('should reject large payloads', async () => {
      const largeData = 'a'.repeat(20000);
      const response = await request(app)
        .post('/login')
        .send({ data: largeData });
      
      expect(response.status).toBe(413);
    });
  });
});
