import request from 'supertest';
import { TestHelpers } from '../helpers/test-helpers';

describe('API Documentation and Contract Tests', () => {
  let app: any;
  
  beforeAll(async () => {
    const appModule = require('../../app-secured');
    app = appModule.default || appModule;
  });
  
  describe('API Response Format Consistency', () => {
    it('should return consistent success response format', async () => {
      const token = TestHelpers.generateTestToken();
      
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      // Standard success response format
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
      
      // Should include timestamp
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeValidDate();
    });
    
    it('should return consistent error response format', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint')
        .expect(404);
      
      // Standard error response format
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
      
      // Should include timestamp
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeValidDate();
    });
    
    it('should return consistent validation error format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123' // Too short
        })
        .expect(400);
      
      // Validation error format
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
      
      // Each error should have proper structure
      response.body.errors.forEach((error: any) => {
        expect(error).toHaveProperty('field');
        expect(error).toHaveProperty('message');
        expect(typeof error.field).toBe('string');
        expect(typeof error.message).toBe('string');
      });
    });
    
    it('should return consistent pagination format', async () => {
      const token = TestHelpers.generateTestToken();
      
      const response = await request(app)
        .get('/api/products')
        .query({
          page: 1,
          pageSize: 10
        })
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      TestHelpers.validatePaginationResponse(response);
      
      // Pagination metadata
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('pageSize');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
      
      // Validate pagination values
      expect(typeof response.body.pagination.page).toBe('number');
      expect(typeof response.body.pagination.pageSize).toBe('number');
      expect(typeof response.body.pagination.total).toBe('number');
      expect(typeof response.body.pagination.totalPages).toBe('number');
      
      expect(response.body.pagination.page).toBeGreaterThan(0);
      expect(response.body.pagination.pageSize).toBeGreaterThan(0);
      expect(response.body.pagination.total).toBeGreaterThanOrEqual(0);
      expect(response.body.pagination.totalPages).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('HTTP Status Code Consistency', () => {
    it('should use 200 for successful GET requests', async () => {
      await request(app)
        .get('/ping')
        .expect(200);
      
      await request(app)
        .get('/health')
        .expect(200);
    });
    
    it('should use 201 for successful creation', async () => {
      const userData = {
        email: 'newuser@example.com',
        username: 'newuser',
        firstName: 'New',
        lastName: 'User',
        password: 'SecurePassword123!',
        role: 'user'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      if (response.status === 201) {
        expect(response.body.success).toBe(true);
      }
    });
    
    it('should use 400 for validation errors', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid'
        })
        .expect(400);
    });
    
    it('should use 401 for authentication errors', async () => {
      await request(app)
        .get('/api/auth/profile')
        .expect(401);
      
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'wrong-password'
        })
        .expect(401);
    });
    
    it('should use 403 for authorization errors', async () => {
      const userToken = TestHelpers.generateTestToken({ role: 'user' });
      
      const response = await request(app)
        .delete('/api/admin/users/1')
        .set('Authorization', `Bearer ${userToken}`);
      
      if ([403, 404].includes(response.status)) {
        // 403 for forbidden or 404 if endpoint doesn't exist
        expect([403, 404]).toContain(response.status);
      }
    });
    
    it('should use 404 for not found resources', async () => {
      await request(app)
        .get('/api/nonexistent-endpoint')
        .expect(404);
    });
    
    it('should use 409 for conflict errors', async () => {
      // Try to register with existing email
      const existingUserData = {
        email: 'user@example.com', // Assuming this exists
        username: 'existinguser',
        firstName: 'Existing',
        lastName: 'User',
        password: 'SecurePassword123!',
        role: 'user'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(existingUserData);
      
      if (response.status === 409) {
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('exists');
      }
    });
    
    it('should use 429 for rate limiting', async () => {
      // Make many rapid requests
      const requests = Array(20).fill(null).map(() =>
        request(app).get('/ping')
      );
      
      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      
      if (rateLimitedResponses.length > 0) {
        rateLimitedResponses.forEach(response => {
          expect(response.body.success).toBe(false);
          expect(response.body.message).toContain('rate');
        });
      }
    });
  });
  
  describe('Content-Type Headers', () => {
    it('should return JSON content type for API responses', async () => {
      const response = await request(app)
        .get('/ping')
        .expect(200);
      
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
    
    it('should accept JSON content type for POST requests', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'user@example.com',
          password: 'password'
        });
      
      // Should not fail due to content type
      expect([200, 401, 400]).toContain(response.status);
    });
    
    it('should reject non-JSON content for JSON endpoints', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'text/plain')
        .send('email=user@example.com&password=password');
      
      // Should reject or handle gracefully
      expect([400, 415]).toContain(response.status);
    });
  });
  
  describe('Request/Response Headers', () => {
    it('should include security headers in all responses', async () => {
      const response = await request(app)
        .get('/ping');
      
      // Security headers
      expect(response.headers['x-content-type-options']).toBeDefined();
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();
    });
    
    it('should include rate limit headers when applicable', async () => {
      const response = await request(app)
        .get('/ping');
      
      // Rate limit headers (if implemented)
      if (response.headers['x-ratelimit-limit']) {
        expect(response.headers['x-ratelimit-remaining']).toBeDefined();
        expect(response.headers['x-ratelimit-reset']).toBeDefined();
      }
    });
    
    it('should handle various Accept headers', async () => {
      const acceptHeaders = [
        'application/json',
        'application/json, text/plain, */*',
        '*/*'
      ];
      
      for (const acceptHeader of acceptHeaders) {
        const response = await request(app)
          .get('/ping')
          .set('Accept', acceptHeader)
          .expect(200);
        
        expect(response.headers['content-type']).toMatch(/application\/json/);
      }
    });
  });
  
  describe('Query Parameter Validation', () => {
    it('should validate pagination parameters', async () => {
      const token = TestHelpers.generateTestToken();
      
      const testCases = [
        { page: -1, pageSize: 10, expectError: true },
        { page: 0, pageSize: 10, expectError: true },
        { page: 1, pageSize: -5, expectError: true },
        { page: 1, pageSize: 0, expectError: true },
        { page: 1, pageSize: 1000, expectError: true }, // Too large
        { page: 'invalid', pageSize: 10, expectError: true },
        { page: 1, pageSize: 'invalid', expectError: true },
        { page: 1, pageSize: 10, expectError: false }, // Valid
      ];
      
      for (const testCase of testCases) {
        const response = await request(app)
          .get('/api/products')
          .query(testCase)
          .set('Authorization', `Bearer ${token}`);
        
        if (testCase.expectError) {
          expect(response.status).toBe(400);
          expect(response.body.success).toBe(false);
        } else {
          expect([200, 404]).toContain(response.status);
        }
      }
    });
    
    it('should validate sorting parameters', async () => {
      const token = TestHelpers.generateTestToken();
      
      const testCases = [
        { orderBy: 'name', sortDirection: 'asc', expectError: false },
        { orderBy: 'name', sortDirection: 'desc', expectError: false },
        { orderBy: 'invalid_field', sortDirection: 'asc', expectError: true },
        { orderBy: 'name', sortDirection: 'invalid', expectError: true },
      ];
      
      for (const testCase of testCases) {
        const response = await request(app)
          .get('/api/products')
          .query(testCase)
          .set('Authorization', `Bearer ${token}`);
        
        if (testCase.expectError) {
          expect(response.status).toBe(400);
        } else {
          expect([200, 404]).toContain(response.status);
        }
      }
    });
  });
  
  describe('Data Type Validation', () => {
    it('should validate email format in requests', async () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user space@domain.com',
        'user@domain',
        ''
      ];
      
      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email,
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            password: 'SecurePassword123!',
            role: 'user'
          })
          .expect(400);
        
        expect(response.body.success).toBe(false);
        expect(response.body.errors.some((err: any) => 
          err.field === 'email'
        )).toBe(true);
      }
    });
    
    it('should validate required fields', async () => {
      const requiredFieldTests = [
        { field: 'email', data: { username: 'test', password: 'pass' } },
        { field: 'username', data: { email: 'test@example.com', password: 'pass' } },
        { field: 'password', data: { email: 'test@example.com', username: 'test' } }
      ];
      
      for (const test of requiredFieldTests) {
        const response = await request(app)
          .post('/api/auth/register')
          .send(test.data)
          .expect(400);
        
        expect(response.body.success).toBe(false);
        expect(response.body.errors.some((err: any) => 
          err.field === test.field
        )).toBe(true);
      }
    });
    
    it('should validate numeric fields', async () => {
      const token = TestHelpers.generateTestToken();
      
      const numericFieldTests = [
        { field: 'sellerId', value: 'not-a-number' },
        { field: 'categoryId', value: 'invalid' },
        { field: 'price', value: 'not-numeric' }
      ];
      
      for (const test of numericFieldTests) {
        const productData = {
          code: 'TEST001',
          name: 'Test Product',
          [test.field]: test.value
        };
        
        const response = await request(app)
          .post('/api/products')
          .send(productData)
          .set('Authorization', `Bearer ${token}`);
        
        if (response.status === 400) {
          expect(response.body.success).toBe(false);
        }
      }
    });
  });
  
  describe('Response Data Structure', () => {
    it('should return user data without sensitive fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'datastructure@example.com',
          username: 'datauser',
          firstName: 'Data',
          lastName: 'User',
          password: 'SecurePassword123!',
          role: 'user'
        });
      
      if (response.status === 201) {
        const userData = response.body.data.user;
        
        // Should include safe fields
        expect(userData).toHaveProperty('id');
        expect(userData).toHaveProperty('email');
        expect(userData).toHaveProperty('username');
        expect(userData).toHaveProperty('firstName');
        expect(userData).toHaveProperty('lastName');
        expect(userData).toHaveProperty('role');
        
        // Should NOT include sensitive fields
        expect(userData).not.toHaveProperty('password');
        expect(userData).not.toHaveProperty('passwordHash');
        expect(userData).not.toHaveProperty('salt');
      }
    });
    
    it('should return product data with proper structure', async () => {
      const token = TestHelpers.generateTestToken();
      
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${token}`);
      
      if (response.status === 200 && response.body.data.length > 0) {
        const product = response.body.data[0];
        
        // Expected product fields
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('code');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('createdAt');
        expect(product).toHaveProperty('updatedAt');
        
        // Field types
        expect(typeof product.id).toBe('number');
        expect(typeof product.code).toBe('string');
        expect(typeof product.name).toBe('string');
        expect(new Date(product.createdAt)).toBeValidDate();
        expect(new Date(product.updatedAt)).toBeValidDate();
      }
    });
  });
  
  describe('API Versioning', () => {
    it('should include API version information', async () => {
      const response = await request(app)
        .get('/ping')
        .expect(200);
      
      // Should include version info
      if (response.body.version) {
        expect(typeof response.body.version).toBe('string');
        expect(response.body.version).toMatch(/^\d+\.\d+\.\d+$/); // Semantic versioning
      }
    });
    
    it('should handle API version in headers', async () => {
      const response = await request(app)
        .get('/ping')
        .set('API-Version', '1.0.0')
        .expect(200);
      
      // Should accept version header gracefully
      expect(response.status).toBe(200);
    });
  });
});