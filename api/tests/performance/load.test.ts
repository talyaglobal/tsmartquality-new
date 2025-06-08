import request from 'supertest';
import { performance } from 'perf_hooks';
import { TestHelpers } from '../helpers/test-helpers';

describe('Performance Tests', () => {
  let app: any;
  
  beforeAll(async () => {
    // Import the app
    const appModule = require('../../app-secured');
    app = appModule.default || appModule;
  });
  
  describe('Response Time Performance', () => {
    it('should respond to health check within acceptable time', async () => {
      const maxResponseTime = 100; // 100ms
      
      const startTime = performance.now();
      const response = await request(app)
        .get('/ping')
        .expect(200);
      const endTime = performance.now();
      
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(maxResponseTime);
      expect(response.body.status).toBe('ok');
    });
    
    it('should handle authentication within acceptable time', async () => {
      const maxResponseTime = 500; // 500ms for crypto operations
      
      const startTime = performance.now();
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@example.com',
          password: 'SecurePassword123!'
        });
      const endTime = performance.now();
      
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(maxResponseTime);
    });
    
    it('should handle API requests within acceptable time', async () => {
      const maxResponseTime = 200; // 200ms
      const token = TestHelpers.generateTestToken();
      
      const startTime = performance.now();
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${token}`);
      const endTime = performance.now();
      
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(maxResponseTime);
    });
  });
  
  describe('Concurrent Request Handling', () => {
    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10;
      const maxResponseTime = 1000; // 1 second for all requests
      
      const startTime = performance.now();
      
      const requests = Array(concurrentRequests).fill(null).map(() =>
        request(app)
          .get('/ping')
          .expect(200)
      );
      
      const responses = await Promise.all(requests);
      const endTime = performance.now();
      
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(maxResponseTime);
      expect(responses).toHaveLength(concurrentRequests);
      
      // All responses should be successful
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
    
    it('should handle concurrent authenticated requests', async () => {
      const concurrentRequests = 5;
      const maxResponseTime = 2000; // 2 seconds
      const token = TestHelpers.generateTestToken();
      
      const startTime = performance.now();
      
      const requests = Array(concurrentRequests).fill(null).map(() =>
        request(app)
          .get('/api/auth/profile')
          .set('Authorization', `Bearer ${token}`)
      );
      
      const responses = await Promise.all(requests);
      const endTime = performance.now();
      
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(maxResponseTime);
      
      // Should handle auth efficiently
      const successfulResponses = responses.filter(res => res.status === 200);
      expect(successfulResponses.length).toBeGreaterThan(0);
    });
    
    it('should maintain performance under mixed workload', async () => {
      const maxResponseTime = 3000; // 3 seconds for mixed workload
      const token = TestHelpers.generateTestToken();
      
      const startTime = performance.now();
      
      // Mix of different types of requests
      const requests = [
        ...Array(5).fill(null).map(() => request(app).get('/ping')),
        ...Array(3).fill(null).map(() => 
          request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${token}`)
        ),
        ...Array(2).fill(null).map(() => 
          request(app)
            .get('/health')
        )
      ];
      
      const responses = await Promise.all(requests);
      const endTime = performance.now();
      
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(maxResponseTime);
      expect(responses).toHaveLength(10);
    });
  });
  
  describe('Memory Usage', () => {
    it('should not have significant memory leaks during repeated requests', async () => {
      const initialMemory = process.memoryUsage();
      const requestCount = 100;
      
      // Make many requests to check for memory leaks
      for (let i = 0; i < requestCount; i++) {
        await request(app)
          .get('/ping')
          .expect(200);
        
        // Force garbage collection every 10 requests if available
        if (i % 10 === 0 && global.gc) {
          global.gc();
        }
      }
      
      // Force final garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage();
      
      // Memory increase should be reasonable (less than 50MB)
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
    });
    
    it('should handle large payloads efficiently', async () => {
      const largePayload = {
        data: Array(1000).fill(null).map((_, i) => ({
          id: i,
          name: `Item ${i}`,
          description: `Description for item ${i}`.repeat(10),
          metadata: {
            tags: Array(5).fill(null).map((_, j) => `tag-${i}-${j}`),
            properties: {
              weight: Math.random() * 100,
              dimensions: {
                length: Math.random() * 50,
                width: Math.random() * 50,
                height: Math.random() * 50
              }
            }
          }
        }))
      };
      
      const maxResponseTime = 1000; // 1 second
      const startTime = performance.now();
      
      const response = await request(app)
        .post('/api/test')
        .send(largePayload);
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(maxResponseTime);
      // Should either process successfully or reject gracefully
      expect([200, 400, 413]).toContain(response.status);
    });
  });
  
  describe('Database Performance', () => {
    it('should handle database queries efficiently', async () => {
      const maxResponseTime = 500; // 500ms
      const token = TestHelpers.generateTestToken();
      
      // Test pagination performance
      const startTime = performance.now();
      const response = await request(app)
        .get('/api/products')
        .query({
          page: 1,
          pageSize: 20,
          orderBy: 'name',
          sortDirection: 'asc'
        })
        .set('Authorization', `Bearer ${token}`);
      const endTime = performance.now();
      
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(maxResponseTime);
    });
    
    it('should handle complex queries within time limits', async () => {
      const maxResponseTime = 1000; // 1 second
      const token = TestHelpers.generateTestToken();
      
      const startTime = performance.now();
      const response = await request(app)
        .get('/api/products')
        .query({
          page: 1,
          pageSize: 50,
          sellerId: 1,
          categoryId: 1,
          minPrice: 10,
          maxPrice: 1000,
          search: 'test',
          orderBy: 'price',
          sortDirection: 'desc'
        })
        .set('Authorization', `Bearer ${token}`);
      const endTime = performance.now();
      
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(maxResponseTime);
    });
  });
  
  describe('Rate Limiting Performance', () => {
    it('should implement rate limiting without significant overhead', async () => {
      const requestsUnderLimit = 50; // Under rate limit
      const maxTotalTime = 2000; // 2 seconds for all requests
      
      const startTime = performance.now();
      
      const requests = Array(requestsUnderLimit).fill(null).map(() =>
        request(app)
          .get('/ping')
          .expect((res) => {
            expect([200, 429]).toContain(res.status);
          })
      );
      
      await Promise.all(requests);
      const endTime = performance.now();
      
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(maxTotalTime);
    });
  });
  
  describe('Middleware Performance', () => {
    it('should process security middleware efficiently', async () => {
      const maxResponseTime = 100; // 100ms including all middleware
      
      const maliciousPayload = {
        name: '<script>alert("XSS")</script>'.repeat(10),
        description: '"; DROP TABLE users; --',
        data: { $ne: null }
      };
      
      const startTime = performance.now();
      const response = await request(app)
        .post('/api/test')
        .send(maliciousPayload);
      const endTime = performance.now();
      
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(maxResponseTime);
      
      // Should block or sanitize quickly
      expect([200, 400]).toContain(response.status);
    });
    
    it('should handle large input sanitization efficiently', async () => {
      const maxResponseTime = 500; // 500ms for large input processing
      
      const largeTextPayload = {
        content: 'Some text with <script>alert("XSS")</script> and more content. '.repeat(1000),
        description: 'Another field with "; DROP TABLE users; -- injection attempt. '.repeat(500)
      };
      
      const startTime = performance.now();
      const response = await request(app)
        .post('/api/test')
        .send(largeTextPayload);
      const endTime = performance.now();
      
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(maxResponseTime);
    });
  });
  
  describe('Error Handling Performance', () => {
    it('should handle errors efficiently', async () => {
      const maxResponseTime = 100; // 100ms for error handling
      
      const startTime = performance.now();
      const response = await request(app)
        .get('/api/nonexistent-endpoint');
      const endTime = performance.now();
      
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(maxResponseTime);
      expect(response.status).toBe(404);
    });
    
    it('should handle validation errors efficiently', async () => {
      const maxResponseTime = 200; // 200ms for validation
      
      const invalidPayload = {
        // Missing required fields or invalid data
        email: 'invalid-email',
        password: '123', // Too short
        name: '', // Empty required field
      };
      
      const startTime = performance.now();
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidPayload);
      const endTime = performance.now();
      
      const responseTime = endTime - startTime;
      expect(responseTime).toBeLessThan(maxResponseTime);
      expect(response.status).toBe(400);
    });
  });
  
  describe('Resource Usage Monitoring', () => {
    it('should provide performance metrics', async () => {
      const response = await request(app)
        .get('/health/detailed');
      
      if (response.status === 200) {
        expect(response.body.memory).toBeDefined();
        expect(response.body.uptime).toBeDefined();
        expect(response.body.cpu).toBeDefined();
        
        // Memory usage should be reasonable
        const memoryMB = response.body.memory.heapUsed / (1024 * 1024);
        expect(memoryMB).toBeLessThan(500); // Less than 500MB
      }
    });
    
    it('should track response times in monitoring', async () => {
      // Make a few requests to generate metrics
      await Promise.all([
        request(app).get('/ping'),
        request(app).get('/health'),
        request(app).get('/ping'),
      ]);
      
      const response = await request(app)
        .get('/metrics');
      
      if (response.status === 200) {
        expect(response.body.timestamp).toBeDefined();
        expect(response.body.uptime).toBeDefined();
        
        // Should include performance stats if available
        if (response.body.stats) {
          expect(response.body.stats).toBeDefined();
        }
      }
    });
  });
});