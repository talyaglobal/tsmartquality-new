import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';
import * as userController from '../../controllers/user.controller';

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
    is_admin: false,
    is_company_admin: false
  };
  return req;
};

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('User Controller', () => {
  describe('getAllUsers', () => {
    it('should return 403 if user is not an admin or company admin', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      // Act
      await userController.getAllUsers(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient permissions to view all users'
      });
    });
    
    it('should return all company users for a company admin', async () => {
      // Arrange
      const req = mockRequest();
      req.user.is_company_admin = true;
      req.query = { limit: '10', offset: '0' };
      const res = mockResponse();
      
      // Mock users data
      const mockUsers = [
        { id: 'user1', email: 'user1@example.com', full_name: 'User 1', company_id: 1 },
        { id: 'user2', email: 'user2@example.com', full_name: 'User 2', company_id: 1 }
      ];
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockReturnThis();
      (supabase.range as jest.Mock).mockResolvedValue({
        data: mockUsers,
        error: null,
        count: 2
      });
      
      // Act
      await userController.getAllUsers(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase.select).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(supabase.eq).toHaveBeenCalledWith('company_id', 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
        count: 2,
        limit: 10,
        offset: 0
      });
    });
    
    it('should return all users for a system admin', async () => {
      // Arrange
      const req = mockRequest();
      req.user.is_admin = true;
      req.query = { limit: '10', offset: '0' };
      const res = mockResponse();
      
      // Mock users data
      const mockUsers = [
        { id: 'user1', email: 'user1@example.com', full_name: 'User 1', company_id: 1 },
        { id: 'user2', email: 'user2@example.com', full_name: 'User 2', company_id: 2 }
      ];
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockReturnThis();
      (supabase.range as jest.Mock).mockResolvedValue({
        data: mockUsers,
        error: null,
        count: 2
      });
      
      // Act
      await userController.getAllUsers(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase.select).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(supabase.eq).not.toHaveBeenCalled(); // No company filter for admin
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUsers,
        count: 2,
        limit: 10,
        offset: 0
      });
    });
  });
  
  describe('getUserById', () => {
    it('should return 403 if user tries to view another user without admin rights', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { id: 'another-user-id' };
      const res = mockResponse();
      
      // Act
      await userController.getUserById(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient permissions to view this user'
      });
    });
    
    it('should return user data if user is viewing their own profile', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { id: 'test-user-id' }; // Same as req.user.id
      const res = mockResponse();
      
      // Mock user data
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        company_id: 1,
        is_admin: false,
        is_company_admin: false
      };
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockUser,
        error: null
      });
      
      // Act
      await userController.getUserById(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.eq).toHaveBeenCalledWith('id', 'test-user-id');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
    });
    
    it('should return user data if user is a company admin viewing a user in their company', async () => {
      // Arrange
      const req = mockRequest();
      req.user.is_company_admin = true;
      req.params = { id: 'company-user-id' };
      const res = mockResponse();
      
      // Mock user data
      const mockUser = {
        id: 'company-user-id',
        email: 'company-user@example.com',
        full_name: 'Company User',
        company_id: 1, // Same company as admin
        is_admin: false,
        is_company_admin: false
      };
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockUser,
        error: null
      });
      
      // Act
      await userController.getUserById(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.eq).toHaveBeenCalledWith('id', 'company-user-id');
      expect(supabase.eq).toHaveBeenCalledWith('company_id', 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
    });
  });
  
  describe('updateUser', () => {
    it('should return 400 if user ID is missing', async () => {
      // Arrange
      const req = mockRequest();
      req.body = { full_name: 'Updated Name' }; // Missing id
      const res = mockResponse();
      
      // Act
      await userController.updateUser(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User ID is required'
      });
    });
    
    it('should return 403 if user tries to update another user without admin rights', async () => {
      // Arrange
      const req = mockRequest();
      req.body = { id: 'another-user-id', full_name: 'Updated Name' };
      const res = mockResponse();
      
      // Act
      await userController.updateUser(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient permissions to update this user'
      });
    });
    
    it('should update user if user is updating their own profile', async () => {
      // Arrange
      const req = mockRequest();
      req.body = { 
        id: 'test-user-id', // Same as req.user.id
        full_name: 'Updated Name',
        phone: '123-456-7890',
        job_title: 'Developer'
      };
      const res = mockResponse();
      
      // Mock existing user data
      const existingUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Old Name',
        phone: null,
        job_title: null,
        company_id: 1
      };
      
      // Mock updated user data
      const updatedUser = {
        ...existingUser,
        full_name: 'Updated Name',
        phone: '123-456-7890',
        job_title: 'Developer'
      };
      
      // Mock Supabase responses
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock)
        .mockResolvedValueOnce({ data: existingUser, error: null }) // First call to get existing user
        .mockResolvedValueOnce({ data: updatedUser, error: null }); // Second call after update
      
      (supabase.update as jest.Mock).mockReturnThis();
      
      // Act
      await userController.updateUser(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({
        full_name: 'Updated Name',
        phone: '123-456-7890',
        job_title: 'Developer'
      }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedUser
      });
    });
  });
  
  describe('getCurrentUser', () => {
    it('should return the current user profile', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      // Mock user data
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        company_id: 1,
        is_admin: false,
        is_company_admin: false
      };
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockUser,
        error: null
      });
      
      // Act
      await userController.getCurrentUser(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.eq).toHaveBeenCalledWith('id', 'test-user-id');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
    });
    
    it('should return 404 if user is not found', async () => {
      // Arrange
      const req = mockRequest();
      const res = mockResponse();
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'User not found' }
      });
      
      // Act
      await userController.getCurrentUser(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not found'
      });
    });
  });
});