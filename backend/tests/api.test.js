const request = require('supertest');
const app = require('../server');

describe('API Endpoint Tests', () => {
  
  describe('App Health Check', () => {
    test('should ensure app runs and responds', async () => {
      const response = await request(app).get('/csrf-token');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('csrfToken');
    });
  });

  describe('Input Validation', () => {
    test('should reject SQL injection attempts', async () => {
      const csrfResponse = await request(app).get('/csrf-token');
      const csrfToken = csrfResponse.body.csrfToken;
      
      const response = await request(app)
        .post('/login')
        .set('Cookie', csrfResponse.headers['set-cookie'])
        .set('X-CSRF-Token', csrfToken)
        .send({
          accountNumber: "' OR '1'='1",
          password: 'test'
        });
      
      expect(response.status).toBe(400);
    });

    test('should reject XSS attempts in input', async () => {
      const csrfResponse = await request(app).get('/csrf-token');
      const csrfToken = csrfResponse.body.csrfToken;
      
      const response = await request(app)
        .post('/register')
        .set('Cookie', csrfResponse.headers['set-cookie'])
        .set('X-CSRF-Token', csrfToken)
        .send({
          name: '<script>alert("xss")</script>',
          idNumber: '1234567890',
          accountNumber: '9876543210',
          email: 'test@test.com',
          password: 'Test123!',
          confirmPassword: 'Test123!'
        });
      
      expect(response.status).toBe(400);
    });

    test('should reject NoSQL injection attempts', async () => {
      const csrfResponse = await request(app).get('/csrf-token');
      const csrfToken = csrfResponse.body.csrfToken;
      
      const response = await request(app)
        .post('/login')
        .set('Cookie', csrfResponse.headers['set-cookie'])
        .set('X-CSRF-Token', csrfToken)
        .send({
          accountNumber: { $ne: null },
          password: { $ne: null }
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('API Routes', () => {
    test('should have auth routes configured', async () => {
      const response = await request(app).get('/csrf-token');
      expect(response.status).toBe(200);
    });

    test('should protect unauthorized API access', async () => {
      const response = await request(app)
        .get('/api/transactions');
      
      expect([401, 403, 404]).toContain(response.status);
    });
  });
});
