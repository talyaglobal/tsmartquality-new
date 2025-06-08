import { Request, Response } from 'express';
import { ProductController } from '../../../controllers/product.controller';
import { TestHelpers } from '../../helpers/test-helpers';
import { mockDatabase } from '../../mocks/database.mock';
import { testProducts, validProductData, invalidProductData } from '../../fixtures/test-data';

// Mock dependencies
jest.mock('../../../models/product.model');
jest.mock('../../../utils/database');
jest.mock('../../../services/audit.service');
jest.mock('../../../utils/business-rules');
jest.mock('../../../utils/controller-helpers');

describe('ProductController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseData: any;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockDatabase.reset();
    responseData = {};
    
    // Mock response object
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((data) => {
        responseData = data;
        return mockResponse;
      })
    };
    
    // Mock authenticated request
    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: { id: 1, email: 'user@example.com', role: 'admin' },
      companyId: 1,
      ip: '127.0.0.1'
    };
  });
  
  describe('getAllProducts', () => {
    it('should successfully retrieve products with pagination', async () => {
      mockRequest.query = {
        page: '1',
        pageSize: '10',
        orderBy: 'name',
        sortDirection: 'asc'
      };
      
      // Mock business rules
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.checkResourceAccess = jest.fn().mockReturnValue({
        allowed: true
      });
      
      // Mock controller helpers
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.parsePagination = jest.fn().mockReturnValue({
        page: 1,
        pageSize: 10,
        offset: 0
      });
      mockControllerHelpers.parseSorting = jest.fn().mockReturnValue({
        orderBy: 'name',
        sortDirection: 'asc'
      });
      mockControllerHelpers.sendPaginatedResponse = jest.fn().mockImplementation((res, data, pagination) => {
        res.status(200).json({
          success: true,
          data,
          pagination
        });
      });
      
      // Mock product model
      const mockProductModel = require('../../../models/product.model').ProductModel;
      mockProductModel.findAllWithFilters = jest.fn().mockResolvedValue({
        products: testProducts,
        total: testProducts.length
      });
      
      await ProductController.getAllProducts(mockRequest as any, mockResponse as Response);
      
      expect(mockBusinessRules.checkResourceAccess).toHaveBeenCalledWith('admin', 'product:read');
      expect(mockProductModel.findAllWithFilters).toHaveBeenCalled();
      expect(mockControllerHelpers.sendPaginatedResponse).toHaveBeenCalled();
    });
    
    it('should reject unauthorized access', async () => {
      mockRequest.user = { id: 1, email: 'user@example.com', role: 'guest' };
      
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.checkResourceAccess = jest.fn().mockReturnValue({
        allowed: false,
        reason: 'Insufficient permissions'
      });
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.sendError = jest.fn().mockImplementation((res, message, status) => {
        res.status(status || 400).json({
          success: false,
          message
        });
      });
      
      await ProductController.getAllProducts(mockRequest as any, mockResponse as Response);
      
      expect(mockControllerHelpers.sendError).toHaveBeenCalledWith(
        mockResponse,
        'Insufficient permissions',
        403
      );
    });
    
    it('should validate filter parameters', async () => {
      mockRequest.query = {
        sellerId: 'invalid',
        brandId: '-1'
      };
      
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.checkResourceAccess = jest.fn().mockReturnValue({
        allowed: true
      });
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.parsePagination = jest.fn().mockReturnValue({
        page: 1,
        pageSize: 10,
        offset: 0
      });
      mockControllerHelpers.parseSorting = jest.fn().mockReturnValue({
        orderBy: 'name',
        sortDirection: 'asc'
      });
      mockControllerHelpers.validateNumeric = jest.fn()
        .mockReturnValueOnce([{ field: 'sellerId', message: 'Invalid numeric value' }])
        .mockReturnValueOnce([{ field: 'brandId', message: 'Value must be at least 1' }]);
      mockControllerHelpers.sendValidationError = jest.fn().mockImplementation((res, errors) => {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      });
      
      await ProductController.getAllProducts(mockRequest as any, mockResponse as Response);
      
      expect(mockControllerHelpers.sendValidationError).toHaveBeenCalled();
    });
    
    it('should handle database errors gracefully', async () => {
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.checkResourceAccess = jest.fn().mockReturnValue({
        allowed: true
      });
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.parsePagination = jest.fn().mockReturnValue({
        page: 1,
        pageSize: 10,
        offset: 0
      });
      mockControllerHelpers.parseSorting = jest.fn().mockReturnValue({
        orderBy: 'name',
        sortDirection: 'asc'
      });
      mockControllerHelpers.sendError = jest.fn().mockImplementation((res, message, status) => {
        res.status(status || 500).json({
          success: false,
          message
        });
      });
      
      // Mock database error
      const mockProductModel = require('../../../models/product.model').ProductModel;
      mockProductModel.findAllWithFilters = jest.fn().mockRejectedValue(
        new Error('Database connection failed')
      );
      
      await ProductController.getAllProducts(mockRequest as any, mockResponse as Response);
      
      expect(mockControllerHelpers.sendError).toHaveBeenCalledWith(
        mockResponse,
        'Failed to retrieve products',
        500
      );
    });
  });
  
  describe('getProductById', () => {
    it('should successfully retrieve a product by ID', async () => {
      mockRequest.params = { id: '1' };
      
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.checkResourceAccess = jest.fn().mockReturnValue({
        allowed: true
      });
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.validateNumeric = jest.fn().mockReturnValue([]);
      mockControllerHelpers.sendSuccess = jest.fn().mockImplementation((res, data, message, status) => {
        res.status(status || 200).json({
          success: true,
          message: message || 'Success',
          data
        });
      });
      
      const mockProductModel = require('../../../models/product.model').ProductModel;
      mockProductModel.findById = jest.fn().mockResolvedValue(testProducts[0]);
      
      await ProductController.getProductById(mockRequest as any, mockResponse as Response);
      
      expect(mockProductModel.findById).toHaveBeenCalledWith(1);
      expect(mockControllerHelpers.sendSuccess).toHaveBeenCalled();
    });
    
    it('should return 404 for non-existent product', async () => {
      mockRequest.params = { id: '999' };
      
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.checkResourceAccess = jest.fn().mockReturnValue({
        allowed: true
      });
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.validateNumeric = jest.fn().mockReturnValue([]);
      mockControllerHelpers.sendError = jest.fn().mockImplementation((res, message, status) => {
        res.status(status || 400).json({
          success: false,
          message
        });
      });
      
      const mockProductModel = require('../../../models/product.model').ProductModel;
      mockProductModel.findById = jest.fn().mockResolvedValue(null);
      
      await ProductController.getProductById(mockRequest as any, mockResponse as Response);
      
      expect(mockControllerHelpers.sendError).toHaveBeenCalledWith(
        mockResponse,
        'Product not found',
        404
      );
    });
    
    it('should validate product ID parameter', async () => {
      mockRequest.params = { id: 'invalid' };
      
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.checkResourceAccess = jest.fn().mockReturnValue({
        allowed: true
      });
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.validateNumeric = jest.fn().mockReturnValue([
        { field: 'id', message: 'Invalid product ID' }
      ]);
      mockControllerHelpers.sendValidationError = jest.fn().mockImplementation((res, errors) => {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      });
      
      await ProductController.getProductById(mockRequest as any, mockResponse as Response);
      
      expect(mockControllerHelpers.sendValidationError).toHaveBeenCalled();
    });
  });
  
  describe('createProduct', () => {
    it('should successfully create a new product', async () => {
      mockRequest.body = validProductData;
      
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.checkResourceAccess = jest.fn().mockReturnValue({
        allowed: true
      });
      mockBusinessRules.validateProductData = jest.fn().mockReturnValue([]);
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.sendSuccess = jest.fn().mockImplementation((res, data, message, status) => {
        res.status(status || 201).json({
          success: true,
          message: message || 'Success',
          data
        });
      });
      
      const mockProductModel = require('../../../models/product.model').ProductModel;
      mockProductModel.findByCode = jest.fn().mockResolvedValue(null);
      mockProductModel.create = jest.fn().mockResolvedValue({
        id: 1,
        ...validProductData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await ProductController.createProduct(mockRequest as any, mockResponse as Response);
      
      expect(mockProductModel.create).toHaveBeenCalled();
      expect(mockControllerHelpers.sendSuccess).toHaveBeenCalledWith(
        mockResponse,
        expect.any(Object),
        'Product created successfully',
        201
      );
    });
    
    it('should reject creation with invalid data', async () => {
      mockRequest.body = invalidProductData;
      
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.checkResourceAccess = jest.fn().mockReturnValue({
        allowed: true
      });
      mockBusinessRules.validateProductData = jest.fn().mockReturnValue([
        { field: 'code', message: 'Product code cannot be empty' },
        { field: 'price', message: 'Price must be positive' }
      ]);
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.sendValidationError = jest.fn().mockImplementation((res, errors) => {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      });
      
      await ProductController.createProduct(mockRequest as any, mockResponse as Response);
      
      expect(mockControllerHelpers.sendValidationError).toHaveBeenCalled();
    });
    
    it('should reject creation with duplicate product code', async () => {
      mockRequest.body = validProductData;
      
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.checkResourceAccess = jest.fn().mockReturnValue({
        allowed: true
      });
      mockBusinessRules.validateProductData = jest.fn().mockReturnValue([]);
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.sendError = jest.fn().mockImplementation((res, message, status) => {
        res.status(status || 400).json({
          success: false,
          message
        });
      });
      
      // Mock existing product with same code
      const mockProductModel = require('../../../models/product.model').ProductModel;
      mockProductModel.findByCode = jest.fn().mockResolvedValue(testProducts[0]);
      
      await ProductController.createProduct(mockRequest as any, mockResponse as Response);
      
      expect(mockControllerHelpers.sendError).toHaveBeenCalledWith(
        mockResponse,
        'Product with this code already exists',
        409
      );
    });
  });
  
  describe('updateProduct', () => {
    it('should successfully update a product', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { name: 'Updated Product Name' };
      
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.checkResourceAccess = jest.fn().mockReturnValue({
        allowed: true
      });
      mockBusinessRules.validateProductData = jest.fn().mockReturnValue([]);
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.validateNumeric = jest.fn().mockReturnValue([]);
      mockControllerHelpers.sendSuccess = jest.fn().mockImplementation((res, data, message, status) => {
        res.status(status || 200).json({
          success: true,
          message: message || 'Success',
          data
        });
      });
      
      const mockProductModel = require('../../../models/product.model').ProductModel;
      mockProductModel.findById = jest.fn().mockResolvedValue(testProducts[0]);
      mockProductModel.update = jest.fn().mockResolvedValue({
        ...testProducts[0],
        name: 'Updated Product Name',
        updatedAt: new Date()
      });
      
      await ProductController.updateProduct(mockRequest as any, mockResponse as Response);
      
      expect(mockProductModel.update).toHaveBeenCalledWith(1, mockRequest.body);
      expect(mockControllerHelpers.sendSuccess).toHaveBeenCalled();
    });
    
    it('should return 404 for non-existent product update', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { name: 'Updated Name' };
      
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.checkResourceAccess = jest.fn().mockReturnValue({
        allowed: true
      });
      mockBusinessRules.validateProductData = jest.fn().mockReturnValue([]);
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.validateNumeric = jest.fn().mockReturnValue([]);
      mockControllerHelpers.sendError = jest.fn().mockImplementation((res, message, status) => {
        res.status(status || 400).json({
          success: false,
          message
        });
      });
      
      const mockProductModel = require('../../../models/product.model').ProductModel;
      mockProductModel.findById = jest.fn().mockResolvedValue(null);
      
      await ProductController.updateProduct(mockRequest as any, mockResponse as Response);
      
      expect(mockControllerHelpers.sendError).toHaveBeenCalledWith(
        mockResponse,
        'Product not found',
        404
      );
    });
  });
  
  describe('deleteProduct', () => {
    it('should successfully delete a product', async () => {
      mockRequest.params = { id: '1' };
      
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.checkResourceAccess = jest.fn().mockReturnValue({
        allowed: true
      });
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.validateNumeric = jest.fn().mockReturnValue([]);
      mockControllerHelpers.sendSuccess = jest.fn().mockImplementation((res, data, message, status) => {
        res.status(status || 200).json({
          success: true,
          message: message || 'Success',
          data
        });
      });
      
      const mockProductModel = require('../../../models/product.model').ProductModel;
      mockProductModel.findById = jest.fn().mockResolvedValue(testProducts[0]);
      mockProductModel.delete = jest.fn().mockResolvedValue(true);
      
      await ProductController.deleteProduct(mockRequest as any, mockResponse as Response);
      
      expect(mockProductModel.delete).toHaveBeenCalledWith(1);
      expect(mockControllerHelpers.sendSuccess).toHaveBeenCalledWith(
        mockResponse,
        null,
        'Product deleted successfully'
      );
    });
    
    it('should return 404 for non-existent product deletion', async () => {
      mockRequest.params = { id: '999' };
      
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.checkResourceAccess = jest.fn().mockReturnValue({
        allowed: true
      });
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.validateNumeric = jest.fn().mockReturnValue([]);
      mockControllerHelpers.sendError = jest.fn().mockImplementation((res, message, status) => {
        res.status(status || 400).json({
          success: false,
          message
        });
      });
      
      const mockProductModel = require('../../../models/product.model').ProductModel;
      mockProductModel.findById = jest.fn().mockResolvedValue(null);
      
      await ProductController.deleteProduct(mockRequest as any, mockResponse as Response);
      
      expect(mockControllerHelpers.sendError).toHaveBeenCalledWith(
        mockResponse,
        'Product not found',
        404
      );
    });
    
    it('should reject unauthorized deletion', async () => {
      mockRequest.user = { id: 1, email: 'user@example.com', role: 'user' };
      mockRequest.params = { id: '1' };
      
      const mockBusinessRules = require('../../../utils/business-rules').BusinessRules;
      mockBusinessRules.checkResourceAccess = jest.fn().mockReturnValue({
        allowed: false,
        reason: 'Insufficient permissions for deletion'
      });
      
      const mockControllerHelpers = require('../../../utils/controller-helpers').ControllerHelpers;
      mockControllerHelpers.sendError = jest.fn().mockImplementation((res, message, status) => {
        res.status(status || 400).json({
          success: false,
          message
        });
      });
      
      await ProductController.deleteProduct(mockRequest as any, mockResponse as Response);
      
      expect(mockControllerHelpers.sendError).toHaveBeenCalledWith(
        mockResponse,
        'Insufficient permissions for deletion',
        403
      );
    });
  });
});