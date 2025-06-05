import { Request, Response } from 'express';
import {
  getAllGroupInRoles,
  getGroupInRoleById,
  createGroupInRole,
  updateGroupInRole,
  deleteGroupInRole
} from '../../controllers/groupInRole.controller';
import { supabase } from '../../config/supabase';

// Mock Supabase client
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis()
  }
}));

describe('GroupInRole Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;
  
  beforeEach(() => {
    // Reset mocks
    responseJson = jest.fn().mockReturnThis();
    responseStatus = jest.fn().mockReturnThis();
    
    mockRequest = {
      params: {},
      body: {},
      user: {
        id: 'user-123',
        companyId: 1,
        role: 'admin'
      }
    };
    
    mockResponse = {
      json: responseJson,
      status: responseStatus
    };
    
    // Reset all mock implementations
    jest.clearAllMocks();
  });
  
  describe('getAllGroupInRoles', () => {
    it('should return all group-role associations', async () => {
      const mockAssociations = [
        { id: 1, group_id: 101, role_id: 201 },
        { id: 2, group_id: 102, role_id: 202 }
      ];
      
      (supabase.select as jest.Mock).mockResolvedValueOnce({ data: mockAssociations, error: null });
      
      await getAllGroupInRoles(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('group_in_roles');
      expect(supabase.select).toHaveBeenCalledWith(expect.stringContaining('*'));
      expect(supabase.eq).toHaveBeenCalledWith('status', true);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockAssociations);
    });
  });
  
  describe('getGroupInRoleById', () => {
    it('should return group-role association by id', async () => {
      const mockAssociation = { id: 1, group_id: 101, role_id: 201 };
      mockRequest.params = { id: '1' };
      
      (supabase.single as jest.Mock).mockResolvedValueOnce({ data: mockAssociation, error: null });
      
      await getGroupInRoleById(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('group_in_roles');
      expect(supabase.eq).toHaveBeenCalledWith('id', '1');
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockAssociation);
    });
    
    it('should return 404 if association not found', async () => {
      mockRequest.params = { id: '999' };
      
      (supabase.single as jest.Mock).mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST116', message: 'Not found' }
      });
      
      await getGroupInRoleById(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'Group-role association not found' 
      });
    });
  });
  
  describe('createGroupInRole', () => {
    it('should create a new group-role association', async () => {
      const associationData = {
        group_id: 101,
        role_id: 201
      };
      
      const createdAssociation = { 
        id: 1, 
        ...associationData, 
        status: true, 
        company_id: 1 
      };
      
      mockRequest.body = associationData;
      
      // Mock the check for existing association
      (supabase.limit as jest.Mock).mockResolvedValueOnce({ data: [], error: null });
      
      // Mock the insert
      (supabase.single as jest.Mock).mockResolvedValueOnce({ data: createdAssociation, error: null });
      
      await createGroupInRole(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('group_in_roles');
      expect(supabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        group_id: 101,
        role_id: 201,
        company_id: 1,
        status: true
      }));
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith(createdAssociation);
    });
    
    it('should return 409 if association already exists', async () => {
      mockRequest.body = {
        group_id: 101,
        role_id: 201
      };
      
      // Mock finding an existing association
      (supabase.limit as jest.Mock).mockResolvedValueOnce({ 
        data: [{ id: 1 }], 
        error: null 
      });
      
      await createGroupInRole(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(409);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'This group-role association already exists' 
      });
    });
  });
  
  describe('updateGroupInRole', () => {
    it('should update an existing group-role association', async () => {
      const associationData = {
        id: 1,
        group_id: 101,
        role_id: 202 // Updated role
      };
      
      const updatedAssociation = { 
        ...associationData, 
        status: true, 
        company_id: 1 
      };
      
      mockRequest.body = associationData;
      
      // Mock the check for duplicate
      (supabase.limit as jest.Mock).mockResolvedValueOnce({ data: [], error: null });
      
      // Mock the update
      (supabase.single as jest.Mock).mockResolvedValueOnce({ data: updatedAssociation, error: null });
      
      await updateGroupInRole(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('group_in_roles');
      expect(supabase.update).toHaveBeenCalledWith({ group_id: 101, role_id: 202 });
      expect(supabase.eq).toHaveBeenCalledWith('id', 1);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(updatedAssociation);
    });
    
    it('should return 409 if updated association would create a duplicate', async () => {
      mockRequest.body = {
        id: 1,
        group_id: 101,
        role_id: 202
      };
      
      // Mock finding a duplicate
      (supabase.limit as jest.Mock).mockResolvedValueOnce({ 
        data: [{ id: 2 }], 
        error: null 
      });
      
      await updateGroupInRole(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(409);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'This group-role association already exists' 
      });
    });
  });
  
  describe('deleteGroupInRole', () => {
    it('should delete a group-role association', async () => {
      mockRequest.params = { id: '1' };
      
      // Mock the update (soft delete)
      (supabase.eq as jest.Mock).mockResolvedValueOnce({ error: null });
      
      await deleteGroupInRole(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('group_in_roles');
      expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({ 
        status: false
      }));
      expect(supabase.eq).toHaveBeenCalledWith('id', '1');
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'Group-role association deleted successfully' 
      });
    });
  });
});