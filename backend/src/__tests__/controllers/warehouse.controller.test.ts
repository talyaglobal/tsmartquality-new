import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';
import * as warehouseController from '../../controllers/warehouse.controller';

// Mock supabase client
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    group: jest.fn().mockReturnThis()
  }
}));

describe('Warehouse Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    responseObject = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    
    mockRequest = {
      params: {},
      body: {},
      query: {},
      user: {
        id: 'test-user-id',
        companyId: 1
      }
    };
    
    mockResponse = {
      status: jest.fn().mockReturnValue(responseObject),
      json: responseObject.json
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllWarehouses', () => {
    it('should get all warehouses successfully', async () => {
      const mockWarehouses = [
        { id: 1, name: 'Warehouse 1', code: 'WH001' },
        { id: 2, name: 'Warehouse 2', code: 'WH002' }
      ];
      
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockResolvedValue({
        data: mockWarehouses,
        error: null
      });
      
      await warehouseController.getAllWarehouses(
        mockRequest as Request,
        mockResponse as Response
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.json).toHaveBeenCalledWith(mockWarehouses);
    });
    
    it('should handle errors when getting warehouses', async () => {
      const mockError = new Error('Database error');
      
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError
      });
      
      await warehouseController.getAllWarehouses(
        mockRequest as Request,
        mockResponse as Response
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({ message: mockError.message });
    });
  });

  describe('getWarehouseById', () => {
    it('should get warehouse by ID successfully', async () => {
      const mockWarehouse = { id: 1, name: 'Warehouse 1', code: 'WH001' };
      mockRequest.params = { id: '1' };
      
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockWarehouse,
        error: null
      });
      
      await warehouseController.getWarehouseById(
        mockRequest as Request,
        mockResponse as Response
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.json).toHaveBeenCalledWith(mockWarehouse);
    });
    
    it('should return 404 when warehouse is not found', async () => {
      mockRequest.params = { id: '999' };
      
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      });
      
      await warehouseController.getWarehouseById(
        mockRequest as Request,
        mockResponse as Response
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject.json).toHaveBeenCalledWith({ message: 'Warehouse not found' });
    });
  });

  describe('createWarehouse', () => {
    it('should create a warehouse successfully', async () => {
      const newWarehouse = {
        name: 'New Warehouse',
        code: 'NW001',
        address: '123 Warehouse St'
      };
      
      mockRequest.body = newWarehouse;
      
      const createdWarehouse = {
        ...newWarehouse,
        id: 3,
        created_at: new Date().toISOString(),
        status: true
      };
      
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.insert as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: createdWarehouse,
        error: null
      });
      
      await warehouseController.createWarehouse(
        mockRequest as Request,
        mockResponse as Response
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject.json).toHaveBeenCalledWith(createdWarehouse);
      expect(supabase.from).toHaveBeenCalledWith('warehouses');
      expect(supabase.insert).toHaveBeenCalledWith({
        ...newWarehouse,
        created_by: 'test-user-id',
        company_id: 1,
        status: true
      });
    });
    
    it('should handle errors when creating a warehouse', async () => {
      const mockError = new Error('Database error');
      mockRequest.body = { name: 'Error Warehouse' };
      
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.insert as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError
      });
      
      await warehouseController.createWarehouse(
        mockRequest as Request,
        mockResponse as Response
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject.json).toHaveBeenCalledWith({ message: mockError.message });
    });
  });

  describe('updateWarehouse', () => {
    it('should update a warehouse successfully', async () => {
      const warehouseUpdate = {
        id: 1,
        name: 'Updated Warehouse',
        code: 'UW001'
      };
      
      mockRequest.body = warehouseUpdate;
      
      // Mock check if warehouse exists
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: { id: 1 },
        error: null
      });
      
      // Mock update call
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.update as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: { ...warehouseUpdate, updated_at: new Date().toISOString() },
        error: null
      });
      
      await warehouseController.updateWarehouse(
        mockRequest as Request,
        mockResponse as Response
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.json).toHaveBeenCalledWith(expect.objectContaining(warehouseUpdate));
    });
    
    it('should return 404 when warehouse to update is not found', async () => {
      mockRequest.body = { id: 999, name: 'Not Found Warehouse' };
      
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      });
      
      await warehouseController.updateWarehouse(
        mockRequest as Request,
        mockResponse as Response
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject.json).toHaveBeenCalledWith({ 
        message: 'Warehouse not found or you do not have permission to update it' 
      });
    });
  });

  describe('deleteWarehouse', () => {
    it('should delete a warehouse successfully', async () => {
      mockRequest.params = { id: '1' };
      
      // Mock check if warehouse exists
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: { id: 1 },
        error: null
      });
      
      // Mock soft delete call
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.update as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: { id: 1, status: false },
        error: null
      });
      
      await warehouseController.deleteWarehouse(
        mockRequest as Request,
        mockResponse as Response
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.json).toHaveBeenCalledWith({ message: 'Warehouse deleted successfully' });
    });
    
    it('should return 404 when warehouse to delete is not found', async () => {
      mockRequest.params = { id: '999' };
      
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      });
      
      await warehouseController.deleteWarehouse(
        mockRequest as Request,
        mockResponse as Response
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject.json).toHaveBeenCalledWith({ 
        message: 'Warehouse not found or you do not have permission to delete it' 
      });
    });
  });
});