import { Request, Response, NextFunction } from 'express';
import { sanitizeInputs, detectSQLInjection, detectNoSQLInjection, InputSanitizer } from '../../../middleware/validation.middleware';
import { TestHelpers } from '../../helpers/test-helpers';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let responseData: any;
  
  beforeEach(() => {
    responseData = {};
    
    mockRequest = {
      body: {},
      query: {},
      params: {},
      ip: '127.0.0.1'
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      })
    };
    
    nextFunction = jest.fn();
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  describe('Input Sanitization', () => {
    it('should sanitize XSS attempts in request body', () => {
      const middleware = sanitizeInputs({ logViolations: false });
      
      mockRequest.body = {
        name: '<script>alert("XSS")</script>',
        description: 'Normal text',
        content: '<img src="x" onerror="alert(\'XSS\')">'
      };
      
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockRequest.body.name).not.toContain('<script>');
      expect(mockRequest.body.description).toBe('Normal text');
      expect(mockRequest.body.content).not.toContain('onerror=');
      expect(nextFunction).toHaveBeenCalled();
    });
    
    it('should sanitize XSS attempts in query parameters', () => {
      const middleware = sanitizeInputs({ logViolations: false });
      
      mockRequest.query = {
        search: '<script>alert("XSS")</script>',
        filter: 'normal-value',
        sort: 'javascript:alert("XSS")'
      };
      
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockRequest.query.search).not.toContain('<script>');
      expect(mockRequest.query.filter).toBe('normal-value');
      expect(mockRequest.query.sort).not.toContain('javascript:');
      expect(nextFunction).toHaveBeenCalled();
    });
    
    it('should sanitize nested objects', () => {
      const middleware = sanitizeInputs({ logViolations: false });
      
      mockRequest.body = {
        user: {
          name: '<script>alert("XSS")</script>',
          profile: {
            bio: '<img src="x" onerror="alert(\'XSS\')">'
          }
        },
        metadata: {
          tags: ['<script>evil</script>', 'normal-tag']
        }
      };
      
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockRequest.body.user.name).not.toContain('<script>');
      expect(mockRequest.body.user.profile.bio).not.toContain('onerror=');
      expect(mockRequest.body.metadata.tags[0]).not.toContain('<script>');
      expect(mockRequest.body.metadata.tags[1]).toBe('normal-tag');
      expect(nextFunction).toHaveBeenCalled();
    });
    
    it('should handle arrays of objects', () => {
      const middleware = sanitizeInputs({ logViolations: false });
      
      mockRequest.body = {
        items: [
          { name: '<script>alert("XSS")</script>', value: 'safe' },
          { name: 'normal', value: '<img src="x" onerror="alert(\'XSS\')">' }
        ]
      };
      
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockRequest.body.items[0].name).not.toContain('<script>');
      expect(mockRequest.body.items[0].value).toBe('safe');
      expect(mockRequest.body.items[1].name).toBe('normal');
      expect(mockRequest.body.items[1].value).not.toContain('onerror=');
      expect(nextFunction).toHaveBeenCalled();
    });
    
    it('should preserve non-string values', () => {
      const middleware = sanitizeInputs({ logViolations: false });
      
      mockRequest.body = {
        id: 123,
        active: true,
        score: 45.67,
        tags: null,
        metadata: undefined,
        date: new Date()
      };
      
      const originalBody = { ...mockRequest.body };
      
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockRequest.body.id).toBe(123);
      expect(mockRequest.body.active).toBe(true);
      expect(mockRequest.body.score).toBe(45.67);
      expect(mockRequest.body.tags).toBe(null);
      expect(mockRequest.body.date).toEqual(originalBody.date);
      expect(nextFunction).toHaveBeenCalled();
    });
  });
  
  describe('SQL Injection Detection', () => {
    it('should detect and block SQL injection attempts', () => {
      const middleware = detectSQLInjection();
      
      const sqlInjectionPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --",
        "' UNION SELECT * FROM passwords --",
        "admin'--",
        "' OR 1=1 #"
      ];
      
      sqlInjectionPayloads.forEach(payload => {
        jest.clearAllMocks();
        
        mockRequest.body = { username: payload };
        
        middleware(mockRequest as Request, mockResponse as Response, nextFunction);
        
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(responseData.success).toBe(false);
        expect(responseData.message).toContain('Potential SQL injection');
        expect(nextFunction).not.toHaveBeenCalled();
      });
    });
    
    it('should allow safe SQL-like strings', () => {
      const middleware = detectSQLInjection();
      
      const safeStrings = [
        "user@example.com",
        "Product name with 'quotes'",
        "Description with OR operator",
        "SELECT-ed as a product name",
        "My company & partners"
      ];
      
      safeStrings.forEach(safeString => {
        jest.clearAllMocks();
        
        mockRequest.body = { description: safeString };
        
        middleware(mockRequest as Request, mockResponse as Response, nextFunction);
        
        expect(nextFunction).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
      });
    });
    
    it('should check query parameters for SQL injection', () => {
      const middleware = detectSQLInjection();
      
      mockRequest.query = {
        search: "'; DROP TABLE products; --"
      };
      
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toContain('Potential SQL injection');
      expect(nextFunction).not.toHaveBeenCalled();
    });
    
    it('should check URL parameters for SQL injection', () => {
      const middleware = detectSQLInjection();
      
      mockRequest.params = {
        id: "1; DROP TABLE users; --"
      };
      
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toContain('Potential SQL injection');
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
  
  describe('NoSQL Injection Detection', () => {
    it('should detect and block NoSQL injection attempts', () => {
      const middleware = detectNoSQLInjection();
      
      const nosqlInjectionPayloads = [
        { $ne: null },
        { $gt: "" },
        { $regex: ".*" },
        { $where: "this.username == 'admin'" },
        { $eval: "function() { return true; }" }
      ];
      
      nosqlInjectionPayloads.forEach(payload => {
        jest.clearAllMocks();
        
        mockRequest.body = { filter: payload };
        
        middleware(mockRequest as Request, mockResponse as Response, nextFunction);
        
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(responseData.success).toBe(false);
        expect(responseData.message).toContain('Potential NoSQL injection');
        expect(nextFunction).not.toHaveBeenCalled();
      });
    });
    
    it('should detect NoSQL operators in nested objects', () => {
      const middleware = detectNoSQLInjection();
      
      mockRequest.body = {
        user: {
          credentials: {
            password: { $ne: null }
          }
        }
      };
      
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toContain('Potential NoSQL injection');
      expect(nextFunction).not.toHaveBeenCalled();
    });
    
    it('should allow safe objects with similar keys', () => {
      const middleware = detectNoSQLInjection();
      
      const safeObjects = [
        { name: "Product", description: "Great product" },
        { $price: 100 }, // Not a MongoDB operator
        { settings: { theme: "dark", language: "en" } },
        { metadata: { version: "1.0", updated: new Date() } }
      ];
      
      safeObjects.forEach(safeObj => {
        jest.clearAllMocks();
        
        mockRequest.body = safeObj;
        
        middleware(mockRequest as Request, mockResponse as Response, nextFunction);
        
        expect(nextFunction).toHaveBeenCalled();
        expect(mockResponse.status).not.toHaveBeenCalled();
      });
    });
  });
  
  describe('InputSanitizer Class', () => {
    let sanitizer: InputSanitizer;
    
    beforeEach(() => {
      sanitizer = new InputSanitizer();
    });
    
    it('should sanitize HTML and XSS', () => {
      const maliciousHtml = '<script>alert("XSS")</script><p>Safe content</p>';
      const sanitized = sanitizer.sanitizeHtml(maliciousHtml);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('<p>Safe content</p>');
    });
    
    it('should detect SQL injection patterns', () => {
      const sqlPayloads = [
        "'; DROP TABLE users; --",
        "' OR 1=1 --",
        "admin'/*"
      ];
      
      sqlPayloads.forEach(payload => {
        expect(sanitizer.detectSQLInjection(payload)).toBe(true);
      });
      
      const safeStrings = [
        "user@example.com",
        "Normal product name",
        "Description with 'quotes'"
      ];
      
      safeStrings.forEach(safeString => {
        expect(sanitizer.detectSQLInjection(safeString)).toBe(false);
      });
    });
    
    it('should detect NoSQL injection patterns', () => {
      const nosqlPayloads = [
        { $ne: null },
        { $gt: "" },
        { $where: "malicious code" }
      ];
      
      nosqlPayloads.forEach(payload => {
        expect(sanitizer.detectNoSQLInjection(payload)).toBe(true);
      });
      
      const safeObjects = [
        { name: "Product" },
        { price: 100 },
        { $customField: "value" } // Not a MongoDB operator
      ];
      
      safeObjects.forEach(safeObj => {
        expect(sanitizer.detectNoSQLInjection(safeObj)).toBe(false);
      });
    });
    
    it('should sanitize object recursively', () => {
      const maliciousObject = {
        name: '<script>alert("XSS")</script>',
        nested: {
          description: '<img src="x" onerror="alert(\'XSS\')">'
        },
        array: ['<script>evil</script>', 'safe-value']
      };
      
      const sanitized = sanitizer.sanitizeObject(maliciousObject);
      
      expect(sanitized.name).not.toContain('<script>');
      expect(sanitized.nested.description).not.toContain('onerror=');
      expect(sanitized.array[0]).not.toContain('<script>');
      expect(sanitized.array[1]).toBe('safe-value');
    });
    
    it('should handle circular references gracefully', () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;
      
      // Should not throw error
      expect(() => {
        sanitizer.sanitizeObject(circularObj);
      }).not.toThrow();
    });
    
    it('should validate email format', () => {
      const validEmails = [
        'user@example.com',
        'test.email+tag@domain.co.uk',
        'user123@subdomain.example.org'
      ];
      
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user space@domain.com'
      ];
      
      validEmails.forEach(email => {
        expect(sanitizer.isValidEmail(email)).toBe(true);
      });
      
      invalidEmails.forEach(email => {
        expect(sanitizer.isValidEmail(email)).toBe(false);
      });
    });
    
    it('should validate URL format', () => {
      const validUrls = [
        'http://example.com',
        'https://subdomain.example.org/path',
        'https://example.com:8080/path?query=value'
      ];
      
      const invalidUrls = [
        'not-a-url',
        'javascript:alert("XSS")',
        'ftp://example.com', // If only HTTP/HTTPS allowed
        'http://'
      ];
      
      validUrls.forEach(url => {
        expect(sanitizer.isValidUrl(url)).toBe(true);
      });
      
      invalidUrls.forEach(url => {
        expect(sanitizer.isValidUrl(url)).toBe(false);
      });
    });
  });
  
  describe('Error Handling', () => {
    it('should handle malformed input gracefully', () => {
      const middleware = sanitizeInputs({ logViolations: false });
      
      // Test with circular reference
      const circularObj: any = {};
      circularObj.self = circularObj;
      mockRequest.body = circularObj;
      
      expect(() => {
        middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      }).not.toThrow();
      
      expect(nextFunction).toHaveBeenCalled();
    });
    
    it('should handle very large payloads', () => {
      const middleware = sanitizeInputs({ logViolations: false });
      
      // Create large payload
      const largeString = 'x'.repeat(10000);
      mockRequest.body = { data: largeString };
      
      const startTime = Date.now();
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      const endTime = Date.now();
      
      // Should complete within reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
      expect(nextFunction).toHaveBeenCalled();
    });
  });
});