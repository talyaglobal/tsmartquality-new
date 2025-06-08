import request from 'supertest';
import express, { Application } from 'express';
import { TestHelpers } from '../helpers/test-helpers';
import { mockDatabase, createMockDatabase } from '../mocks/database.mock';
import { testUsers, validUserData } from '../fixtures/test-data';

// Mock the database module
jest.mock('../../utils/database', () => createMockDatabase());

describe('Authentication Integration Tests', () => {
  let app: Application;
  
  beforeAll(async () => {
    // Create test application
    app = express();
    app.use(express.json());
    
    // Import routes after mocking database
    const authRoutes = require('../../routes/auth.routes');
    app.use('/api/auth', authRoutes);
    
    // Error handler
    app.use((err: any, req: any, res: any, next: any) => {
      res.status(500).json({ success: false, message: 'Internal server error' });
    });
  });
  
  beforeEach(() => {
    // Reset database state
    mockDatabase.reset();
    jest.clearAllMocks();
  });
  
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        ...validUserData,
        email: 'newuser@example.com'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      TestHelpers.validateSuccessResponse(response, 201);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.passwordHash).toBeUndefined(); // Should not expose password
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });
    
    it('should reject registration with invalid email', async () => {
      const userData = {
        ...validUserData,
        email: 'invalid-email'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
      
      TestHelpers.validateErrorResponse(response, 400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some((error: any) => error.field === 'email')).toBe(true);
    });
    
    it('should reject registration with weak password', async () => {
      const userData = {
        ...validUserData,
        password: '123' // Too weak
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
      
      TestHelpers.validateErrorResponse(response, 400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some((error: any) => error.field === 'password')).toBe(true);
    });
    
    it('should reject registration with existing email', async () => {
      const userData = {
        ...validUserData,
        email: testUsers[0].email // Use existing user email
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);
      
      TestHelpers.validateErrorResponse(response, 409);
      expect(response.body.message).toContain('already exists');
    });
    
    it('should reject registration with missing required fields', async () => {
      const incompleteData = {
        email: 'test@example.com'
        // Missing other required fields
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);
      
      TestHelpers.validateErrorResponse(response, 400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: testUsers[1].email,
        password: 'SecurePassword123!'
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);
      
      TestHelpers.validateSuccessResponse(response, 200);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.user.passwordHash).toBeUndefined();
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
      
      // Should set HTTP-only cookie for refresh token
      expect(response.headers['set-cookie']).toBeDefined();
    });
    
    it('should reject login with invalid password', async () => {
      const loginData = {
        email: testUsers[1].email,
        password: 'wrong-password'
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
      
      TestHelpers.validateErrorResponse(response, 401);
      expect(response.body.message).toContain('Invalid credentials');
    });
    
    it('should reject login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);
      
      TestHelpers.validateErrorResponse(response, 401);
      expect(response.body.message).toContain('Invalid credentials');
    });
    
    it('should reject login for inactive user', async () => {
      const loginData = {
        email: testUsers[2].email, // Inactive user
        password: 'SecurePassword123!'
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(403);
      
      TestHelpers.validateErrorResponse(response, 403);
      expect(response.body.message).toContain('Account is disabled');
    });
    
    it('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);
      
      TestHelpers.validateErrorResponse(response, 400);
    });
    
    it('should implement rate limiting for login attempts', async () => {
      const loginData = {
        email: testUsers[1].email,
        password: 'wrong-password'
      };
      
      // Make multiple failed login attempts
      const promises = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send(loginData)
      );
      
      const responses = await Promise.all(promises);
      
      // Some requests should be rate limited (429)
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
  
  describe('POST /api/auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      // First login to get refresh token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers[1].email,
          password: 'SecurePassword123!'
        })
        .expect(200);
      
      const refreshToken = loginResponse.body.data.tokens.refreshToken;
      
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);
      
      TestHelpers.validateSuccessResponse(response, 200);
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
      
      // New tokens should be different from old ones
      expect(response.body.data.tokens.accessToken)
        .not.toBe(loginResponse.body.data.tokens.accessToken);
    });
    
    it('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
      
      TestHelpers.validateErrorResponse(response, 401);
      expect(response.body.message).toContain('Invalid refresh token');
    });
    
    it('should reject refresh with missing token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({})
        .expect(400);
      
      TestHelpers.validateErrorResponse(response, 400);
    });
  });
  
  describe('POST /api/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      // First login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers[1].email,
          password: 'SecurePassword123!'
        });
      
      const accessToken = loginResponse.body.data.tokens.accessToken;
      
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      
      TestHelpers.validateSuccessResponse(response, 200);
      expect(response.body.message).toContain('Logged out successfully');
      
      // Should clear refresh token cookie
      expect(response.headers['set-cookie']).toBeDefined();
      const cookieHeader = response.headers['set-cookie'][0];
      expect(cookieHeader).toContain('refreshToken=;');
    });
    
    it('should reject logout without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);
      
      TestHelpers.validateErrorResponse(response, 401);
    });
    
    it('should reject logout with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
      
      TestHelpers.validateErrorResponse(response, 401);
    });
  });
  
  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const token = TestHelpers.generateTestToken({
        id: testUsers[1].id,
        email: testUsers[1].email,
        role: testUsers[1].role
      });
      
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      TestHelpers.validateSuccessResponse(response, 200);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.id).toBe(testUsers[1].id);
      expect(response.body.data.user.email).toBe(testUsers[1].email);
      expect(response.body.data.user.passwordHash).toBeUndefined();
    });
    
    it('should reject profile request without authentication', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);
      
      TestHelpers.validateErrorResponse(response, 401);
    });
    
    it('should reject profile request with expired token', async () => {
      const expiredToken = TestHelpers.generateExpiredToken();
      
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
      
      TestHelpers.validateErrorResponse(response, 401);
    });
  });
  
  describe('Authentication Flow Integration', () => {
    it('should complete full authentication workflow', async () => {
      // 1. Register new user
      const userData = {
        ...validUserData,
        email: 'workflow@example.com'
      };
      
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      
      const userId = registerResponse.body.data.user.id;
      const accessToken = registerResponse.body.data.tokens.accessToken;
      
      // 2. Get profile with access token
      const profileResponse = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      
      expect(profileResponse.body.data.user.id).toBe(userId);
      
      // 3. Logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      
      // 4. Try to access profile after logout (should fail)
      const profileAfterLogoutResponse = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
      
      // 5. Login again
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);
      
      expect(loginResponse.body.data.user.id).toBe(userId);
    });
    
    it('should handle concurrent login attempts gracefully', async () => {
      const loginData = {
        email: testUsers[1].email,
        password: 'SecurePassword123!'
      };
      
      // Make concurrent login requests
      const promises = Array(5).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send(loginData)
      );
      
      const responses = await Promise.all(promises);
      
      // All should succeed (or some might be rate limited)
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });
      
      // At least one should succeed
      const successfulLogins = responses.filter(res => res.status === 200);
      expect(successfulLogins.length).toBeGreaterThan(0);
    });
  });
});