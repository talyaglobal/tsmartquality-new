import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';
import * as warehouseInventoryController from '../../controllers/warehouseInventory.controller';

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
    maybeSingle: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis()
  }
}));

describe('Warehouse Inventory Controller', () => {
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

  describe('getAllInventoryItems', () => {
    it('should get all inventory items successfully', async () => {
      const mockInventory = [
        { 
          id: 1, 
          product_id: 1, 
          warehouse_id: 1, 
          quantity: 100,
          product: { id: 1, name: 'Product 1', code: 'P001' },
          warehouse: { id: 1, name: 'Warehouse 1', code: 'WH001' }
        },
        { 
          id: 2, 
          raw_material_id: 2, 
          warehouse_id: 1, 
          quantity: 200,
          raw_material: { id: 2, name: 'Raw Material 1', code: 'RM001' },
          warehouse: { id: 1, name: 'Warehouse 1', code: 'WH001' }
        }
      ];
      
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockResolvedValue({
        data: mockInventory,
        error: null
      });
      
      await warehouseInventoryController.getAllInventoryItems(
        mockRequest as Request,
        mockResponse as Response
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.json).toHaveBeenCalledWith(mockInventory);
    });
  });

  describe('getInventoryItemById', () => {
    it('should get inventory item by ID successfully', async () => {
      const mockInventoryItem = { 
        id: 1, 
        product_id: 1, 
        warehouse_id: 1, 
        quantity: 100,
        product: { id: 1, name: 'Product 1', code: 'P001' },
        warehouse: { id: 1, name: 'Warehouse 1', code: 'WH001' }
      };
      
      mockRequest.params = { id: '1' };
      
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockInventoryItem,
        error: null
      });
      
      await warehouseInventoryController.getInventoryItemById(
        mockRequest as Request,
        mockResponse as Response
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.json).toHaveBeenCalledWith(mockInventoryItem);
    });
    
    it('should return 404 when inventory item is not found', async () => {
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
      
      await warehouseInventoryController.getInventoryItemById(
        mockRequest as Request,
        mockResponse as Response
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject.json).toHaveBeenCalledWith({ message: 'Inventory item not found' });
    });
  });

  describe('createInventoryItem', () => {
    it('should create an inventory item successfully', async () => {
      const newInventoryItem = {
        warehouse_id: 1,
        product_id: 1,
        quantity: 100,
        unit: 'pcs',
        lot_number: 'LOT001',
        status: 'available'
      };
      
      mockRequest.body = newInventoryItem;
      
      // Mock the warehouse check
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: { id: 1 },
        error: null
      });
      
      // Mock the insert
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.insert as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: { ...newInventoryItem, id: 1 },
        error: null
      });
      
      // Mock the movement insert
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.insert as jest.Mock).mockResolvedValue({
        data: { id: 1 },
        error: null
      });
      
      await warehouseInventoryController.createInventoryItem(
        mockRequest as Request,
        mockResponse as Response
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject.json).toHaveBeenCalledWith(expect.objectContaining(newInventoryItem));
    });
    
    it('should validate that only one item type is provided', async () => {
      const invalidItem = {
        warehouse_id: 1,
        product_id: 1,
        raw_material_id: 2,
        quantity: 100
      };
      
      mockRequest.body = invalidItem;
      
      await warehouseInventoryController.createInventoryItem(
        mockRequest as Request,
        mockResponse as Response
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.json).toHaveBeenCalledWith({ 
        message: 'Exactly one of product_id, raw_material_id, or semi_product_id must be provided' 
      });
    });
  });

  describe('getFilteredInventory', () => {
    it('should filter inventory items successfully', async () => {
      const mockInventory = [
        { 
          id: 1, 
          product_id: 1, 
          warehouse_id: 1, 
          quantity: 100,
          product: { id: 1, name: 'Product 1', code: 'P001' },
          warehouse: { id: 1, name: 'Warehouse 1', code: 'WH001' }
        }
      ];
      
      mockRequest.query = { 
        warehouseId: '1',
        productId: '1'
      };
      
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockResolvedValue({
        data: mockInventory,
        error: null
      });
      
      await warehouseInventoryController.getFilteredInventory(
        mockRequest as Request,
        mockResponse as Response
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.json).toHaveBeenCalledWith(mockInventory);
    });
  });

  describe('getInventoryByWarehouse', () => {
    it('should get inventory items by warehouse successfully', async () => {
      const mockInventory = [
        { 
          id: 1, 
          product_id: 1, 
          warehouse_id: 1, 
          quantity: 100,
          product: { id: 1, name: 'Product 1', code: 'P001' },
          warehouse: { id: 1, name: 'Warehouse 1', code: 'WH001' }
        },
        { 
          id: 2, 
          raw_material_id: 2, 
          warehouse_id: 1, 
          quantity: 200,
          raw_material: { id: 2, name: 'Raw Material 1', code: 'RM001' },
          warehouse: { id: 1, name: 'Warehouse 1', code: 'WH001' }
        }
      ];
      
      mockRequest.params = { warehouseId: '1' };
      
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockResolvedValue({
        data: mockInventory,
        error: null
      });
      
      await warehouseInventoryController.getInventoryByWarehouse(
        mockRequest as Request,
        mockResponse as Response
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.json).toHaveBeenCalledWith(mockInventory);
    });
  });
});