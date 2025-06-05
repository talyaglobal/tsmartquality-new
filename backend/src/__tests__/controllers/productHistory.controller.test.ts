import { Request, Response } from 'express';
import { 
  getAllProductHistory, 
  getProductHistoryById, 
  getProductHistoryByProductId,
  getPaginatedProductHistory,
  deleteProductHistory,
  createProductHistory
} from '../../controllers/productHistory.controller';
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
    range: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis()
  }
}));

describe('Product History Controller', () => {
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
  
  describe('getAllProductHistory', () => {
    it('should return all product history records', async () => {
      const mockHistory = [
        { id: 1, product_id: 101, change_description: 'Updated name' },
        { id: 2, product_id: 102, change_description: 'Updated price' }
      ];
      
      (supabase.select as jest.Mock).mockResolvedValueOnce({ data: mockHistory, error: null });
      
      await getAllProductHistory(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('product_history');
      expect(supabase.select).toHaveBeenCalledWith(expect.stringContaining('*'));
      expect(supabase.eq).toHaveBeenCalledWith('status', true);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockHistory);
    });
    
    it('should handle errors', async () => {
      const mockError = new Error('Database error');
      
      (supabase.select as jest.Mock).mockResolvedValueOnce({ data: null, error: mockError });
      
      await getAllProductHistory(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ message: mockError.message });
    });
  });
  
  describe('getProductHistoryById', () => {
    it('should return product history by id', async () => {
      const mockHistory = { id: 1, product_id: 101, change_description: 'Updated name' };
      mockRequest.params = { id: '1' };
      
      (supabase.single as jest.Mock).mockResolvedValueOnce({ data: mockHistory, error: null });
      
      await getProductHistoryById(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('product_history');
      expect(supabase.eq).toHaveBeenCalledWith('id', '1');
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockHistory);
    });
    
    it('should return 404 if history record not found', async () => {
      mockRequest.params = { id: '999' };
      
      (supabase.single as jest.Mock).mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST116', message: 'Not found' }
      });
      
      await getProductHistoryById(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Product history record not found' });
    });
  });
  
  describe('getProductHistoryByProductId', () => {
    it('should return history records for a specific product', async () => {
      const mockHistory = [
        { id: 1, change_description: 'Updated name' },
        { id: 2, change_description: 'Updated price' }
      ];
      
      mockRequest.params = { productId: '101' };
      
      (supabase.select as jest.Mock).mockResolvedValueOnce({ data: mockHistory, error: null });
      
      await getProductHistoryByProductId(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('product_history');
      expect(supabase.eq).toHaveBeenCalledWith('product_id', '101');
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockHistory);
    });
  });
  
  describe('getPaginatedProductHistory', () => {
    it('should return paginated product history records', async () => {
      const mockHistory = [
        { id: 1, product_id: 101 },
        { id: 2, product_id: 102 }
      ];
      
      mockRequest.params = { limit: '10', offset: '0' };
      
      // Mock the count query
      (supabase.select as jest.Mock).mockResolvedValueOnce({ count: 25, error: null });
      
      // Mock the data query
      (supabase.range as jest.Mock).mockResolvedValueOnce({ data: mockHistory, error: null });
      
      await getPaginatedProductHistory(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('product_history');
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        totalCount: 25,
        items: mockHistory,
        offset: 0,
        limit: 10
      });
    });
  });
  
  describe('createProductHistory', () => {
    it('should create a product history record', async () => {
      const mockHistoryData = { 
        product_id: 101, 
        change_description: 'Updated name',
        old_value: 'Old Name',
        new_value: 'New Name'
      };
      
      (supabase.insert as jest.Mock).mockResolvedValueOnce({ 
        data: { id: 1, ...mockHistoryData }, 
        error: null 
      });
      
      const result = await createProductHistory(
        101, 
        'Updated name', 
        'Old Name', 
        'New Name', 
        'user-123', 
        1
      );
      
      expect(supabase.from).toHaveBeenCalledWith('product_history');
      expect(supabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        product_id: 101,
        change_description: 'Updated name',
        old_value: 'Old Name',
        new_value: 'New Name'
      }));
      expect(result).toBeDefined();
    });
  });
  
  describe('deleteProductHistory', () => {
    it('should delete a product history record', async () => {
      mockRequest.params = { id: '1' };
      
      (supabase.eq as jest.Mock).mockResolvedValueOnce({ error: null });
      
      await deleteProductHistory(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('product_history');
      expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({ 
        status: false
      }));
      expect(supabase.eq).toHaveBeenCalledWith('id', '1');
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Product history record deleted successfully' });
    });
  });
});