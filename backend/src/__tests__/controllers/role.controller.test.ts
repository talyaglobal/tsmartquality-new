import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';
import * as roleController from '../../controllers/role.controller';

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

describe('Role Controller', () => {
  describe('getAllRoles', () => {
    it('should return company roles for non-admin users', async () => {
      // Arrange
      const req = mockRequest();
      req.query = { limit: '10', offset: '0' };
      const res = mockResponse();
      
      // Mock roles data
      const mockRoles = [
        { id: 1, name: 'Manager', company_id: 1 },
        { id: 2, name: 'Operator', company_id: 1 }
      ];
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockReturnThis();
      (supabase.range as jest.Mock).mockResolvedValue({
        data: mockRoles,
        error: null,
        count: 2
      });
      
      // Act
      await roleController.getAllRoles(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('roles');
      expect(supabase.select).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(supabase.eq).toHaveBeenCalledWith('company_id', 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRoles,
        count: 2,
        limit: 10,
        offset: 0
      });
    });
    
    it('should return all roles for admin users', async () => {
      // Arrange
      const req = mockRequest();
      req.user.is_admin = true;
      req.query = { limit: '10', offset: '0' };
      const res = mockResponse();
      
      // Mock roles data
      const mockRoles = [
        { id: 1, name: 'Manager', company_id: 1 },
        { id: 2, name: 'Admin', company_id: 2 }
      ];
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockReturnThis();
      (supabase.range as jest.Mock).mockResolvedValue({
        data: mockRoles,
        error: null,
        count: 2
      });
      
      // Act
      await roleController.getAllRoles(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('roles');
      expect(supabase.select).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(supabase.eq).not.toHaveBeenCalledWith('company_id', expect.anything());
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRoles,
        count: 2,
        limit: 10,
        offset: 0
      });
    });
  });
  
  describe('getRoleById', () => {
    it('should return a role by ID for company admin', async () => {
      // Arrange
      const req = mockRequest();
      req.user.is_company_admin = true;
      req.params = { id: '1' };
      const res = mockResponse();
      
      // Mock role data
      const mockRole = {
        id: 1,
        name: 'Manager',
        description: 'Company manager role',
        company_id: 1
      };
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockRole,
        error: null
      });
      
      // Act
      await roleController.getRoleById(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('roles');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.eq).toHaveBeenCalledWith('id', '1');
      expect(supabase.eq).toHaveBeenCalledWith('company_id', 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRole
      });
    });
    
    it('should return a role by ID for system admin without company restriction', async () => {
      // Arrange
      const req = mockRequest();
      req.user.is_admin = true;
      req.params = { id: '1' };
      const res = mockResponse();
      
      // Mock role data
      const mockRole = {
        id: 1,
        name: 'Manager',
        description: 'Company manager role',
        company_id: 2 // Different company
      };
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockRole,
        error: null
      });
      
      // Act
      await roleController.getRoleById(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('roles');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.eq).toHaveBeenCalledWith('id', '1');
      expect(supabase.eq).not.toHaveBeenCalledWith('company_id', expect.anything());
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRole
      });
    });
  });
  
  describe('createRole', () => {
    it('should return 403 if user is not an admin or company admin', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        name: 'New Role',
        description: 'New role description'
      };
      const res = mockResponse();
      
      // Act
      await roleController.createRole(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient permissions to create roles'
      });
    });
    
    it('should return 400 if role name already exists in the company', async () => {
      // Arrange
      const req = mockRequest();
      req.user.is_company_admin = true;
      req.body = {
        name: 'Existing Role',
        description: 'Role description'
      };
      const res = mockResponse();
      
      // Mock existing role check
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.limit as jest.Mock).mockResolvedValue({
        data: [{ id: 1 }], // Role already exists
        error: null
      });
      
      // Act
      await roleController.createRole(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('roles');
      expect(supabase.select).toHaveBeenCalledWith('id');
      expect(supabase.eq).toHaveBeenCalledWith('name', 'Existing Role');
      expect(supabase.eq).toHaveBeenCalledWith('company_id', 1);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Role with this name already exists in your company'
      });
    });
    
    it('should create a new role successfully', async () => {
      // Arrange
      const req = mockRequest();
      req.user.is_company_admin = true;
      req.body = {
        name: 'New Role',
        description: 'New role description'
      };
      const res = mockResponse();
      
      // Mock existing role check (no existing role)
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.limit as jest.Mock).mockResolvedValueOnce({
        data: [],
        error: null
      });
      
      // Mock role creation
      (supabase.insert as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValueOnce({
        data: {
          id: 3,
          name: 'New Role',
          description: 'New role description',
          company_id: 1,
          created_by: 'test-user-id',
          created_at: new Date().toISOString()
        },
        error: null
      });
      
      // Act
      await roleController.createRole(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('roles');
      expect(supabase.insert).toHaveBeenCalledWith({
        name: 'New Role',
        description: 'New role description',
        company_id: 1,
        created_by: 'test-user-id'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          name: 'New Role',
          description: 'New role description'
        })
      });
    });
  });
  
  describe('updateRole', () => {
    it('should return 403 if user is not an admin or company admin', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        id: 1,
        name: 'Updated Role'
      };
      const res = mockResponse();
      
      // Act
      await roleController.updateRole(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient permissions to update roles'
      });
    });
    
    it('should return 404 if role is not found', async () => {
      // Arrange
      const req = mockRequest();
      req.user.is_company_admin = true;
      req.body = {
        id: 999,
        name: 'Updated Role'
      };
      const res = mockResponse();
      
      // Mock role not found
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Role not found' }
      });
      
      // Act
      await roleController.updateRole(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('roles');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.eq).toHaveBeenCalledWith('id', 999);
      expect(supabase.eq).toHaveBeenCalledWith('company_id', 1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Role not found or you do not have permission to update it'
      });
    });
    
    it('should update a role successfully', async () => {
      // Arrange
      const req = mockRequest();
      req.user.is_company_admin = true;
      req.body = {
        id: 1,
        name: 'Updated Role',
        description: 'Updated description'
      };
      const res = mockResponse();
      
      // Mock existing role
      const existingRole = {
        id: 1,
        name: 'Original Role',
        description: 'Original description',
        company_id: 1,
        created_by: 'test-user-id',
        created_at: new Date().toISOString()
      };
      
      // Mock name check (no conflict)
      const nameCheckResult = {
        data: [],
        error: null
      };
      
      // Mock update result
      const updatedRole = {
        ...existingRole,
        name: 'Updated Role',
        description: 'Updated description',
        updated_at: new Date().toISOString(),
        updated_by: 'test-user-id'
      };
      
      // Setup mocks
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.neq as jest.Mock).mockReturnThis();
      (supabase.limit as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock)
        .mockResolvedValueOnce({ data: existingRole, error: null }) // First call to check role
        .mockResolvedValueOnce({ data: updatedRole, error: null }); // After update
      
      (supabase.limit as jest.Mock).mockResolvedValueOnce(nameCheckResult);
      (supabase.update as jest.Mock).mockReturnThis();
      
      // Act
      await roleController.updateRole(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('roles');
      expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Updated Role',
        description: 'Updated description',
        updated_by: 'test-user-id'
      }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedRole
      });
    });
  });
  
  describe('getRolePermissions', () => {
    it('should return permissions for a role', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { id: '1' };
      const res = mockResponse();
      
      // Mock role check
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValueOnce({
        data: { id: 1, company_id: 1 },
        error: null
      });
      
      // Mock permissions data
      const mockPermissionsData = [
        { permission: 'product.view' },
        { permission: 'product.create' },
        { permission: 'customer.view' }
      ];
      
      // Reset mock for the second call
      jest.clearAllMocks();
      
      // Mock permissions response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockResolvedValue({
        data: mockPermissionsData,
        error: null
      });
      
      // Act
      await roleController.getRolePermissions(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: ['product.view', 'product.create', 'customer.view']
      });
    });
    
    it('should return 404 if role is not found', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { id: '999' };
      const res = mockResponse();
      
      // Mock role check with error
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Role not found' }
      });
      
      // Act
      await roleController.getRolePermissions(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Role not found or you do not have permission to view it'
      });
    });
  });
  
  describe('addPermission', () => {
    it('should return 403 if user is not an admin or company admin', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        roleId: 1,
        permission: 'product.view'
      };
      const res = mockResponse();
      
      // Act
      await roleController.addPermission(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient permissions to manage role permissions'
      });
    });
    
    it('should add a permission to a role successfully', async () => {
      // Arrange
      const req = mockRequest();
      req.user.is_company_admin = true;
      req.body = {
        roleId: 1,
        permission: 'product.view'
      };
      const res = mockResponse();
      
      // Mock role check
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.limit as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValueOnce({
        data: { id: 1, company_id: 1 },
        error: null
      });
      
      // Mock permission check (permission doesn't exist)
      (supabase.limit as jest.Mock).mockResolvedValueOnce({
        data: [],
        error: null
      });
      
      // Mock permission insertion
      (supabase.insert as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValueOnce({
        data: {
          id: 101,
          role_id: 1,
          permission: 'product.view',
          company_id: 1,
          created_by: 'test-user-id'
        },
        error: null
      });
      
      // Act
      await roleController.addPermission(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('role_permissions');
      expect(supabase.insert).toHaveBeenCalledWith({
        role_id: 1,
        permission: 'product.view',
        company_id: 1,
        created_by: 'test-user-id'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          role_id: 1,
          permission: 'product.view'
        })
      });
    });
    
    it('should return 400 if role already has the permission', async () => {
      // Arrange
      const req = mockRequest();
      req.user.is_company_admin = true;
      req.body = {
        roleId: 1,
        permission: 'product.view'
      };
      const res = mockResponse();
      
      // Mock role check
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.limit as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValueOnce({
        data: { id: 1, company_id: 1 },
        error: null
      });
      
      // Mock permission check (permission already exists)
      (supabase.limit as jest.Mock).mockResolvedValueOnce({
        data: [{ id: 101 }],
        error: null
      });
      
      // Act
      await roleController.addPermission(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Role already has this permission'
      });
    });
  });
});