import { Request, Response } from 'express';
import { getAllGroups, getGroupById, createGroup, updateGroup, deleteGroup } from '../../controllers/group.controller';
import { supabase } from '../../config/supabase';

// Mock Supabase client
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis()
  }
}));

describe('Group Controller', () => {
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
  
  describe('getAllGroups', () => {
    it('should return all groups', async () => {
      const mockGroups = [
        { id: 1, name: 'Group 1' },
        { id: 2, name: 'Group 2' }
      ];
      
      (supabase.select as jest.Mock).mockResolvedValueOnce({ data: mockGroups, error: null });
      
      await getAllGroups(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('groups');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.eq).toHaveBeenCalledWith('status', true);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockGroups);
    });
    
    it('should handle errors', async () => {
      const mockError = new Error('Database error');
      
      (supabase.select as jest.Mock).mockResolvedValueOnce({ data: null, error: mockError });
      
      await getAllGroups(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ message: mockError.message });
    });
  });
  
  describe('getGroupById', () => {
    it('should return group by id', async () => {
      const mockGroup = { id: 1, name: 'Test Group' };
      mockRequest.params = { id: '1' };
      
      (supabase.single as jest.Mock).mockResolvedValueOnce({ data: mockGroup, error: null });
      
      await getGroupById(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('groups');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.eq).toHaveBeenCalledWith('id', '1');
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockGroup);
    });
    
    it('should return 404 if group not found', async () => {
      mockRequest.params = { id: '999' };
      
      (supabase.single as jest.Mock).mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST116', message: 'Not found' }
      });
      
      await getGroupById(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Group not found' });
    });
  });
  
  describe('createGroup', () => {
    it('should create a new group', async () => {
      const groupData = { name: 'New Group', description: 'Test description' };
      const createdGroup = { id: 1, ...groupData, status: true, company_id: 1 };
      
      mockRequest.body = groupData;
      
      (supabase.single as jest.Mock).mockResolvedValueOnce({ data: createdGroup, error: null });
      
      await createGroup(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('groups');
      expect(supabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Group',
        description: 'Test description',
        company_id: 1,
        status: true
      }));
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith(createdGroup);
    });
  });
  
  describe('updateGroup', () => {
    it('should update an existing group', async () => {
      const groupData = { id: 1, name: 'Updated Group' };
      const updatedGroup = { ...groupData, description: 'Test', status: true };
      
      mockRequest.body = groupData;
      
      (supabase.single as jest.Mock).mockResolvedValueOnce({ data: updatedGroup, error: null });
      
      await updateGroup(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('groups');
      expect(supabase.update).toHaveBeenCalledWith(groupData);
      expect(supabase.eq).toHaveBeenCalledWith('id', 1);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(updatedGroup);
    });
  });
  
  describe('deleteGroup', () => {
    it('should delete a group if it has no associations', async () => {
      mockRequest.params = { id: '1' };
      
      // Mock empty results for associations check
      (supabase.limit as jest.Mock)
        .mockResolvedValueOnce({ data: [], error: null }) // user_in_groups check
        .mockResolvedValueOnce({ data: [], error: null }); // group_in_roles check
      
      // Mock the update result
      (supabase.eq as jest.Mock).mockResolvedValueOnce({ error: null });
      
      await deleteGroup(mockRequest as Request, mockResponse as Response);
      
      // Verify first two checks for associations
      expect(supabase.from).toHaveBeenNthCalledWith(1, 'user_in_groups');
      expect(supabase.from).toHaveBeenNthCalledWith(2, 'group_in_roles');
      
      // Verify the delete operation
      expect(supabase.from).toHaveBeenNthCalledWith(3, 'groups');
      expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({ 
        status: false
      }));
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Group deleted successfully' });
    });
    
    it('should not delete a group if it has user associations', async () => {
      mockRequest.params = { id: '1' };
      
      // Mock finding user associations
      (supabase.limit as jest.Mock).mockResolvedValueOnce({ 
        data: [{ id: 1 }], 
        error: null
      });
      
      await deleteGroup(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'Cannot delete group: it is associated with users. Remove these associations first.'
      });
    });
  });
});