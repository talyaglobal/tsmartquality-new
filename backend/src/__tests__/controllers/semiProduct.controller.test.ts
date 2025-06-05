import { Request, Response } from 'express';
import {
  getAllSemiProducts,
  getSemiProductById,
  getSemiProductWithDetails,
  createSemiProduct,
  updateSemiProduct,
  deleteSemiProduct,
  getFilteredSemiProducts
} from '../../controllers/semiProduct.controller';
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

describe('Semi-Product Controller', () => {
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
  
  describe('getAllSemiProducts', () => {
    it('should return all semi-products', async () => {
      const mockProducts = [
        { id: 1, name: 'Semi-Product 1', code: 'SP001' },
        { id: 2, name: 'Semi-Product 2', code: 'SP002' }
      ];
      
      (supabase.select as jest.Mock).mockResolvedValueOnce({ data: mockProducts, error: null });
      
      await getAllSemiProducts(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('semi_products');
      expect(supabase.select).toHaveBeenCalledWith(expect.stringContaining('*'));
      expect(supabase.eq).toHaveBeenCalledWith('status', true);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockProducts);
    });
  });
  
  describe('getSemiProductById', () => {
    it('should return semi-product by id', async () => {
      const mockProduct = { id: 1, name: 'Test Semi-Product', code: 'SP001' };
      mockRequest.params = { id: '1' };
      
      (supabase.single as jest.Mock).mockResolvedValueOnce({ data: mockProduct, error: null });
      
      await getSemiProductById(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('semi_products');
      expect(supabase.select).toHaveBeenCalledWith(expect.stringContaining('*'));
      expect(supabase.eq).toHaveBeenCalledWith('id', '1');
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockProduct);
    });
    
    it('should return 404 if semi-product not found', async () => {
      mockRequest.params = { id: '999' };
      
      (supabase.single as jest.Mock).mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST116', message: 'Not found' }
      });
      
      await getSemiProductById(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Semi-product not found' });
    });
  });
  
  describe('getSemiProductWithDetails', () => {
    it('should return semi-product with all associated details', async () => {
      const mockProduct = { id: 1, name: 'Test Semi-Product', code: 'SP001' };
      const mockRecipes = [{ id: 101, name: 'Recipe 1' }];
      const mockUsedInRecipes = [{ id: 201, recipe: { id: 102, name: 'Recipe 2' } }];
      
      mockRequest.params = { id: '1' };
      
      // Mock the single product query
      (supabase.single as jest.Mock).mockResolvedValueOnce({ data: mockProduct, error: null });
      
      // Mock the recipes where this semi-product is output
      (supabase.select as jest.Mock).mockResolvedValueOnce({ data: mockRecipes, error: null });
      
      // Mock the recipes where this semi-product is ingredient
      (supabase.select as jest.Mock).mockResolvedValueOnce({ data: mockUsedInRecipes, error: null });
      
      await getSemiProductWithDetails(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenNthCalledWith(1, 'semi_products');
      expect(supabase.from).toHaveBeenNthCalledWith(2, 'recipes');
      expect(supabase.from).toHaveBeenNthCalledWith(3, 'recipe_details');
      
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        ...mockProduct,
        recipes: mockRecipes,
        used_in_recipes: mockUsedInRecipes
      });
    });
    
    it('should return 404 if semi-product not found', async () => {
      mockRequest.params = { id: '999' };
      
      (supabase.single as jest.Mock).mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST116', message: 'Not found' }
      });
      
      await getSemiProductWithDetails(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ message: 'Semi-product not found' });
    });
  });
  
  describe('createSemiProduct', () => {
    it('should create a new semi-product', async () => {
      const productData = {
        name: 'New Semi-Product',
        code: 'SP003',
        description: 'Test description',
        semi_product_group_id: 1,
        stock_tracking: true
      };
      
      const createdProduct = { 
        id: 3, 
        ...productData, 
        status: true, 
        company_id: 1,
        created_by: 'user-123'
      };
      
      mockRequest.body = productData;
      
      // Mock the check for existing product with the same code
      (supabase.limit as jest.Mock).mockResolvedValueOnce({ data: [], error: null });
      
      // Mock the insert
      (supabase.single as jest.Mock).mockResolvedValueOnce({ data: createdProduct, error: null });
      
      await createSemiProduct(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('semi_products');
      expect(supabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Semi-Product',
        code: 'SP003',
        description: 'Test description',
        semi_product_group_id: 1,
        stock_tracking: true,
        company_id: 1,
        created_by: 'user-123'
      }));
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith(createdProduct);
    });
    
    it('should return 409 if semi-product with same code already exists', async () => {
      mockRequest.body = {
        name: 'New Semi-Product',
        code: 'SP001'  // existing code
      };
      
      // Mock finding an existing product with the same code
      (supabase.limit as jest.Mock).mockResolvedValueOnce({ 
        data: [{ id: 1 }], 
        error: null 
      });
      
      await createSemiProduct(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(409);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: `Semi-product with code 'SP001' already exists` 
      });
    });
  });
  
  describe('updateSemiProduct', () => {
    it('should update an existing semi-product', async () => {
      const productData = {
        id: 1,
        name: 'Updated Semi-Product',
        code: 'SP001-UPD'
      };
      
      const updatedProduct = { 
        ...productData, 
        description: 'Some description',
        status: true
      };
      
      mockRequest.body = productData;
      
      // Mock getting current code
      (supabase.single as jest.Mock).mockResolvedValueOnce({ 
        data: { code: 'SP001' }, 
        error: null 
      });
      
      // Mock check for duplicate code
      (supabase.limit as jest.Mock).mockResolvedValueOnce({ data: [], error: null });
      
      // Mock the update
      (supabase.single as jest.Mock).mockResolvedValueOnce({ 
        data: updatedProduct, 
        error: null 
      });
      
      await updateSemiProduct(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('semi_products');
      expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        name: 'Updated Semi-Product',
        code: 'SP001-UPD',
        updated_by: 'user-123'
      }));
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(updatedProduct);
    });
    
    it('should return 400 if id is missing', async () => {
      mockRequest.body = {
        name: 'Updated Semi-Product',
        code: 'SP001-UPD'
      };
      
      await updateSemiProduct(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'Semi-product ID is required' 
      });
    });
  });
  
  describe('deleteSemiProduct', () => {
    it('should delete a semi-product if not used in recipes', async () => {
      mockRequest.params = { id: '1' };
      
      // Mock the recipes checks (empty results = not used)
      (supabase.limit as jest.Mock)
        .mockResolvedValueOnce({ data: [], error: null }) // output check
        .mockResolvedValueOnce({ data: [], error: null }); // ingredient check
      
      // Mock the update (soft delete)
      (supabase.eq as jest.Mock).mockResolvedValueOnce({ error: null });
      
      await deleteSemiProduct(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenNthCalledWith(1, 'recipes');
      expect(supabase.from).toHaveBeenNthCalledWith(2, 'recipe_details');
      expect(supabase.from).toHaveBeenNthCalledWith(3, 'semi_products');
      
      expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({ 
        status: false
      }));
      
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'Semi-product deleted successfully' 
      });
    });
    
    it('should not delete a semi-product if used as output in recipes', async () => {
      mockRequest.params = { id: '1' };
      
      // Mock finding recipes with this semi-product as output
      (supabase.limit as jest.Mock).mockResolvedValueOnce({ 
        data: [{ id: 101 }], 
        error: null 
      });
      
      await deleteSemiProduct(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'Cannot delete semi-product: it is an output in one or more recipes' 
      });
    });
    
    it('should not delete a semi-product if used as ingredient in recipes', async () => {
      mockRequest.params = { id: '1' };
      
      // Mock the first check (output) - not found
      (supabase.limit as jest.Mock).mockResolvedValueOnce({ 
        data: [], 
        error: null 
      });
      
      // Mock the second check (ingredient) - found
      (supabase.limit as jest.Mock).mockResolvedValueOnce({ 
        data: [{ id: 201 }], 
        error: null 
      });
      
      await deleteSemiProduct(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'Cannot delete semi-product: it is used as an ingredient in one or more recipes' 
      });
    });
  });
  
  describe('getFilteredSemiProducts', () => {
    it('should return filtered semi-products with pagination', async () => {
      const mockProducts = [
        { id: 1, name: 'Semi-Product 1' },
        { id: 2, name: 'Semi-Product 2' }
      ];
      
      mockRequest.query = { 
        limit: '10', 
        offset: '0', 
        searchTerm: 'test', 
        stockTracking: 'true' 
      };
      
      // Mock the query
      (supabase.range as jest.Mock).mockResolvedValueOnce({ 
        data: mockProducts, 
        count: 25, 
        error: null 
      });
      
      await getFilteredSemiProducts(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('semi_products');
      expect(supabase.select).toHaveBeenCalledWith(expect.stringContaining('*'), { count: 'exact' });
      expect(supabase.or).toHaveBeenCalledWith(expect.stringContaining('name.ilike.%test%'));
      expect(supabase.eq).toHaveBeenCalledWith('stock_tracking', true);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        items: mockProducts,
        totalCount: 25,
        offset: 0,
        limit: 10
      });
    });
  });
});