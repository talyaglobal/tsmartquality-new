import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';
import * as specController from '../../controllers/spec.controller';

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

describe('Spec Controller', () => {
  describe('getAllSpecs', () => {
    it('should return specifications for the user\'s company', async () => {
      // Arrange
      const req = mockRequest();
      req.query = { limit: '10', offset: '0' };
      const res = mockResponse();
      
      // Mock specs data
      const mockSpecs = [
        { id: 1, name: 'Spec 1', code: 'S001', company_id: 1 },
        { id: 2, name: 'Spec 2', code: 'S002', company_id: 1 }
      ];
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockReturnThis();
      (supabase.range as jest.Mock).mockResolvedValue({
        data: mockSpecs,
        error: null,
        count: 2
      });
      
      // Act
      await specController.getAllSpecs(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('specs');
      expect(supabase.select).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(supabase.eq).toHaveBeenCalledWith('company_id', 1);
      expect(supabase.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(supabase.range).toHaveBeenCalledWith(0, 9);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSpecs,
        count: 2,
        limit: 10,
        offset: 0
      });
    });
    
    it('should handle database errors', async () => {
      // Arrange
      const req = mockRequest();
      req.query = { limit: '10', offset: '0' };
      const res = mockResponse();
      
      // Mock Supabase error response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockReturnThis();
      (supabase.range as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
        count: null
      });
      
      // Act
      await specController.getAllSpecs(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error'
      });
    });
  });
  
  describe('getSpecById', () => {
    it('should return a specification by ID', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { id: '1' };
      const res = mockResponse();
      
      // Mock spec data
      const mockSpec = {
        id: 1,
        name: 'Spec 1',
        code: 'S001',
        description: 'Test specification',
        company_id: 1
      };
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockSpec,
        error: null
      });
      
      // Act
      await specController.getSpecById(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('specs');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.eq).toHaveBeenCalledWith('id', '1');
      expect(supabase.eq).toHaveBeenCalledWith('company_id', 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSpec
      });
    });
    
    it('should return 404 if specification is not found', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { id: '999' };
      const res = mockResponse();
      
      // Mock Supabase error response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Specification not found' }
      });
      
      // Act
      await specController.getSpecById(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Specification not found'
      });
    });
  });
  
  describe('createSpec', () => {
    it('should create a new specification', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        code: 'S003',
        name: 'New Spec',
        description: 'Test new specification',
        product_id: 1
      };
      const res = mockResponse();
      
      // Mock created spec
      const mockCreatedSpec = {
        id: 3,
        code: 'S003',
        name: 'New Spec',
        description: 'Test new specification',
        product_id: 1,
        company_id: 1,
        created_by: 'test-user-id',
        created_at: new Date().toISOString()
      };
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.insert as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockCreatedSpec,
        error: null
      });
      
      // Act
      await specController.createSpec(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('specs');
      expect(supabase.insert).toHaveBeenCalledWith({
        code: 'S003',
        name: 'New Spec',
        description: 'Test new specification',
        product_id: 1,
        company_id: 1,
        created_by: 'test-user-id'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedSpec
      });
    });
    
    it('should handle database errors when creating a specification', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        code: 'S003',
        name: 'New Spec',
        description: 'Test new specification',
        product_id: 1
      };
      const res = mockResponse();
      
      // Mock Supabase error response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.insert as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Duplicate code' }
      });
      
      // Act
      await specController.createSpec(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Duplicate code'
      });
    });
  });
  
  describe('updateSpec', () => {
    it('should update an existing specification', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        id: 1,
        name: 'Updated Spec',
        description: 'Updated description',
        status: 'active'
      };
      const res = mockResponse();
      
      // Mock existing spec
      const existingSpec = {
        id: 1,
        code: 'S001',
        name: 'Spec 1',
        description: 'Test specification',
        product_id: 1,
        status: 'draft',
        company_id: 1,
        created_by: 'test-user-id',
        created_at: new Date().toISOString()
      };
      
      // Mock updated spec
      const updatedSpec = {
        ...existingSpec,
        name: 'Updated Spec',
        description: 'Updated description',
        status: 'active',
        updated_at: new Date().toISOString(),
        updated_by: 'test-user-id'
      };
      
      // Mock Supabase responses
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock)
        .mockResolvedValueOnce({ data: existingSpec, error: null }) // First call to get existing spec
        .mockResolvedValueOnce({ data: updatedSpec, error: null }); // Second call after update
      
      (supabase.update as jest.Mock).mockReturnThis();
      
      // Act
      await specController.updateSpec(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('specs');
      expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({
        code: 'S001', // Unchanged
        name: 'Updated Spec',
        description: 'Updated description',
        status: 'active',
        updated_by: 'test-user-id'
      }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedSpec
      });
    });
    
    it('should return 400 if specification ID is missing', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        name: 'Updated Spec',
        description: 'Updated description'
      };
      const res = mockResponse();
      
      // Act
      await specController.updateSpec(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Specification ID is required'
      });
    });
    
    it('should return 404 if specification is not found', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        id: 999,
        name: 'Updated Spec'
      };
      const res = mockResponse();
      
      // Mock Supabase error response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Specification not found' }
      });
      
      // Act
      await specController.updateSpec(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Specification not found'
      });
    });
  });
  
  describe('deleteSpec', () => {
    it('should delete a specification with no details', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { id: '1' };
      const res = mockResponse();
      
      // Reset all mocks first
      jest.clearAllMocks();
      
      // Mock Supabase for the entire test
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'spec_details') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: [], // No spec details
              error: null
            })
          };
        } else if (table === 'specs') {
          return {
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
              error: null
            })
          };
        }
        return {};
      });
      
      // Mock response methods
      (res.status as jest.Mock).mockReturnValue(res);
      (res.json as jest.Mock).mockReturnValue(res);
      
      // Act
      await specController.deleteSpec(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('spec_details');
      expect(supabase.from).toHaveBeenCalledWith('specs');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Specification deleted successfully'
      });
    });
    
    it('should delete a specification and its details', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { id: '1' };
      const res = mockResponse();
      
      // Reset all mocks first
      jest.clearAllMocks();
      
      let callCount = 0;
      
      // Mock Supabase for the entire test
      (supabase.from as jest.Mock).mockImplementation((table) => {
        callCount++;
        
        if (table === 'spec_details' && callCount === 1) {
          // First call to check details
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: [{ id: 101 }], // Spec has associated details
              error: null
            })
          };
        } else if (table === 'spec_details' && callCount === 2) {
          // Second call to delete details
          return {
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
              error: null
            })
          };
        } else if (table === 'specs') {
          // Third call to delete spec
          return {
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
              error: null
            })
          };
        }
        return {};
      });
      
      // Mock response methods
      (res.status as jest.Mock).mockReturnValue(res);
      (res.json as jest.Mock).mockReturnValue(res);
      
      // Act
      await specController.deleteSpec(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('spec_details');
      expect(supabase.from).toHaveBeenCalledWith('specs');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Specification deleted successfully'
      });
    });
  });
  
  describe('getSpecsByProductId', () => {
    it('should return specifications for a specific product', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { productId: '1' };
      req.query = { limit: '10', offset: '0' };
      const res = mockResponse();
      
      // Mock specs data
      const mockSpecs = [
        { id: 1, name: 'Spec 1', code: 'S001', product_id: 1, company_id: 1 },
        { id: 2, name: 'Spec 2', code: 'S002', product_id: 1, company_id: 1 }
      ];
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockReturnThis();
      (supabase.range as jest.Mock).mockResolvedValue({
        data: mockSpecs,
        error: null,
        count: 2
      });
      
      // Act
      await specController.getSpecsByProductId(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('specs');
      expect(supabase.select).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(supabase.eq).toHaveBeenCalledWith('product_id', '1');
      expect(supabase.eq).toHaveBeenCalledWith('company_id', 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockSpecs,
        count: 2,
        limit: 10,
        offset: 0
      });
    });
  });
  
  describe('createSpecDetail', () => {
    it('should create a new specification detail', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        spec_id: 1,
        parameter_name: 'Test Parameter',
        min_value: 10,
        max_value: 20,
        target_value: 15,
        unit: 'mm',
        is_mandatory: true
      };
      const res = mockResponse();
      
      // Reset all mocks first
      jest.clearAllMocks();
      
      let callCount = 0;
      
      // Mock spec check
      const mockSpec = { id: 1, name: 'Spec 1', company_id: 1 };
      
      // Mock sequence check
      const mockMaxSequence = [{ sequence: 20 }];
      
      // Mock created spec detail
      const mockCreatedDetail = {
        id: 101,
        spec_id: 1,
        parameter_name: 'Test Parameter',
        min_value: 10,
        max_value: 20,
        target_value: 15,
        unit: 'mm',
        is_mandatory: true,
        sequence: 30,
        company_id: 1,
        created_by: 'test-user-id'
      };
      
      // Mock Supabase for the entire test
      (supabase.from as jest.Mock).mockImplementation((table) => {
        callCount++;
        
        if (table === 'specs' && callCount === 1) {
          // First call to check if spec exists
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockSpec,
              error: null
            })
          };
        } else if (table === 'spec_details' && callCount === 2) {
          // Second call to get max sequence
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: mockMaxSequence,
              error: null
            })
          };
        } else if (table === 'spec_details' && callCount === 3) {
          // Third call to insert the detail
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockCreatedDetail,
              error: null
            })
          };
        }
        return {};
      });
      
      // Mock response methods
      (res.status as jest.Mock).mockReturnValue(res);
      (res.json as jest.Mock).mockReturnValue(res);
      
      // Act
      await specController.createSpecDetail(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedDetail
      });
    });
    
    it('should return 400 if specification ID is missing', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        parameter_name: 'Test Parameter',
        min_value: 10,
        max_value: 20
      };
      const res = mockResponse();
      
      // Reset all mocks first
      jest.clearAllMocks();
      
      // Mock response methods
      (res.status as jest.Mock).mockReturnValue(res);
      (res.json as jest.Mock).mockReturnValue(res);
      
      // Act
      await specController.createSpecDetail(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Specification ID is required'
      });
    });
    
    it('should return 404 if specification is not found', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        spec_id: 999,
        parameter_name: 'Test Parameter',
        min_value: 10,
        max_value: 20
      };
      const res = mockResponse();
      
      // Reset all mocks first
      jest.clearAllMocks();
      
      // Mock Supabase for the entire test
      (supabase.from as jest.Mock).mockImplementation(() => {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Specification not found' }
          })
        };
      });
      
      // Mock response methods
      (res.status as jest.Mock).mockReturnValue(res);
      (res.json as jest.Mock).mockReturnValue(res);
      
      // Act
      await specController.createSpecDetail(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Specification not found'
      });
    });
  });
  
  describe('updateSpecDetail', () => {
    it('should update an existing specification detail', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        id: 101,
        parameter_name: 'Updated Parameter',
        min_value: 5,
        max_value: 25,
        is_mandatory: false
      };
      const res = mockResponse();
      
      // Mock existing spec detail
      const existingDetail = {
        id: 101,
        spec_id: 1,
        parameter_name: 'Test Parameter',
        min_value: 10,
        max_value: 20,
        target_value: 15,
        unit: 'mm',
        is_mandatory: true,
        sequence: 30,
        company_id: 1,
        created_by: 'test-user-id',
        created_at: new Date().toISOString()
      };
      
      // Mock updated spec detail
      const updatedDetail = {
        ...existingDetail,
        parameter_name: 'Updated Parameter',
        min_value: 5,
        max_value: 25,
        is_mandatory: false,
        updated_at: new Date().toISOString(),
        updated_by: 'test-user-id'
      };
      
      // Mock Supabase responses
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock)
        .mockResolvedValueOnce({ data: existingDetail, error: null }) // First call to get existing detail
        .mockResolvedValueOnce({ data: updatedDetail, error: null }); // Second call after update
      
      (supabase.update as jest.Mock).mockReturnThis();
      
      // Act
      await specController.updateSpecDetail(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('spec_details');
      expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({
        parameter_name: 'Updated Parameter',
        min_value: 5,
        max_value: 25,
        is_mandatory: false,
        updated_by: 'test-user-id'
      }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedDetail
      });
    });
    
    it('should return 400 if specification detail ID is missing', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        parameter_name: 'Updated Parameter',
        min_value: 5,
        max_value: 25
      };
      const res = mockResponse();
      
      // Act
      await specController.updateSpecDetail(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Specification detail ID is required'
      });
    });
  });
});