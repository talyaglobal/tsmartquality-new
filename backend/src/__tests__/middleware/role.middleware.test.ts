import { Request, Response, NextFunction } from 'express';
import { isAdmin, isCompanyAdmin, hasPermission } from '../../middleware/role.middleware';

describe('Role Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  
  beforeEach(() => {
    req = {
      user: {
        id: 'user-id',
        company_id: 1,
        is_admin: false,
        is_company_admin: false
      },
      params: {},
      supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        limit: jest.fn()
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();
  });
  
  describe('isAdmin middleware', () => {
    it('should call next if user is admin', () => {
      req.user.is_admin = true;
      
      isAdmin(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should return 403 if user is not admin', () => {
      req.user.is_admin = false;
      
      isAdmin(req as Request, res as Response, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient permissions. Administrator access required.'
      });
    });
    
    it('should return 403 if user is not defined', () => {
      req.user = undefined;
      
      isAdmin(req as Request, res as Response, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient permissions. Administrator access required.'
      });
    });
  });
  
  describe('isCompanyAdmin middleware', () => {
    it('should call next if user is system admin', () => {
      req.user.is_admin = true;
      req.user.is_company_admin = false;
      
      isCompanyAdmin(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should call next if user is company admin', () => {
      req.user.is_admin = false;
      req.user.is_company_admin = true;
      
      isCompanyAdmin(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should return 403 if user is neither system admin nor company admin', () => {
      req.user.is_admin = false;
      req.user.is_company_admin = false;
      
      isCompanyAdmin(req as Request, res as Response, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient permissions. Company administrator access required.'
      });
    });
    
    it('should return 403 if user is not defined', () => {
      req.user = undefined;
      
      isCompanyAdmin(req as Request, res as Response, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient permissions. Company administrator access required.'
      });
    });
  });
  
  describe('hasPermission middleware', () => {
    it('should call next if user is admin', async () => {
      req.user.is_admin = true;
      
      await hasPermission('product.view')(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('should return 401 if user is not defined', async () => {
      req.user = undefined;
      
      await hasPermission('product.view')(req as Request, res as Response, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required'
      });
    });
    
    it('should return 403 if user has no roles', async () => {
      // Setup mock for userRoles query
      (req.supabase.eq as jest.Mock).mockResolvedValue({
        data: [],
        error: null
      });
      
      await hasPermission('product.view')(req as Request, res as Response, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient permissions. product.view permission required.'
      });
    });
    
    it('should return 403 if user has roles but not the required permission', async () => {
      // Setup mock for userRoles query - user has roles
      (req.supabase.eq as jest.Mock).mockResolvedValueOnce({
        data: [{ role_id: 1 }, { role_id: 2 }],
        error: null
      });
      
      // Setup mock for permissions query - no matching permission
      (req.supabase.limit as jest.Mock).mockResolvedValue({
        data: [],
        error: null
      });
      
      await hasPermission('product.view')(req as Request, res as Response, next);
      
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });
    
    it('should call next if user has the required permission', async () => {
      // Setup mock for userRoles query
      (req.supabase.eq as jest.Mock).mockResolvedValueOnce({
        data: [{ role_id: 1 }, { role_id: 2 }],
        error: null
      });
      
      // Setup mock for permissions query
      (req.supabase.limit as jest.Mock).mockResolvedValue({
        data: [{ permission: 'product.view' }],
        error: null
      });
      
      await hasPermission('product.view')(req as Request, res as Response, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});