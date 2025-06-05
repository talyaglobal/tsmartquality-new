import { Request, Response } from 'express';
import { supabase } from '../../config/supabase';
import * as recipeController from '../../controllers/recipe.controller';

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

describe('Recipe Controller', () => {
  describe('getAllRecipes', () => {
    it('should return recipes for the user\'s company', async () => {
      // Arrange
      const req = mockRequest();
      req.query = { limit: '10', offset: '0' };
      const res = mockResponse();
      
      // Mock recipes data
      const mockRecipes = [
        { id: 1, name: 'Recipe 1', code: 'R001', company_id: 1 },
        { id: 2, name: 'Recipe 2', code: 'R002', company_id: 1 }
      ];
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockReturnThis();
      (supabase.range as jest.Mock).mockResolvedValue({
        data: mockRecipes,
        error: null,
        count: 2
      });
      
      // Act
      await recipeController.getAllRecipes(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('recipes');
      expect(supabase.select).toHaveBeenCalledWith('*', { count: 'exact' });
      expect(supabase.eq).toHaveBeenCalledWith('company_id', 1);
      expect(supabase.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(supabase.range).toHaveBeenCalledWith(0, 9);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecipes,
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
      await recipeController.getAllRecipes(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Database error'
      });
    });
  });
  
  describe('getRecipeById', () => {
    it('should return a recipe by ID', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { id: '1' };
      const res = mockResponse();
      
      // Mock recipe data
      const mockRecipe = {
        id: 1,
        name: 'Recipe 1',
        code: 'R001',
        description: 'Test recipe',
        company_id: 1
      };
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockRecipe,
        error: null
      });
      
      // Act
      await recipeController.getRecipeById(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('recipes');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.eq).toHaveBeenCalledWith('id', '1');
      expect(supabase.eq).toHaveBeenCalledWith('company_id', 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRecipe
      });
    });
    
    it('should return 404 if recipe is not found', async () => {
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
        error: { message: 'Recipe not found' }
      });
      
      // Act
      await recipeController.getRecipeById(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Recipe not found'
      });
    });
  });
  
  describe('createRecipe', () => {
    it('should create a new recipe', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        code: 'R003',
        name: 'New Recipe',
        description: 'Test new recipe',
        product_id: 1,
        total_quantity: 100
      };
      const res = mockResponse();
      
      // Mock created recipe
      const mockCreatedRecipe = {
        id: 3,
        code: 'R003',
        name: 'New Recipe',
        description: 'Test new recipe',
        product_id: 1,
        semi_product_id: null,
        total_quantity: 100,
        company_id: 1,
        created_by: 'test-user-id',
        created_at: new Date().toISOString()
      };
      
      // Mock Supabase response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.insert as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: mockCreatedRecipe,
        error: null
      });
      
      // Act
      await recipeController.createRecipe(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('recipes');
      expect(supabase.insert).toHaveBeenCalledWith({
        code: 'R003',
        name: 'New Recipe',
        description: 'Test new recipe',
        product_id: 1,
        semi_product_id: null,
        total_quantity: 100,
        company_id: 1,
        created_by: 'test-user-id'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedRecipe
      });
    });
    
    it('should return 400 if both product_id and semi_product_id are provided', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        code: 'R003',
        name: 'New Recipe',
        description: 'Test new recipe',
        product_id: 1,
        semi_product_id: 2,
        total_quantity: 100
      };
      const res = mockResponse();
      
      // Act
      await recipeController.createRecipe(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Either product_id or semi_product_id must be provided, but not both'
      });
    });
    
    it('should return 400 if neither product_id nor semi_product_id is provided', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        code: 'R003',
        name: 'New Recipe',
        description: 'Test new recipe',
        total_quantity: 100
      };
      const res = mockResponse();
      
      // Act
      await recipeController.createRecipe(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Either product_id or semi_product_id must be provided, but not both'
      });
    });
  });
  
  describe('updateRecipe', () => {
    it('should update an existing recipe', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        id: 1,
        name: 'Updated Recipe',
        description: 'Updated description',
        status: 'active'
      };
      const res = mockResponse();
      
      // Mock existing recipe
      const existingRecipe = {
        id: 1,
        code: 'R001',
        name: 'Recipe 1',
        description: 'Test recipe',
        product_id: 1,
        semi_product_id: null,
        total_quantity: 100,
        status: 'draft',
        company_id: 1,
        created_by: 'test-user-id',
        created_at: new Date().toISOString()
      };
      
      // Mock updated recipe
      const updatedRecipe = {
        ...existingRecipe,
        name: 'Updated Recipe',
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
        .mockResolvedValueOnce({ data: existingRecipe, error: null }) // First call to get existing recipe
        .mockResolvedValueOnce({ data: updatedRecipe, error: null }); // Second call after update
      
      (supabase.update as jest.Mock).mockReturnThis();
      
      // Act
      await recipeController.updateRecipe(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('recipes');
      expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({
        code: 'R001', // Unchanged
        name: 'Updated Recipe',
        description: 'Updated description',
        status: 'active',
        updated_by: 'test-user-id'
      }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedRecipe
      });
    });
    
    it('should return 400 if recipe ID is missing', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        name: 'Updated Recipe',
        description: 'Updated description'
      };
      const res = mockResponse();
      
      // Act
      await recipeController.updateRecipe(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Recipe ID is required'
      });
    });
    
    it('should return 404 if recipe is not found', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        id: 999,
        name: 'Updated Recipe'
      };
      const res = mockResponse();
      
      // Mock Supabase error response
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Recipe not found' }
      });
      
      // Act
      await recipeController.updateRecipe(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Recipe not found'
      });
    });
  });
  
  describe('deleteRecipe', () => {
    it('should delete a recipe with no details', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { id: '1' };
      const res = mockResponse();
      
      // Reset all mocks first
      jest.clearAllMocks();
      
      // Mock Supabase for the entire test
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'recipe_details') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          };
        } else if (table === 'recipes') {
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
      await recipeController.deleteRecipe(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('recipe_details');
      expect(supabase.from).toHaveBeenCalledWith('recipes');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Recipe deleted successfully'
      });
    });
    
    it('should delete a recipe and its details', async () => {
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
        
        if (table === 'recipe_details' && callCount === 1) {
          // First call to check details
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: [{ id: 101 }], // Recipe has associated details
              error: null
            })
          };
        } else if (table === 'recipe_details' && callCount === 2) {
          // Second call to delete details
          return {
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
              error: null
            })
          };
        } else if (table === 'recipes') {
          // Third call to delete recipe
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
      await recipeController.deleteRecipe(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('recipe_details');
      expect(supabase.from).toHaveBeenCalledWith('recipes');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Recipe deleted successfully'
      });
    });
  });
  
  describe('getRecipeWithDetails', () => {
    it('should return a recipe with its details', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { recipeId: '1' };
      const res = mockResponse();
      
      // Mock recipe data
      const mockRecipe = {
        id: 1,
        name: 'Recipe 1',
        code: 'R001',
        description: 'Test recipe',
        product_id: 1,
        company_id: 1
      };
      
      // Mock recipe details
      const mockRecipeDetails = [
        { 
          id: 101, 
          recipe_id: 1, 
          raw_material_id: 201, 
          quantity: 500, 
          unit: 'g',
          raw_materials: { id: 201, name: 'Flour', code: 'F001' },
          semi_products: null
        },
        { 
          id: 102, 
          recipe_id: 1, 
          semi_product_id: 301, 
          quantity: 200, 
          unit: 'g',
          raw_materials: null,
          semi_products: { id: 301, name: 'Dough', code: 'SP001' }
        }
      ];
      
      // Mock product data
      const mockProduct = {
        id: 1,
        name: 'Bread',
        code: 'P001'
      };
      
      // Reset all mocks first
      jest.clearAllMocks();
      
      let callCount = 0;
      
      // Mock Supabase for the entire test
      (supabase.from as jest.Mock).mockImplementation((table) => {
        callCount++;
        
        if (table === 'recipes' && callCount === 1) {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockRecipe,
              error: null
            })
          };
        } else if (table === 'recipe_details') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
              data: mockRecipeDetails,
              error: null
            })
          };
        } else if (table === 'products') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockProduct,
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
      await recipeController.getRecipeWithDetails(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 1,
          name: 'Recipe 1',
          product: mockProduct,
          recipe_details: mockRecipeDetails
        })
      });
    });
    
    it('should return 404 if recipe is not found', async () => {
      // Arrange
      const req = mockRequest();
      req.params = { recipeId: '999' };
      const res = mockResponse();
      
      // Reset all mocks first
      jest.clearAllMocks();
      
      // Mock Supabase error response
      (supabase.from as jest.Mock).mockImplementation(() => {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Recipe not found' }
          })
        };
      });
      
      // Mock response methods
      (res.status as jest.Mock).mockReturnValue(res);
      (res.json as jest.Mock).mockReturnValue(res);
      
      // Act
      await recipeController.getRecipeWithDetails(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Recipe not found'
      });
    });
  });
  
  describe('createRecipeDetail', () => {
    it('should create a new recipe detail', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        recipe_id: 1,
        raw_material_id: 201,
        quantity: 500,
        unit: 'g'
      };
      const res = mockResponse();
      
      // Mock recipe check
      const mockRecipe = { id: 1, name: 'Recipe 1', company_id: 1 };
      
      // Mock raw material check
      const mockRawMaterial = { id: 201, name: 'Flour', company_id: 1 };
      
      // Mock sequence check
      const mockMaxSequence = [{ sequence: 20 }];
      
      // Mock created recipe detail
      const mockCreatedDetail = {
        id: 101,
        recipe_id: 1,
        raw_material_id: 201,
        semi_product_id: null,
        quantity: 500,
        unit: 'g',
        sequence: 30,
        company_id: 1,
        created_by: 'test-user-id'
      };
      
      // Mock Supabase responses
      (supabase.from as jest.Mock).mockReturnThis();
      (supabase.select as jest.Mock).mockReturnThis();
      (supabase.eq as jest.Mock).mockReturnThis();
      (supabase.order as jest.Mock).mockReturnThis();
      (supabase.limit as jest.Mock).mockReturnThis();
      (supabase.single as jest.Mock)
        .mockResolvedValueOnce({ data: mockRecipe, error: null }) // Recipe check
        .mockResolvedValueOnce({ data: mockRawMaterial, error: null }) // Raw material check
        .mockResolvedValueOnce({ data: mockCreatedDetail, error: null }); // After insert
      
      // Mock sequence check
      (supabase.limit as jest.Mock).mockResolvedValueOnce({
        data: mockMaxSequence,
        error: null
      });
      
      (supabase.insert as jest.Mock).mockReturnThis();
      
      // Act
      await recipeController.createRecipeDetail(req, res);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('recipe_details');
      expect(supabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        recipe_id: 1,
        raw_material_id: 201,
        semi_product_id: null,
        quantity: 500,
        unit: 'g',
        sequence: 30, // 20 + 10
        company_id: 1,
        created_by: 'test-user-id'
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedDetail
      });
    });
    
    it('should return 400 if recipe ID is missing', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        raw_material_id: 201,
        quantity: 500,
        unit: 'g'
      };
      const res = mockResponse();
      
      // Act
      await recipeController.createRecipeDetail(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Recipe ID is required'
      });
    });
    
    it('should return 400 if both raw_material_id and semi_product_id are provided', async () => {
      // Arrange
      const req = mockRequest();
      req.body = {
        recipe_id: 1,
        raw_material_id: 201,
        semi_product_id: 301,
        quantity: 500,
        unit: 'g'
      };
      const res = mockResponse();
      
      // Act
      await recipeController.createRecipeDetail(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Either raw_material_id or semi_product_id must be provided, but not both'
      });
    });
  });
});