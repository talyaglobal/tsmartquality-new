import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';
import * as authController from '../../controllers/auth.controller';

// Mock response and request
const mockRequest = () => {
  const req = {} as Request;
  req.body = {};
  req.params = {};
  req.query = {};
  req.user = {
    id: 'test-user-id',
    email: 'test@example.com',
    company_id: 1,
    is_admin: false
  };
  return req;
};

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Controller', () => {
  describe('login', () => {
    it('should return 400 if email or password is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      // Act
      await authController.login(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email and password are required'
      });
    });
    
    it('should return 401 if credentials are invalid', async () => {
      // Arrange
      const req = mockRequest();
      req.body.email = 'test@example.com';
      req.body.password = 'wrongpassword';
      const res = mockResponse();
      
      // Mock Supabase to return an error
      const mockError = { message: 'Invalid credentials' };
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError
      });
      
      // Act
      await authController.login(req, res);
      
      // Assert
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid credentials'
      });
    });
    
    it('should return user and token if credentials are valid', async () => {
      // Arrange
      const req = mockRequest();
      req.body.email = 'test@example.com';
      req.body.password = 'password123';
      const res = mockResponse();
      
      // Mock Supabase auth response
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com'
      };
      const mockSession = {
        access_token: 'test-token',
        refresh_token: 'test-refresh-token'
      };
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });
      
      // Mock user data from database
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: {
          id: 'test-user-id',
          email: 'test@example.com',
          full_name: 'Test User',
          company_id: 1,
          is_admin: false,
          is_company_admin: false,
          is_active: true
        },
        error: null
      });
      
      // Act
      await authController.login(req, res);
      
      // Assert
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          user: expect.objectContaining({
            id: 'test-user-id',
            email: 'test@example.com',
            full_name: 'Test User'
          }),
          token: mockSession.access_token
        })
      }));
    });
  });
  
  describe('register', () => {
    it('should return 400 if required fields are missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      // Act
      await authController.register(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email, password, and full name are required'
      });
    });
    
    it('should create a new user and return user data with token', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        email: 'newuser@example.com',
        password: 'password123',
        full_name: 'New User',
        company_id: 1
      };
      const res = mockResponse();
      
      // Mock Supabase auth signup response
      const mockUser = {
        id: 'new-user-id',
        email: 'newuser@example.com'
      };
      const mockSession = {
        access_token: 'new-user-token',
        refresh_token: 'new-refresh-token'
      };
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      });
      
      // Mock user insertion into database
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.insert as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: {
          id: 'new-user-id',
          email: 'newuser@example.com',
          full_name: 'New User',
          company_id: 1,
          is_admin: false,
          is_company_admin: false,
          is_active: true
        },
        error: null
      });
      
      // Act
      await authController.register(req, res);
      
      // Assert
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123'
      });
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        id: 'new-user-id',
        email: 'newuser@example.com',
        full_name: 'New User',
        company_id: 1
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          user: expect.objectContaining({
            id: 'new-user-id',
            email: 'newuser@example.com',
            full_name: 'New User'
          }),
          token: mockSession.access_token
        })
      }));
    });
    
    it('should return 400 if user already exists', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        email: 'existing@example.com',
        password: 'password123',
        full_name: 'Existing User',
        company_id: 1
      };
      const res = mockResponse();
      
      // Mock Supabase auth signup response with error
      const mockError = { message: 'User already exists' };
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError
      });
      
      // Act
      await authController.register(req, res);
      
      // Assert
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'existing@example.com',
        password: 'password123'
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User already exists'
      });
    });
  });
  
  describe('changePassword', () => {
    it('should return 400 if current password or new password is missing', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      // Act
      await authController.changePassword(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Current password and new password are required'
      });
    });
    
    it('should return 400 if current password is incorrect', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        current_password: 'wrongpassword',
        new_password: 'newpassword123'
      };
      const res = mockResponse();
      
      // Mock Supabase auth signin response with error
      const mockError = { message: 'Invalid login credentials' };
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError
      });
      
      // Act
      await authController.changePassword(req, res);
      
      // Assert
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Current password is incorrect'
      });
    });
    
    it('should change password and return success message', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        current_password: 'currentpassword',
        new_password: 'newpassword123'
      };
      const res = mockResponse();
      
      // Mock Supabase auth signin response
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user-id' }, session: {} },
        error: null
      });
      
      // Mock Supabase auth update user
      (supabase.auth.admin.updateUserById as jest.Mock).mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      });
      
      // Act
      await authController.changePassword(req, res);
      
      // Assert
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'currentpassword'
      });
      expect(supabase.auth.admin.updateUserById).toHaveBeenCalledWith(
        'test-user-id',
        { password: 'newpassword123' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password changed successfully'
      });
    });
  });
});