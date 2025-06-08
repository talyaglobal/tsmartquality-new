import { TestHelpers } from '../helpers/test-helpers';

describe('Test Framework Setup', () => {
  describe('TestHelpers', () => {
    it('should generate valid test tokens', () => {
      const token = TestHelpers.generateTestToken();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
    
    it('should generate admin tokens', () => {
      const adminToken = TestHelpers.generateAdminToken();
      expect(typeof adminToken).toBe('string');
      expect(adminToken.split('.')).toHaveLength(3);
    });
    
    it('should generate expired tokens', () => {
      const expiredToken = TestHelpers.generateExpiredToken();
      expect(typeof expiredToken).toBe('string');
      expect(expiredToken.split('.')).toHaveLength(3);
    });
    
    it('should generate random strings', () => {
      const randomStr = TestHelpers.randomString(10);
      expect(typeof randomStr).toBe('string');
      expect(randomStr).toHaveLength(10);
    });
    
    it('should generate random emails', () => {
      const email = TestHelpers.randomEmail();
      expect(typeof email).toBe('string');
      expect(email).toMatch(/^test-\w{8}@example\.com$/);
    });
    
    it('should validate API responses', () => {
      const mockResponse = {
        body: {
          success: true,
          data: { id: 1 },
          message: 'Success'
        }
      };
      
      expect(() => {
        TestHelpers.validateApiResponse(mockResponse, ['success', 'data']);
      }).not.toThrow();
    });
    
    it('should validate success responses', () => {
      const mockResponse = {
        status: 200,
        body: {
          success: true,
          data: {}
        }
      };
      
      expect(() => {
        TestHelpers.validateSuccessResponse(mockResponse);
      }).not.toThrow();
    });
    
    it('should validate error responses', () => {
      const mockResponse = {
        status: 400,
        body: {
          success: false,
          message: 'Error occurred'
        }
      };
      
      expect(() => {
        TestHelpers.validateErrorResponse(mockResponse);
      }).not.toThrow();
    });
  });
  
  describe('Global Test Utilities', () => {
    it('should have global test utilities available', () => {
      expect(global.testUtils).toBeDefined();
      expect(typeof global.testUtils.wait).toBe('function');
      expect(typeof global.testUtils.generateTestUser).toBe('function');
      expect(typeof global.testUtils.generateTestProduct).toBe('function');
      expect(typeof global.testUtils.generateTestQualityCheck).toBe('function');
    });
    
    it('should generate test user data', () => {
      const user = global.testUtils.generateTestUser();
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('role');
      expect(user.email).toMatch(/^[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}$/);
    });
    
    it('should generate test product data', () => {
      const product = global.testUtils.generateTestProduct();
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('code');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('sellerId');
    });
    
    it('should generate test quality check data', () => {
      const qualityCheck = global.testUtils.generateTestQualityCheck();
      expect(qualityCheck).toHaveProperty('id');
      expect(qualityCheck).toHaveProperty('productId');
      expect(qualityCheck).toHaveProperty('checkerId');
      expect(qualityCheck).toHaveProperty('status');
    });
  });
  
  describe('Custom Jest Matchers', () => {
    it('should validate dates with custom matcher', () => {
      const validDate = new Date();
      const invalidDate = new Date('invalid');
      
      expect(validDate).toBeValidDate();
      expect(invalidDate).not.toBeValidDate();
    });
    
    it('should validate emails with custom matcher', () => {
      const validEmail = 'test@example.com';
      const invalidEmail = 'invalid-email';
      
      expect(validEmail).toBeValidEmail();
      expect(invalidEmail).not.toBeValidEmail();
    });
  });
  
  describe('Environment Setup', () => {
    it('should be running in test environment', () => {
      expect(process.env.NODE_ENV).toBe('test');
    });
    
    it('should have test secrets configured', () => {
      expect(process.env.JWT_SECRET).toBeDefined();
      expect(process.env.JWT_REFRESH_SECRET).toBeDefined();
      expect(process.env.ENCRYPTION_KEY).toBeDefined();
      expect(process.env.SESSION_SECRET).toBeDefined();
    });
    
    it('should have logging disabled', () => {
      expect(process.env.LOG_LEVEL).toBe('silent');
    });
  });
});