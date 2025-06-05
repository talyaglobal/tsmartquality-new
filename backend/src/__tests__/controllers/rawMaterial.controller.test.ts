import { Request, Response } from 'express';
import {
  getAllRawMaterials,
  getRawMaterialById,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  getFilteredRawMaterials
} from '../../controllers/rawMaterial.controller';
import { supabase } from '../../config/supabase';

// Mock Supabase client
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis()
  }
}));

describe('Raw Material Controller', () => {
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
      query: {},
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
  
  describe('getAllRawMaterials', () => {
    it('should return all raw materials', async () => {
      const mockMaterials = [
        { id: 1, name: 'Material 1', code: 'MAT001' },
        { id: 2, name: 'Material 2', code: 'MAT002' }
      ];
      
      (supabase.select as jest.Mock).mockResolvedValueOnce({ data: mockMaterials, error: null });
      
      await getAllRawMaterials(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('raw_materials');
      expect(supabase.select).toHaveBeenCalledWith(expect.stringContaining('*'));
      expect(supabase.eq).toHaveBeenCalledWith('status', true);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockMaterials);
    });
    
    it('should handle errors', async () => {
      const mockError = new Error('Database error');
      
      (supabase.select as jest.Mock).mockResolvedValueOnce({ data: null, error: mockError });
      
      await getAllRawMaterials(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ message: mockError.message });
    });
  });
  
  describe('getRawMaterialById', () => {
    it('should return raw material by id', async () => {
      const mockMaterial = { id: 1, name: 'Test Material', code: 'MAT001' };
      mockRequest.params = { id: '1' };
      
      (supabase.single as jest.Mock).mockResolvedValueOnce({ data: mockMaterial, error: null });
      
      await getRawMaterialById(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('raw_materials');
      expect(supabase.select).toHaveBeenCalledWith(expect.stringContaining('*'));
      expect(supabase.eq).toHaveBeenCalledWith('id', '1');
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockMaterial);
    });
    
    it('should return 404 if raw material not found', async () => {
      mockRequest.params = { id: '999' };
      
      (supabase.single as jest.Mock).mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST116', message: 'Not found' }
      });
      
      await getRawMaterialById(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Raw material not found' });
    });
  });
  
  describe('createRawMaterial', () => {
    it('should create a new raw material', async () => {
      const materialData = {
        name: 'New Material',
        code: 'MAT003',
        description: 'Test description',
        raw_material_group_id: 1,
        stock_tracking: true
      };
      
      const createdMaterial = { 
        id: 3, 
        ...materialData, 
        status: true, 
        company_id: 1,
        created_by: 'user-123'
      };
      
      mockRequest.body = materialData;
      
      // Mock the check for existing material with the same code
      (supabase.limit as jest.Mock).mockResolvedValueOnce({ data: [], error: null });
      
      // Mock the insert
      (supabase.single as jest.Mock).mockResolvedValueOnce({ data: createdMaterial, error: null });
      
      await createRawMaterial(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('raw_materials');
      expect(supabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Material',
        code: 'MAT003',
        description: 'Test description',
        raw_material_group_id: 1,
        stock_tracking: true,
        company_id: 1,
        created_by: 'user-123'
      }));
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith(createdMaterial);
    });
    
    it('should return 409 if raw material with same code already exists', async () => {
      mockRequest.body = {
        name: 'New Material',
        code: 'MAT001'  // existing code
      };
      
      // Mock finding an existing material with the same code
      (supabase.limit as jest.Mock).mockResolvedValueOnce({ 
        data: [{ id: 1 }], 
        error: null 
      });
      
      await createRawMaterial(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(409);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: `Raw material with code 'MAT001' already exists` 
      });
    });
  });
  
  describe('updateRawMaterial', () => {
    it('should update an existing raw material', async () => {
      const materialData = {
        id: 1,
        name: 'Updated Material',
        code: 'MAT001-UPD'
      };
      
      const updatedMaterial = { 
        ...materialData, 
        description: 'Some description',
        status: true
      };
      
      mockRequest.body = materialData;
      
      // Mock getting current code
      (supabase.single as jest.Mock).mockResolvedValueOnce({ 
        data: { code: 'MAT001' }, 
        error: null 
      });
      
      // Mock check for duplicate code
      (supabase.limit as jest.Mock).mockResolvedValueOnce({ data: [], error: null });
      
      // Mock the update
      (supabase.single as jest.Mock).mockResolvedValueOnce({ 
        data: updatedMaterial, 
        error: null 
      });
      
      await updateRawMaterial(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('raw_materials');
      expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        name: 'Updated Material',
        code: 'MAT001-UPD',
        updated_by: 'user-123'
      }));
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(updatedMaterial);
    });
    
    it('should return 400 if id is missing', async () => {
      mockRequest.body = {
        name: 'Updated Material',
        code: 'MAT001-UPD'
      };
      
      await updateRawMaterial(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'Raw material ID is required' 
      });
    });
  });
  
  describe('deleteRawMaterial', () => {
    it('should delete a raw material if not used in recipes', async () => {
      mockRequest.params = { id: '1' };
      
      // Mock the recipes check (empty result = not used)
      (supabase.limit as jest.Mock).mockResolvedValueOnce({ data: [], error: null });
      
      // Mock the update (soft delete)
      (supabase.eq as jest.Mock).mockResolvedValueOnce({ error: null });
      
      await deleteRawMaterial(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenNthCalledWith(1, 'recipe_details');
      expect(supabase.from).toHaveBeenNthCalledWith(2, 'raw_materials');
      expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({ 
        status: false
      }));
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'Raw material deleted successfully' 
      });
    });
    
    it('should not delete a raw material if used in recipes', async () => {
      mockRequest.params = { id: '1' };
      
      // Mock finding recipes using this material
      (supabase.limit as jest.Mock).mockResolvedValueOnce({ 
        data: [{ id: 101 }], 
        error: null 
      });
      
      await deleteRawMaterial(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'Cannot delete raw material: it is used in one or more recipes' 
      });
    });
  });
  
  describe('getFilteredRawMaterials', () => {
    it('should return filtered raw materials with pagination', async () => {
      const mockMaterials = [
        { id: 1, name: 'Material 1' },
        { id: 2, name: 'Material 2' }
      ];
      
      mockRequest.query = { 
        limit: '10', 
        offset: '0', 
        searchTerm: 'test', 
        stockTracking: 'true' 
      };
      
      // Mock the query
      (supabase.range as jest.Mock).mockResolvedValueOnce({ 
        data: mockMaterials, 
        count: 25, 
        error: null 
      });
      
      await getFilteredRawMaterials(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('raw_materials');
      expect(supabase.select).toHaveBeenCalledWith(expect.stringContaining('*'), { count: 'exact' });
      expect(supabase.or).toHaveBeenCalledWith(expect.stringContaining('name.ilike.%test%'));
      expect(supabase.eq).toHaveBeenCalledWith('stock_tracking', true);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        items: mockMaterials,
        totalCount: 25,
        offset: 0,
        limit: 10
      });
    });
  });
});