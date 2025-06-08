import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { TestHelpers } from '../../helpers/test-helpers';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../../models/user.model');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let responseData: any;
  
  beforeEach(() => {
    responseData = {};
    
    mockRequest = {
      headers: {},
      user: undefined
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
  
  describe('Token Validation', () => {
    it('should authenticate valid token', async () => {
      const token = 'valid-jwt-token';
      const decodedToken = {
        id: 1,
        email: 'user@example.com',
        role: 'user'
      };
      
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };
      
      // Mock JWT verification
      const mockJwt = jwt as jest.Mocked<typeof jwt>;
      mockJwt.verify = jest.fn().mockReturnValue(decodedToken);
      
      // Mock user model
      const mockUserModel = require('../../../models/user.model').UserModel;
      mockUserModel.findById = jest.fn().mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        role: 'user',
        isActive: true
      });
      
      await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockJwt.verify).toHaveBeenCalledWith(token, expect.any(String));
      expect(mockRequest.user).toEqual(decodedToken);
      expect(nextFunction).toHaveBeenCalled();
    });
    
    it('should reject request without authorization header', async () => {
      mockRequest.headers = {};
      
      await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('No token provided');
      expect(nextFunction).not.toHaveBeenCalled();
    });
    
    it('should reject request with malformed authorization header', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token'
      };
      
      await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Invalid token format');
      expect(nextFunction).not.toHaveBeenCalled();
    });
    
    it('should reject invalid/expired token', async () => {
      const token = 'invalid-jwt-token';
      
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };
      
      // Mock JWT verification to throw error
      const mockJwt = jwt as jest.Mocked<typeof jwt>;
      mockJwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Token expired');
      });
      
      await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Invalid or expired token');
      expect(nextFunction).not.toHaveBeenCalled();
    });
    
    it('should reject token for inactive user', async () => {
      const token = 'valid-jwt-token';
      const decodedToken = {
        id: 1,
        email: 'user@example.com',
        role: 'user'
      };
      
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };
      
      // Mock JWT verification
      const mockJwt = jwt as jest.Mocked<typeof jwt>;
      mockJwt.verify = jest.fn().mockReturnValue(decodedToken);
      
      // Mock inactive user
      const mockUserModel = require('../../../models/user.model').UserModel;
      mockUserModel.findById = jest.fn().mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        role: 'user',
        isActive: false
      });
      
      await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Account is disabled');
      expect(nextFunction).not.toHaveBeenCalled();
    });
    
    it('should reject token for non-existent user', async () => {
      const token = 'valid-jwt-token';
      const decodedToken = {
        id: 999,
        email: 'nonexistent@example.com',
        role: 'user'
      };
      
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };
      
      // Mock JWT verification
      const mockJwt = jwt as jest.Mocked<typeof jwt>;
      mockJwt.verify = jest.fn().mockReturnValue(decodedToken);
      
      // Mock user not found
      const mockUserModel = require('../../../models/user.model').UserModel;
      mockUserModel.findById = jest.fn().mockResolvedValue(null);
      
      await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('User not found');
      expect(nextFunction).not.toHaveBeenCalled();
    });
    
    it('should handle database errors gracefully', async () => {
      const token = 'valid-jwt-token';
      const decodedToken = {
        id: 1,
        email: 'user@example.com',
        role: 'user'
      };
      
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };
      
      // Mock JWT verification
      const mockJwt = jwt as jest.Mocked<typeof jwt>;
      mockJwt.verify = jest.fn().mockReturnValue(decodedToken);
      
      // Mock database error
      const mockUserModel = require('../../../models/user.model').UserModel;
      mockUserModel.findById = jest.fn().mockRejectedValue(new Error('Database connection failed'));
      
      await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Authentication failed');
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
  
  describe('Token Extraction', () => {
    it('should extract token from Authorization header', async () => {
      const token = TestHelpers.generateTestToken();
      
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };
      
      const mockJwt = jwt as jest.Mocked<typeof jwt>;
      mockJwt.verify = jest.fn().mockReturnValue({
        id: 1,
        email: 'user@example.com',
        role: 'user'
      });
      
      const mockUserModel = require('../../../models/user.model').UserModel;
      mockUserModel.findById = jest.fn().mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        role: 'user',
        isActive: true
      });
      
      await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockJwt.verify).toHaveBeenCalledWith(token, expect.any(String));
      expect(nextFunction).toHaveBeenCalled();
    });
    
    it('should handle different authorization header formats', async () => {
      const testCases = [
        'bearer token123',  // lowercase
        'BEARER token123',  // uppercase
        'Bearer  token123', // extra space
      ];
      
      for (const authHeader of testCases) {
        // Reset mocks for each test case
        jest.clearAllMocks();
        
        mockRequest.headers = {
          authorization: authHeader
        };
        
        const mockJwt = jwt as jest.Mocked<typeof jwt>;
        mockJwt.verify = jest.fn().mockReturnValue({
          id: 1,
          email: 'user@example.com',
          role: 'user'
        });
        
        const mockUserModel = require('../../../models/user.model').UserModel;
        mockUserModel.findById = jest.fn().mockResolvedValue({
          id: 1,
          email: 'user@example.com',
          role: 'user',
          isActive: true
        });
        
        await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
        
        expect(mockJwt.verify).toHaveBeenCalledWith('token123', expect.any(String));
        expect(nextFunction).toHaveBeenCalled();
      }
    });
  });
  
  describe('Token Refresh', () => {
    it('should handle near-expiry tokens appropriately', async () => {
      const nearExpiryToken = TestHelpers.generateTestToken({}, { expiresIn: '5m' });
      
      mockRequest.headers = {
        authorization: `Bearer ${nearExpiryToken}`
      };
      
      const mockJwt = jwt as jest.Mocked<typeof jwt>;
      mockJwt.verify = jest.fn().mockReturnValue({
        id: 1,
        email: 'user@example.com',
        role: 'user',
        exp: Math.floor(Date.now() / 1000) + 300 // 5 minutes from now
      });
      
      const mockUserModel = require('../../../models/user.model').UserModel;
      mockUserModel.findById = jest.fn().mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        role: 'user',
        isActive: true
      });
      
      await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
      // Could add logic to set a refresh token hint in response headers
    });
  });
  
  describe('Security Headers', () => {
    it('should not expose sensitive information in error responses', async () => {
      const token = 'malicious-token';
      
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };
      
      const mockJwt = jwt as jest.Mocked<typeof jwt>;
      mockJwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Detailed JWT error with sensitive info');
      });
      
      await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseData.message).toBe('Invalid or expired token');
      expect(responseData.message).not.toContain('sensitive info');
      expect(nextFunction).not.toHaveBeenCalled();
    });
    
    it('should log security events for failed authentication attempts', async () => {
      // This would test security logging if implemented
      const token = 'suspicious-token';
      
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };
      mockRequest.ip = '192.168.1.100';
      
      const mockJwt = jwt as jest.Mocked<typeof jwt>;
      mockJwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid signature');
      });
      
      await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      // Could verify that security logging was called
    });
  });
});