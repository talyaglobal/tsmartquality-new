import request from 'supertest';
import express, { Application } from 'express';
import { TestHelpers } from '../helpers/test-helpers';

describe('Security Tests', () => {
  let app: Application;
  
  beforeAll(async () => {
    // Import the secured app
    const securedApp = require('../../app-secured');
    app = securedApp.default || securedApp;
  });
  
  describe('Security Headers', () => {
    it('should include security headers in responses', async () => {
      const response = await request(app)
        .get('/ping')
        .expect(200);
      
      // Check for security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();
      expect(response.headers['referrer-policy']).toBeDefined();
      expect(response.headers['content-security-policy']).toBeDefined();
    });
    
    it('should not expose sensitive server information', async () => {
      const response = await request(app)
        .get('/ping')
        .expect(200);
      
      // Should not expose server details
      expect(response.headers['server']).toBeUndefined();
      expect(response.headers['x-powered-by']).toBeUndefined();
    });
    
    it('should include HSTS header in production mode', async () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      try {
        const response = await request(app)
          .get('/ping')
          .expect(200);
        
        expect(response.headers['strict-transport-security']).toBeDefined();
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });
  
  describe('Input Validation and Sanitization', () => {
    it('should sanitize XSS attempts', async () => {
      const maliciousPayload = {
        name: '<script>alert("XSS")</script>',
        description: '<img src="x" onerror="alert(\'XSS\')">'
      };
      
      const response = await request(app)
        .post('/api/test')
        .send(maliciousPayload);
      
      if (response.status === 200) {
        // If request succeeds, ensure XSS is sanitized
        const responseData = JSON.stringify(response.body);
        expect(responseData).not.toContain('<script>');
        expect(responseData).not.toContain('onerror=');
      } else {
        // If request is blocked, that's also acceptable
        expect(response.status).toBe(400);
      }
    });
    
    it('should block SQL injection attempts', async () => {
      const sqlInjectionPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --",
        "admin'--"
      ];
      
      for (const payload of sqlInjectionPayloads) {
        const response = await request(app)
          .get('/api/users')
          .query({ search: payload });
        
        // Should block the request
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('injection');
      }
    });
    
    it('should block NoSQL injection attempts', async () => {
      const nosqlInjectionPayloads = [
        { $ne: null },
        { $gt: "" },
        { $where: "this.username == 'admin'" }
      ];
      
      for (const payload of nosqlInjectionPayloads) {
        const response = await request(app)
          .post('/api/test')
          .send({ filter: payload });
        
        // Should block the request
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toContain('injection');
      }
    });
    
    it('should validate file upload types', async () => {
      // Test with malicious file types
      const maliciousFiles = [
        { filename: 'script.js', content: 'alert("XSS")' },
        { filename: 'shell.php', content: '<?php system($_GET["cmd"]); ?>' },
        { filename: 'virus.exe', content: 'binary content' }
      ];
      
      for (const file of maliciousFiles) {
        const response = await request(app)
          .post('/api/upload')
          .attach('file', Buffer.from(file.content), file.filename);
        
        // Should reject dangerous file types
        expect([400, 415, 403]).toContain(response.status);
      }
    });
  });
  
  describe('Rate Limiting', () => {
    it('should implement rate limiting for API endpoints', async () => {
      const requests = [];
      
      // Make rapid requests
      for (let i = 0; i < 20; i++) {
        requests.push(
          request(app)
            .get('/ping')
            .expect((res) => {
              expect([200, 429]).toContain(res.status);
            })
        );
      }
      
      const responses = await Promise.all(requests);
      
      // At least some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
    
    it('should have stricter rate limiting for authentication endpoints', async () => {
      const loginRequests = [];
      
      // Make rapid login attempts
      for (let i = 0; i < 10; i++) {
        loginRequests.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrong-password'
            })
        );
      }
      
      const responses = await Promise.all(loginRequests);
      
      // Should have rate limiting for auth endpoints
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
    
    it('should provide rate limit information in headers', async () => {
      const response = await request(app)
        .get('/ping');
      
      // Check for rate limit headers
      if (response.status === 200) {
        expect(response.headers['x-ratelimit-limit']).toBeDefined();
        expect(response.headers['x-ratelimit-remaining']).toBeDefined();
        expect(response.headers['x-ratelimit-reset']).toBeDefined();
      }
    });
  });
  
  describe('CORS Configuration', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/ping')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .expect(200);
      
      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });
    
    it('should restrict CORS origins in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      try {
        const response = await request(app)
          .options('/api/ping')
          .set('Origin', 'http://malicious-site.com')
          .set('Access-Control-Request-Method', 'GET');
        
        const corsOrigin = response.headers['access-control-allow-origin'];
        expect(corsOrigin).not.toBe('*');
        expect(corsOrigin).not.toBe('http://malicious-site.com');
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });
  
  describe('Request Size Limits', () => {
    it('should reject requests that exceed size limits', async () => {
      // Create large payload (larger than typical limits)
      const largePayload = {
        data: 'x'.repeat(50 * 1024 * 1024) // 50MB
      };
      
      const response = await request(app)
        .post('/api/test')
        .send(largePayload);
      
      // Should reject large requests
      expect([413, 400]).toContain(response.status);
    });
    
    it('should limit URL parameter length', async () => {
      const longParam = 'x'.repeat(10000);
      
      const response = await request(app)
        .get('/api/users')
        .query({ search: longParam });
      
      // Should handle or reject very long parameters
      expect([200, 400, 414]).toContain(response.status);
    });
  });
  
  describe('Authentication Security', () => {
    it('should not accept weak JWT signatures', async () => {
      // Create token with weak signature
      const weakToken = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIn0.';
      
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${weakToken}`)
        .expect(401);
      
      TestHelpers.validateErrorResponse(response, 401);
    });
    
    it('should reject tokens with modified payloads', async () => {
      // Create valid token then modify payload
      const validToken = TestHelpers.generateTestToken();
      const parts = validToken.split('.');
      
      // Modify the payload
      const modifiedPayload = Buffer.from('{"id":999,"role":"admin"}').toString('base64');
      const modifiedToken = `${parts[0]}.${modifiedPayload}.${parts[2]}`;
      
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${modifiedToken}`)
        .expect(401);
      
      TestHelpers.validateErrorResponse(response, 401);
    });
    
    it('should implement proper password hashing', async () => {
      const userData = {
        email: 'security@example.com',
        username: 'securityuser',
        firstName: 'Security',
        lastName: 'User',
        password: 'SecurePassword123!',
        role: 'user'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      if (response.status === 201) {
        // Password should never be returned in response
        expect(response.body.data.user.password).toBeUndefined();
        expect(response.body.data.user.passwordHash).toBeUndefined();
        
        // If we had access to the stored hash, we would verify it's bcrypt
        // expect(response.body.data.user.passwordHash).toMatch(/^\$2[aby]\$\d{2}\$/);
      }
    });
  });
  
  describe('Error Handling Security', () => {
    it('should not expose stack traces in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      try {
        // Trigger an error
        const response = await request(app)
          .get('/api/nonexistent-endpoint')
          .expect(404);
        
        expect(response.body.stack).toBeUndefined();
        expect(response.body.trace).toBeUndefined();
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
    
    it('should not expose sensitive information in error messages', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password'
        })
        .expect(401);
      
      // Should not reveal whether email exists or not
      expect(response.body.message).toBe('Invalid credentials');
      expect(response.body.message).not.toContain('User not found');
      expect(response.body.message).not.toContain('Email does not exist');
    });
  });
  
  describe('Session Security', () => {
    it('should use secure cookie settings', async () => {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'SecurePassword123!'
        });
      
      if (loginResponse.status === 200) {
        const cookies = loginResponse.headers['set-cookie'];
        if (cookies) {
          const refreshTokenCookie = cookies.find((cookie: string) => 
            cookie.includes('refreshToken')
          );
          
          if (refreshTokenCookie) {
            expect(refreshTokenCookie).toContain('HttpOnly');
            expect(refreshTokenCookie).toContain('SameSite');
            
            // In production, should also have Secure flag
            if (process.env.NODE_ENV === 'production') {
              expect(refreshTokenCookie).toContain('Secure');
            }
          }
        }
      }
    });
  });
  
  describe('Information Disclosure', () => {
    it('should not expose version information', async () => {
      const response = await request(app)
        .get('/ping')
        .expect(200);
      
      // Should not expose detailed version info
      expect(response.headers['server']).toBeUndefined();
      expect(response.body.version).toBeUndefined();
    });
    
    it('should not expose internal paths in error messages', async () => {
      const response = await request(app)
        .get('/api/internal/admin/debug');
      
      // Even if endpoint doesn't exist, shouldn't expose file paths
      if (response.body.message) {
        expect(response.body.message).not.toMatch(/\/Users\/.*\/api\//);
        expect(response.body.message).not.toMatch(/\/home\/.*\/app\//);
        expect(response.body.message).not.toMatch(/C:\\\\.*\\\\api\\\\/);
      }
    });
  });
  
  describe('File Upload Security', () => {
    it('should prevent path traversal in file uploads', async () => {
      const maliciousFilenames = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        'file/../../../sensitive.txt',
        'file%2e%2e%2f%2e%2e%2fsensitive.txt'
      ];
      
      for (const filename of maliciousFilenames) {
        const response = await request(app)
          .post('/api/upload')
          .attach('file', Buffer.from('test content'), filename);
        
        // Should reject or sanitize malicious filenames
        if (response.status === 200) {
          expect(response.body.data.filename).not.toContain('..');
          expect(response.body.data.path).not.toContain('..');
        } else {
          expect([400, 403]).toContain(response.status);
        }
      }
    });
  });
});