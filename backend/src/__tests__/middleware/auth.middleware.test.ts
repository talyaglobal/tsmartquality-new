import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, isAdmin, hasCompanyAccess } from '../../middleware/auth.middleware';
import { supabase } from '../../config/supabase';

// Mock the jwt module
jest.mock('jsonwebtoken');

// Mock Request and Response
const mockRequest = () => {
  const req = {} as Request;
  req.headers = {};
  req.params = {};
  req.query = {};
  return req;
};

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('Auth Middleware', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;
  
  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = jest.fn();
    
    // Reset environment variables
    process.env.JWT_SECRET = 'test-jwt-secret';
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  describe('authenticate middleware', () => {
    it('should return 401 if no authorization header is present', async () => {
      // No headers set
      
      await authenticate(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 401 if authorization header does not start with Bearer', async () => {
      req.headers.authorization = 'NotBearer token123';
      
      await authenticate(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 401 if token is empty', async () => {
      req.headers.authorization = 'Bearer ';
      
      await authenticate(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'No token, authorization denied' });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 401 if token verification fails', async () => {
      req.headers.authorization = 'Bearer invalid_token';
      
      // Mock jwt.verify to throw an error
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      await authenticate(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalledWith('invalid_token', 'test-jwt-secret');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 401 if user is not found in database', async () => {
      req.headers.authorization = 'Bearer valid_token';
      
      // Mock successful token verification
      (jwt.verify as jest.Mock).mockReturnValue({
        sub: 'user-id-123',
        email: 'test@example.com'
      });
      
      // Mock user not found in database
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'User not found' }
      });
      
      await authenticate(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalledWith('valid_token', 'test-jwt-secret');
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase.eq).toHaveBeenCalledWith('id', 'user-id-123');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should attach user to request and call next if token is valid', async () => {
      req.headers.authorization = 'Bearer valid_token';
      
      // Mock successful token verification
      (jwt.verify as jest.Mock).mockReturnValue({
        sub: 'user-id-123',
        email: 'test@example.com',
        role: 'user'
      });
      
      // Mock user found in database
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: {
          id: 'user-id-123',
          email: 'test@example.com',
          company_id: 42
        },
        error: null
      });
      
      await authenticate(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalledWith('valid_token', 'test-jwt-secret');
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase.eq).toHaveBeenCalledWith('id', 'user-id-123');
      expect(req.user).toEqual({
        id: 'user-id-123',
        email: 'test@example.com',
        companyId: 42,
        role: 'user'
      });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
  
  describe('isAdmin middleware', () => {
    it('should call next if user is an admin', () => {
      req.user = {
        id: 'admin-id',
        email: 'admin@example.com',
        role: 'admin'
      };
      
      isAdmin(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should return 403 if user is not an admin', () => {
      req.user = {
        id: 'user-id',
        email: 'user@example.com',
        role: 'user'
      };
      
      isAdmin(req, res, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access denied: Admin role required' });
    });
    
    it('should return 403 if user is not defined', () => {
      req.user = undefined;
      
      isAdmin(req, res, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access denied: Admin role required' });
    });
  });
  
  describe('hasCompanyAccess middleware', () => {
    it('should call next if user is an admin', () => {
      req.user = {
        id: 'admin-id',
        email: 'admin@example.com',
        role: 'admin',
        companyId: 1
      };
      req.params.companyId = '42'; // Different company
      
      hasCompanyAccess(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should call next if user belongs to the requested company', () => {
      req.user = {
        id: 'user-id',
        email: 'user@example.com',
        role: 'user',
        companyId: 42
      };
      req.params.companyId = '42'; // Same company
      
      hasCompanyAccess(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should accept company ID from query params', () => {
      req.user = {
        id: 'user-id',
        email: 'user@example.com',
        role: 'user',
        companyId: 42
      };
      req.query.companyId = '42'; // Same company
      
      hasCompanyAccess(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should return 401 if user is not defined', () => {
      req.user = undefined;
      req.params.companyId = '42';
      
      hasCompanyAccess(req, res, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    });
    
    it('should return 403 if user is not an admin and belongs to a different company', () => {
      req.user = {
        id: 'user-id',
        email: 'user@example.com',
        role: 'user',
        companyId: 1
      };
      req.params.companyId = '42'; // Different company
      
      hasCompanyAccess(req, res, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Access denied: Not authorized for this company' 
      });
    });
  });
});