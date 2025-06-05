import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';
import * as qualityCheckController from '../../controllers/qualityCheck.controller';

// Mock response and request
const mockRequest = () => {
  const req = {} as Request;
  req.body = {};
  req.params = {};
  req.query = {};
  req.user = {
    id: 'test-user-id',
    email: 'test@example.com',
    companyId: 1,
    role: 'qualityManager'
  };
  return req;
};

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Quality Check Controller', () => {
  describe('getAllQualityChecks', () => {
    it('should return all quality checks with pagination and filtering', async () => {
      // Arrange
      const req = mockRequest();
      req.query = { 
        page: '1', 
        limit: '10',
        passed: 'true'
      };
      const res = mockResponse();
      
      // Mock quality checks data
      const mockQualityChecks = [
        { 
          id: 1, 
          production_stage_id: 1, 
          checked_by: 'test-user-id',
          check_date: new Date().toISOString(),
          passed: true,
          notes: 'All tests passed',
          company_id: 1 
        },
        { 
          id: 2, 
          production_stage_id: 2, 
          checked_by: 'test-user-id',
          check_date: new Date().toISOString(),
          passed: true,
          notes: 'Everything looks good',
          company_id: 1 
        }
      ];
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.range as jest.Mock).mockResolvedValue({
        data: mockQualityChecks,
        error: null,
        count: 2
      });
      
      // Act
      await qualityCheckController.getAllQualityChecks(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('production_quality_checks');
      expect(supabase.eq).toHaveBeenCalledWith('status', true);
      expect(supabase.eq).toHaveBeenCalledWith('company_id', 1);
      expect(supabase.eq).toHaveBeenCalledWith('passed', true);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockQualityChecks,
        count: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      });
    });

    it('should filter quality checks by productionOrderId', async () => {
      // Arrange
      const req = mockRequest();
      req.query = { 
        page: '1', 
        limit: '10',
        productionOrderId: '5'
      };
      const res = mockResponse();
      
      // Mock stages data for the order
      const mockStages = [
        { id: 10 },
        { id: 11 }
      ];

      // Mock quality checks data
      const mockQualityChecks = [
        { 
          id: 1, 
          production_stage_id: 10, 
          checked_by: 'test-user-id',
          company_id: 1 
        }
      ];
      
      // Mock Supabase responses
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.in as jest.Mock).mockReturnThis();

      // First call to get stages
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockStages,
          error: null
        })
      });

      // Second call to get quality checks
      (supabase.range as jest.Mock).mockResolvedValueOnce({
        data: mockQualityChecks,
        error: null,
        count: 1
      });
      
      // Act
      await qualityCheckController.getAllQualityChecks(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('production_stages');
      expect(supabase.from).toHaveBeenCalledWith('production_quality_checks');
      expect(supabase.in).toHaveBeenCalledWith('production_stage_id', [10, 11]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockQualityChecks,
        count: 1
      }));
    });

    it('should handle database error gracefully', async () => {
      // Arrange
      const req = mockRequest();
      req.query = { page: '1', limit: '10' };
      const res = mockResponse();
      
      // Mock Supabase error
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.range as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });
      
      // Act
      await qualityCheckController.getAllQualityChecks(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Failed to fetch quality checks',
        error: { message: 'Database error' }
      });
    });
  });
  
  describe('getQualityCheckById', () => {
    it('should return a quality check by ID', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { id: '1' };
      const res = mockResponse();
      
      // Mock quality check data
      const mockQualityCheck = {
        id: 1,
        production_stage_id: 1,
        checked_by: 'test-user-id',
        check_date: new Date().toISOString(),
        passed: true,
        notes: 'All tests passed',
        company_id: 1,
        production_stage: {
          id: 1,
          name: 'Assembly',
          production_order_id: 5,
          production_order: {
            id: 5,
            name: 'Production Order #5',
            product_id: 10,
            product: {
              id: 10,
              name: 'Product A',
              sku: 'PROD-A'
            }
          }
        },
        checked_by_user: {
          id: 'test-user-id',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User'
        },
        quality_check_items: [
          {
            id: 1,
            quality_check_id: 1,
            parameter: 'Color',
            expected_value: 'Red',
            actual_value: 'Red',
            passed: true
          }
        ]
      };
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockQualityCheck,
        error: null
      });
      
      // Act
      await qualityCheckController.getQualityCheckById(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('production_quality_checks');
      expect(supabase.eq).toHaveBeenCalledWith('id', '1');
      expect(supabase.eq).toHaveBeenCalledWith('status', true);
      expect(supabase.eq).toHaveBeenCalledWith('company_id', 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockQualityCheck
      });
    });
    
    it('should return 404 if quality check is not found', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { id: '999' };
      const res = mockResponse();
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Quality check not found' }
      });
      
      // Act
      await qualityCheckController.getQualityCheckById(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Quality check not found',
        error: { message: 'Quality check not found' }
      });
    });
  });
  
  describe('createQualityCheck', () => {
    it('should create a new quality check successfully', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        production_stage_id: 1,
        notes: 'Quality check notes',
        passed: true,
        check_items: [
          {
            parameter: 'Color',
            expected_value: 'Blue',
            actual_value: 'Blue',
            unit_of_measure: 'visual',
            passed: true,
            notes: 'Color matches'
          }
        ]
      };
      const res = mockResponse();
      
      // Mock stage data
      const mockStage = {
        id: 1,
        production_order_id: 5,
        stage_status: 'in_progress',
        quality_check_required: true,
        company_id: 1
      };
      
      // Mock quality check data
      const mockQualityCheck = {
        id: 1,
        production_stage_id: 1,
        checked_by: 'test-user-id',
        check_date: expect.any(String),
        passed: true,
        notes: 'Quality check notes',
        company_id: 1
      };
      
      // Mock Supabase responses
      // First call to check stage
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockStage,
          error: null
        })
      });
      
      // Second call to create quality check
      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockQualityCheck,
          error: null
        })
      });
      
      // Third call to create check items
      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({
          error: null
        })
      });
      
      // Fourth call to update stage
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      });
      
      // Act
      await qualityCheckController.createQualityCheck(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Quality check created successfully',
        data: mockQualityCheck
      });
    });
    
    it('should return 404 if stage is not found', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        production_stage_id: 999,
        notes: 'Quality check notes',
        passed: true
      };
      const res = mockResponse();
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Stage not found' }
      });
      
      // Act
      await qualityCheckController.createQualityCheck(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Production stage not found',
        error: { message: 'Stage not found' }
      });
    });
    
    it('should return 400 if stage does not require quality check', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        production_stage_id: 1,
        notes: 'Quality check notes',
        passed: true
      };
      const res = mockResponse();
      
      // Mock stage data
      const mockStage = {
        id: 1,
        production_order_id: 5,
        stage_status: 'in_progress',
        quality_check_required: false,
        company_id: 1
      };
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockStage,
        error: null
      });
      
      // Act
      await qualityCheckController.createQualityCheck(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Quality check is not required for this stage'
      });
    });
    
    it('should return 400 if stage is not in progress', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        production_stage_id: 1,
        notes: 'Quality check notes',
        passed: true
      };
      const res = mockResponse();
      
      // Mock stage data
      const mockStage = {
        id: 1,
        production_order_id: 5,
        stage_status: 'pending',
        quality_check_required: true,
        company_id: 1
      };
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockStage,
        error: null
      });
      
      // Act
      await qualityCheckController.createQualityCheck(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cannot perform quality check on stage with status 'pending'. Stage must be in progress."
      });
    });
  });
  
  describe('updateQualityCheck', () => {
    it('should update a quality check successfully', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { id: '1' };
      req.body = {
        notes: 'Updated notes',
        passed: true
      };
      const res = mockResponse();
      
      // Mock quality check data
      const mockQualityCheck = {
        id: 1,
        production_stage_id: 1,
        notes: 'Original notes',
        passed: false,
        company_id: 1
      };
      
      const updatedQualityCheck = {
        ...mockQualityCheck,
        notes: 'Updated notes',
        passed: true
      };
      
      // Mock Supabase responses
      // First call to check quality check
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockQualityCheck,
          error: null
        })
      });
      
      // Second call to update quality check
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: updatedQualityCheck,
          error: null
        })
      });
      
      // Third call to update stage
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      });
      
      // Act
      await qualityCheckController.updateQualityCheck(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Quality check updated successfully',
        data: updatedQualityCheck
      });
    });
    
    it('should return 404 if quality check is not found', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { id: '999' };
      req.body = {
        notes: 'Updated notes'
      };
      const res = mockResponse();
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Quality check not found' }
      });
      
      // Act
      await qualityCheckController.updateQualityCheck(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Quality check not found',
        error: { message: 'Quality check not found' }
      });
    });
  });
  
  describe('deleteQualityCheck', () => {
    it('should soft delete a quality check and its items', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { id: '1' };
      const res = mockResponse();
      
      // Mock quality check data
      const mockQualityCheck = {
        id: 1,
        production_stage_id: 1,
        passed: true,
        company_id: 1
      };
      
      // Mock Supabase responses
      // First call to check quality check
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockQualityCheck,
          error: null
        })
      });
      
      // Second call to delete quality check items
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      });
      
      // Third call to delete quality check
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      });
      
      // Fourth call to update stage
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      });
      
      // Act
      await qualityCheckController.deleteQualityCheck(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Quality check deleted successfully'
      });
    });
    
    it('should return 404 if quality check is not found', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { id: '999' };
      const res = mockResponse();
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Quality check not found' }
      });
      
      // Act
      await qualityCheckController.deleteQualityCheck(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Quality check not found',
        error: { message: 'Quality check not found' }
      });
    });
  });
  
  describe('getQualityChecksByStage', () => {
    it('should return quality checks for a specific stage', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { stageId: '1' };
      req.query = { page: '1', limit: '10' };
      const res = mockResponse();
      
      // Mock stage data
      const mockStage = {
        id: 1,
        company_id: 1
      };
      
      // Mock quality checks data
      const mockQualityChecks = [
        { 
          id: 1, 
          production_stage_id: 1, 
          checked_by: 'test-user-id',
          check_date: new Date().toISOString(),
          passed: true,
          notes: 'All tests passed',
          company_id: 1 
        }
      ];
      
      // Mock Supabase responses
      // First call to check stage
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockStage,
          error: null
        })
      });
      
      // Second call to get quality checks
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockQualityChecks,
          error: null,
          count: 1
        })
      });
      
      // Act
      await qualityCheckController.getQualityChecksByStage(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockQualityChecks,
        count: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      });
    });
    
    it('should return 404 if stage is not found', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { stageId: '999' };
      const res = mockResponse();
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Stage not found' }
      });
      
      // Act
      await qualityCheckController.getQualityChecksByStage(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Production stage not found',
        error: { message: 'Stage not found' }
      });
    });
  });
  
  describe('updateQualityCheckItems', () => {
    it('should update quality check items successfully', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { id: '1' };
      req.body = {
        items: [
          {
            id: 1,
            parameter: 'Color',
            expected_value: 'Red',
            actual_value: 'Red',
            unit_of_measure: 'visual',
            passed: true,
            notes: 'Color matches'
          },
          {
            parameter: 'Weight',
            expected_value: '100g',
            actual_value: '98g',
            unit_of_measure: 'grams',
            passed: true,
            notes: 'Within tolerance'
          }
        ]
      };
      const res = mockResponse();
      
      // Mock quality check data
      const mockQualityCheck = {
        id: 1,
        production_stage_id: 1,
        company_id: 1
      };
      
      // Mock Supabase responses
      // First call to check quality check
      (supabase.from as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockQualityCheck,
          error: null
        })
      });
      
      // Mock update for first item
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [{ id: 1 }],
          error: null
        })
      });
      
      // Mock insert for second item
      (supabase.from as jest.Mock).mockReturnValueOnce({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [{ id: 2 }],
          error: null
        })
      });
      
      // Mock update for quality check passed status
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      });
      
      // Mock update for stage quality approval
      (supabase.from as jest.Mock).mockReturnValueOnce({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      });
      
      // Act
      await qualityCheckController.updateQualityCheckItems(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Quality check items updated successfully',
        data: [[{ id: 1 }], [{ id: 2 }]],
        passed: true
      });
    });
    
    it('should return 404 if quality check is not found', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { id: '999' };
      req.body = {
        items: [
          {
            parameter: 'Color',
            expected_value: 'Red',
            actual_value: 'Red',
            passed: true
          }
        ]
      };
      const res = mockResponse();
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Quality check not found' }
      });
      
      // Act
      await qualityCheckController.updateQualityCheckItems(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Quality check not found',
        error: { message: 'Quality check not found' }
      });
    });
    
    it('should return 400 if items are not provided', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { id: '1' };
      req.body = {};
      const res = mockResponse();
      
      // Act
      await qualityCheckController.updateQualityCheckItems(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Items array is required'
      });
    });
  });
});