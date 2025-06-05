import { Request, Response } from 'express';
import {
  getAllProductToCustomers,
  getProductToCustomerById,
  getProductToCustomersByProductId,
  getProductToCustomersByCustomerId,
  createProductToCustomer,
  updateProductToCustomer,
  deleteProductToCustomer
} from '../../controllers/productToCustomer.controller';
import { supabase } from '../../config/supabase';
import * as productHistoryController from '../../controllers/productHistory.controller';

// Mock Supabase client
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis()
  }
}));

// Mock the product history controller
jest.mock('../../controllers/productHistory.controller', () => ({
  createProductHistory: jest.fn().mockResolvedValue({ id: 123 })
}));

describe('ProductToCustomer Controller', () => {
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
  
  describe('getAllProductToCustomers', () => {
    it('should return all product-customer relationships', async () => {
      const mockRelationships = [
        { id: 1, product_id: 101, customer_id: 201, custom_product_code: 'CUST-101' },
        { id: 2, product_id: 102, customer_id: 202, custom_product_code: 'CUST-102' }
      ];
      
      (supabase.select as jest.Mock).mockResolvedValueOnce({ data: mockRelationships, error: null });
      
      await getAllProductToCustomers(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('product_to_customers');
      expect(supabase.select).toHaveBeenCalledWith(expect.stringContaining('*'));
      expect(supabase.eq).toHaveBeenCalledWith('status', true);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockRelationships);
    });
  });
  
  describe('getProductToCustomerById', () => {
    it('should return product-customer relationship by id', async () => {
      const mockRelationship = { 
        id: 1, 
        product_id: 101, 
        customer_id: 201, 
        custom_product_code: 'CUST-101'
      };
      
      mockRequest.params = { id: '1' };
      
      (supabase.single as jest.Mock).mockResolvedValueOnce({ data: mockRelationship, error: null });
      
      await getProductToCustomerById(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('product_to_customers');
      expect(supabase.eq).toHaveBeenCalledWith('id', '1');
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockRelationship);
    });
    
    it('should return 404 if relationship not found', async () => {
      mockRequest.params = { id: '999' };
      
      (supabase.single as jest.Mock).mockResolvedValueOnce({ 
        data: null, 
        error: { code: 'PGRST116', message: 'Not found' }
      });
      
      await getProductToCustomerById(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'Product-customer relationship not found' 
      });
    });
  });
  
  describe('getProductToCustomersByProductId', () => {
    it('should return relationships for a specific product', async () => {
      const mockRelationships = [
        { id: 1, customer_id: 201, custom_product_code: 'CUST-101' },
        { id: 2, customer_id: 202, custom_product_code: 'CUST-102' }
      ];
      
      mockRequest.params = { productId: '101' };
      
      (supabase.select as jest.Mock).mockResolvedValueOnce({ data: mockRelationships, error: null });
      
      await getProductToCustomersByProductId(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('product_to_customers');
      expect(supabase.eq).toHaveBeenCalledWith('product_id', '101');
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockRelationships);
    });
  });
  
  describe('getProductToCustomersByCustomerId', () => {
    it('should return relationships for a specific customer', async () => {
      const mockRelationships = [
        { id: 1, product_id: 101, custom_product_code: 'CUST-101' },
        { id: 2, product_id: 102, custom_product_code: 'CUST-102' }
      ];
      
      mockRequest.params = { customerId: '201' };
      
      (supabase.select as jest.Mock).mockResolvedValueOnce({ data: mockRelationships, error: null });
      
      await getProductToCustomersByCustomerId(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('product_to_customers');
      expect(supabase.eq).toHaveBeenCalledWith('customer_id', '201');
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(mockRelationships);
    });
  });
  
  describe('createProductToCustomer', () => {
    it('should create a new product-customer relationship', async () => {
      const relationshipData = {
        product_id: 101,
        customer_id: 201,
        custom_product_code: 'CUST-101',
        custom_product_name: 'Custom Product Name'
      };
      
      const createdRelationship = { 
        id: 1, 
        ...relationshipData, 
        status: true, 
        company_id: 1, 
        created_by: 'user-123'
      };
      
      mockRequest.body = relationshipData;
      
      // Mock the check for existing relationship
      (supabase.limit as jest.Mock).mockResolvedValueOnce({ data: [], error: null });
      
      // Mock the insert
      (supabase.single as jest.Mock).mockResolvedValueOnce({ data: createdRelationship, error: null });
      
      // Mock the product and customer lookups for history
      (supabase.single as jest.Mock)
        .mockResolvedValueOnce({ data: { name: 'Test Product' }, error: null })
        .mockResolvedValueOnce({ data: { name: 'Test Customer' }, error: null });
      
      await createProductToCustomer(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('product_to_customers');
      expect(supabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        product_id: 101,
        customer_id: 201,
        custom_product_code: 'CUST-101',
        custom_product_name: 'Custom Product Name'
      }));
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith(createdRelationship);
      
      // Check if history was created
      expect(productHistoryController.createProductHistory).toHaveBeenCalled();
    });
    
    it('should return 409 if relationship already exists', async () => {
      mockRequest.body = {
        product_id: 101,
        customer_id: 201
      };
      
      // Mock finding an existing relationship
      (supabase.limit as jest.Mock).mockResolvedValueOnce({ 
        data: [{ id: 1 }], 
        error: null 
      });
      
      await createProductToCustomer(mockRequest as Request, mockResponse as Response);
      
      expect(responseStatus).toHaveBeenCalledWith(409);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'This product-customer relationship already exists' 
      });
    });
  });
  
  describe('updateProductToCustomer', () => {
    it('should update an existing product-customer relationship', async () => {
      const relationshipData = {
        id: 1,
        custom_product_code: 'CUST-101-UPDATED',
        custom_product_name: 'Updated Product Name'
      };
      
      const updatedRelationship = { 
        ...relationshipData, 
        product_id: 101, 
        customer_id: 201 
      };
      
      mockRequest.body = relationshipData;
      
      // Mock the current data lookup
      (supabase.single as jest.Mock).mockResolvedValueOnce({ 
        data: { 
          custom_product_code: 'CUST-101', 
          custom_product_name: 'Custom Product Name'
        }, 
        error: null 
      });
      
      // Mock the update
      (supabase.single as jest.Mock).mockResolvedValueOnce({ 
        data: updatedRelationship, 
        error: null 
      });
      
      await updateProductToCustomer(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('product_to_customers');
      expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({
        custom_product_code: 'CUST-101-UPDATED',
        custom_product_name: 'Updated Product Name'
      }));
      expect(supabase.eq).toHaveBeenCalledWith('id', 1);
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith(updatedRelationship);
      
      // Check if history was created
      expect(productHistoryController.createProductHistory).toHaveBeenCalled();
    });
  });
  
  describe('deleteProductToCustomer', () => {
    it('should delete a product-customer relationship', async () => {
      mockRequest.params = { id: '1' };
      
      // Mock the current data lookup for history
      (supabase.single as jest.Mock).mockResolvedValueOnce({ 
        data: { 
          product_id: 101,
          product: { name: 'Test Product' },
          customer: { name: 'Test Customer' }
        }, 
        error: null 
      });
      
      // Mock the update (soft delete)
      (supabase.eq as jest.Mock).mockResolvedValueOnce({ error: null });
      
      await deleteProductToCustomer(mockRequest as Request, mockResponse as Response);
      
      expect(supabase.from).toHaveBeenCalledWith('product_to_customers');
      expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({ 
        status: false
      }));
      expect(supabase.eq).toHaveBeenCalledWith('id', '1');
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'Product-customer relationship deleted successfully' 
      });
      
      // Check if history was created
      expect(productHistoryController.createProductHistory).toHaveBeenCalled();
    });
  });
});