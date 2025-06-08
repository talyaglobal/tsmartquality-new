import { Request, Response } from 'express';
import { UserController } from '../../../controllers/user.controller';
import { TestHelpers } from '../../helpers/test-helpers';
import { mockDatabase } from '../../mocks/database.mock';
import { testUsers, validUserData, invalidUserData } from '../../fixtures/test-data';

// Mock dependencies
jest.mock('../../../models/user.model');
jest.mock('../../../utils/database');
jest.mock('../../../services/audit.service');
jest.mock('../../../services/rbac.service');
jest.mock('../../../utils/business-rules');
jest.mock('../../../utils/controller-helpers');

describe('UserController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseData: any;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockDatabase.reset();
    responseData = {};
    
    // Mock response object
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      }),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis()
    };
    
    // Mock request object
    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: undefined,
      ip: '127.0.0.1',
      headers: {}
    };
  });
  
  describe('register', () => {
    it('should successfully register a new user', async () => {
      mockRequest.body = validUserData;
      
      // Mock UserModel methods
      const mockUserModel = require('../../../models/user.model').UserModel;
      mockUserModel.findByEmail = jest.fn().mockResolvedValue(null);
      mockUserModel.findByUsername = jest.fn().mockResolvedValue(null);
      mockUserModel.create = jest.fn().mockResolvedValue({
        id: 1,
        ...validUserData,
        passwordHash: '$2a$10$hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Mock business rules validation
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.validateUserData = jest.fn().mockReturnValue([]);
      
      // Mock controller helpers
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.validatePassword = jest.fn().mockReturnValue([]);
      mockControllerHelpers.validateEmail = jest.fn().mockReturnValue(null);
      mockControllerHelpers.sendSuccess = jest.fn().mockImplementation((res, data, message, status) => {
        res.status(status || 201).json({
          success: true,
          message: message || 'Success',
          data
        });
      });
      
      await UserController.register(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseData.success).toBe(true);
      expect(responseData.data).toBeDefined();
      expect(mockUserModel.create).toHaveBeenCalled();
    });
    
    it('should reject registration with invalid data', async () => {
      mockRequest.body = invalidUserData;
      
      // Mock validation to return errors
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.validateUserData = jest.fn().mockReturnValue([
        { field: 'email', message: 'Invalid email format' }
      ]);
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.validatePassword = jest.fn().mockReturnValue([
        { field: 'password', message: 'Password too short' }
      ]);
      mockControllerHelpers.validateEmail = jest.fn().mockReturnValue(
        { field: 'email', message: 'Invalid email format' }
      );
      mockControllerHelpers.sendValidationError = jest.fn().mockImplementation((res, errors) => {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      });
      
      await UserController.register(mockRequest as Request, mockResponse as Response);
      
      expect(mockControllerHelpers.sendValidationError).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
    
    it('should reject registration with existing email', async () => {
      mockRequest.body = validUserData;
      
      // Mock existing user
      const mockUserModel = require('../../../models/user.model').UserModel;
      mockUserModel.findByEmail = jest.fn().mockResolvedValue(testUsers[0]);
      
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.validateUserData = jest.fn().mockReturnValue([]);
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.validatePassword = jest.fn().mockReturnValue([]);
      mockControllerHelpers.validateEmail = jest.fn().mockReturnValue(null);
      mockControllerHelpers.sendError = jest.fn().mockImplementation((res, message, status) => {
        res.status(status || 400).json({
          success: false,
          message
        });
      });
      
      await UserController.register(mockRequest as Request, mockResponse as Response);
      
      expect(mockControllerHelpers.sendError).toHaveBeenCalledWith(
        mockResponse,
        'Email already exists',
        409
      );
    });
    
    it('should handle database errors gracefully', async () => {
      mockRequest.body = validUserData;
      
      // Mock database error
      const mockUserModel = require('../../../models/user.model').UserModel;
      mockUserModel.findByEmail = jest.fn().mockRejectedValue(new Error('Database connection failed'));
      
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.validateUserData = jest.fn().mockReturnValue([]);
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.validatePassword = jest.fn().mockReturnValue([]);
      mockControllerHelpers.validateEmail = jest.fn().mockReturnValue(null);
      mockControllerHelpers.sendError = jest.fn().mockImplementation((res, message, status) => {
        res.status(status || 500).json({
          success: false,
          message
        });
      });
      
      await UserController.register(mockRequest as Request, mockResponse as Response);
      
      expect(mockControllerHelpers.sendError).toHaveBeenCalledWith(
        mockResponse,
        'Registration failed',
        500
      );
    });
  });
  
  describe('login', () => {
    beforeEach(() => {
      // Clear login attempts before each test
      const loginAttempts = new Map();
    });
    
    it('should successfully login with valid credentials', async () => {
      mockRequest.body = {
        email: 'user@example.com',
        password: 'SecurePassword123!'
      };
      
      const mockUserModel = require('../../../models/user.model').UserModel;
      mockUserModel.findByEmail = jest.fn().mockResolvedValue({
        ...testUsers[1],
        passwordHash: '$2a$10$hashedpassword'
      });
      
      // Mock bcrypt compare
      const bcrypt = require('bcrypt');
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.generateTokens = jest.fn().mockReturnValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      });
      mockControllerHelpers.sendSuccess = jest.fn().mockImplementation((res, data, message, status) => {
        res.status(status || 200).json({
          success: true,
          message: message || 'Success',
          data
        });
      });
      
      await UserController.login(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.user).toBeDefined();
      expect(responseData.data.tokens).toBeDefined();
    });
    
    it('should reject login with invalid credentials', async () => {
      mockRequest.body = {
        email: 'user@example.com',
        password: 'wrong-password'
      };
      
      const mockUserModel = require('../../../models/user.model').UserModel;
      mockUserModel.findByEmail = jest.fn().mockResolvedValue({
        ...testUsers[1],
        passwordHash: '$2a$10$hashedpassword'
      });
      
      // Mock bcrypt compare to fail
      const bcrypt = require('bcrypt');
      bcrypt.compare = jest.fn().mockResolvedValue(false);
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.sendError = jest.fn().mockImplementation((res, message, status) => {
        res.status(status || 400).json({
          success: false,
          message
        });
      });
      
      await UserController.login(mockRequest as Request, mockResponse as Response);
      
      expect(mockControllerHelpers.sendError).toHaveBeenCalledWith(
        mockResponse,
        'Invalid credentials',
        401
      );
    });
    
    it('should reject login for inactive user', async () => {
      mockRequest.body = {
        email: 'inactive@example.com',
        password: 'SecurePassword123!'
      };
      
      const mockUserModel = require('../../../models/user.model').UserModel;
      mockUserModel.findByEmail = jest.fn().mockResolvedValue({
        ...testUsers[2], // inactive user
        passwordHash: '$2a$10$hashedpassword'
      });
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.sendError = jest.fn().mockImplementation((res, message, status) => {
        res.status(status || 400).json({
          success: false,
          message
        });
      });
      
      await UserController.login(mockRequest as Request, mockResponse as Response);
      
      expect(mockControllerHelpers.sendError).toHaveBeenCalledWith(
        mockResponse,
        'Account is disabled',
        403
      );
    });
    
    it('should handle rate limiting for multiple failed attempts', async () => {
      mockRequest.body = {
        email: 'user@example.com',
        password: 'wrong-password'
      };
      mockRequest.ip = '192.168.1.100';
      
      const mockUserModel = require('../../../models/user.model').UserModel;
      mockUserModel.findByEmail = jest.fn().mockResolvedValue({
        ...testUsers[1],
        passwordHash: '$2a$10$hashedpassword'
      });
      
      const bcrypt = require('bcrypt');
      bcrypt.compare = jest.fn().mockResolvedValue(false);
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.sendError = jest.fn().mockImplementation((res, message, status) => {
        res.status(status || 400).json({
          success: false,
          message
        });
      });
      
      // Simulate multiple failed attempts
      for (let i = 0; i < 6; i++) {
        await UserController.login(mockRequest as Request, mockResponse as Response);
      }
      
      // Should be rate limited
      expect(mockControllerHelpers.sendError).toHaveBeenLastCalledWith(
        mockResponse,
        expect.stringContaining('Too many login attempts'),
        429
      );
    });
  });
  
  describe('getProfile', () => {
    it('should return user profile for authenticated user', async () => {
      const mockAuthRequest = {
        ...mockRequest,
        user: { id: 1, email: 'user@example.com', role: 'user' }
      };
      
      const mockUserModel = require('../../../models/user.model').UserModel;
      mockUserModel.findById = jest.fn().mockResolvedValue(testUsers[1]);
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.sendSuccess = jest.fn().mockImplementation((res, data, message, status) => {
        res.status(status || 200).json({
          success: true,
          message: message || 'Success',
          data
        });
      });
      
      await UserController.getProfile(mockAuthRequest as any, mockResponse as Response);
      
      expect(mockUserModel.findById).toHaveBeenCalledWith(1);
      expect(mockControllerHelpers.sendSuccess).toHaveBeenCalled();
    });
    
    it('should handle user not found', async () => {
      const mockAuthRequest = {
        ...mockRequest,
        user: { id: 999, email: 'notfound@example.com', role: 'user' }
      };
      
      const mockUserModel = require('../../../models/user.model').UserModel;
      mockUserModel.findById = jest.fn().mockResolvedValue(null);
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.sendError = jest.fn().mockImplementation((res, message, status) => {
        res.status(status || 400).json({
          success: false,
          message
        });
      });
      
      await UserController.getProfile(mockAuthRequest as any, mockResponse as Response);
      
      expect(mockControllerHelpers.sendError).toHaveBeenCalledWith(
        mockResponse,
        'User not found',
        404
      );
    });
  });
  
  describe('updateProfile', () => {
    it('should successfully update user profile', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };
      
      const mockAuthRequest = {
        ...mockRequest,
        user: { id: 1, email: 'user@example.com', role: 'user' },
        body: updateData
      };
      
      const mockUserModel = require('../../../models/user.model').UserModel;
      mockUserModel.findById = jest.fn().mockResolvedValue(testUsers[1]);
      mockUserModel.update = jest.fn().mockResolvedValue({
        ...testUsers[1],
        ...updateData,
        updatedAt: new Date()
      });
      
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.validateUserData = jest.fn().mockReturnValue([]);
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.sendSuccess = jest.fn().mockImplementation((res, data, message, status) => {
        res.status(status || 200).json({
          success: true,
          message: message || 'Success',
          data
        });
      });
      
      await UserController.updateProfile(mockAuthRequest as any, mockResponse as Response);
      
      expect(mockUserModel.update).toHaveBeenCalledWith(1, updateData);
      expect(mockControllerHelpers.sendSuccess).toHaveBeenCalled();
    });
    
    it('should reject invalid update data', async () => {
      const invalidUpdateData = {
        email: 'invalid-email-format'
      };
      
      const mockAuthRequest = {
        ...mockRequest,
        user: { id: 1, email: 'user@example.com', role: 'user' },
        body: invalidUpdateData
      };
      
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.validateUserData = jest.fn().mockReturnValue([
        { field: 'email', message: 'Invalid email format' }
      ]);
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.sendValidationError = jest.fn().mockImplementation((res, errors) => {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      });
      
      await UserController.updateProfile(mockAuthRequest as any, mockResponse as Response);
      
      expect(mockControllerHelpers.sendValidationError).toHaveBeenCalled();
    });
  });
});