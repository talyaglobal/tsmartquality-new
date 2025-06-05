import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all semi-products
export const getAllSemiProducts = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('semi_products')
      .select(`
        *,
        semi_product_group:semi_product_group_id(id, name, description)
      `)
      .eq('status', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching semi-products:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get semi-product by ID
export const getSemiProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('semi_products')
      .select(`
        *,
        semi_product_group:semi_product_group_id(id, name, description)
      `)
      .eq('id', id)
      .eq('status', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Semi-product not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching semi-product:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get semi-product with full details
export const getSemiProductWithDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get the semi-product basic information
    const { data: semiProduct, error: productError } = await supabase
      .from('semi_products')
      .select(`
        *,
        semi_product_group:semi_product_group_id(id, name, description)
      `)
      .eq('id', id)
      .eq('status', true)
      .single();

    if (productError) {
      if (productError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Semi-product not found' });
      }
      throw productError;
    }
    
    // Get recipes where this semi-product is the output
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select(`
        id, name, code, description,
        recipe_details(
          id, quantity, unit, sequence,
          raw_material:raw_material_id(id, name, code),
          semi_product:semi_product_id(id, name, code)
        )
      `)
      .eq('semi_product_id', id)
      .eq('status', true);
      
    if (recipesError) throw recipesError;
    
    // Get recipes where this semi-product is used as an ingredient
    const { data: usedInRecipes, error: usedInError } = await supabase
      .from('recipe_details')
      .select(`
        id, quantity, unit, sequence,
        recipe:recipe_id(id, name, code, description)
      `)
      .eq('semi_product_id', id)
      .eq('status', true);
      
    if (usedInError) throw usedInError;
    
    // Format the response with all details
    const response = {
      ...semiProduct,
      recipes: recipes || [],
      used_in_recipes: usedInRecipes || []
    };

    return res.status(200).json(response);
  } catch (error: any) {
    console.error('Error fetching semi-product with details:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Create a new semi-product
export const createSemiProduct = async (req: Request, res: Response) => {
  try {
    const semiProductData = req.body;
    
    // Check if code is unique
    if (semiProductData.code) {
      const { data: existingProduct, error: searchError } = await supabase
        .from('semi_products')
        .select('id')
        .eq('code', semiProductData.code)
        .eq('status', true)
        .limit(1);
        
      if (searchError) throw searchError;
      
      if (existingProduct && existingProduct.length > 0) {
        return res.status(409).json({ message: `Semi-product with code '${semiProductData.code}' already exists` });
      }
    }
    
    // Add user and company data
    semiProductData.created_by = req.user?.id;
    semiProductData.company_id = req.user?.companyId;
    semiProductData.status = true;
    
    const { data, error } = await supabase
      .from('semi_products')
      .insert(semiProductData)
      .select(`
        *,
        semi_product_group:semi_product_group_id(id, name)
      `)
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating semi-product:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update a semi-product
export const updateSemiProduct = async (req: Request, res: Response) => {
  try {
    const semiProductData = req.body;
    const { id } = semiProductData;
    
    if (!id) {
      return res.status(400).json({ message: 'Semi-product ID is required' });
    }
    
    // Check if code is unique (if changed)
    if (semiProductData.code) {
      const { data: currentProduct, error: currentError } = await supabase
        .from('semi_products')
        .select('code')
        .eq('id', id)
        .single();
        
      if (currentError) throw currentError;
      
      // Only check uniqueness if code is being changed
      if (currentProduct.code !== semiProductData.code) {
        const { data: existingProduct, error: searchError } = await supabase
          .from('semi_products')
          .select('id')
          .eq('code', semiProductData.code)
          .eq('status', true)
          .neq('id', id)
          .limit(1);
          
        if (searchError) throw searchError;
        
        if (existingProduct && existingProduct.length > 0) {
          return res.status(409).json({ message: `Semi-product with code '${semiProductData.code}' already exists` });
        }
      }
    }
    
    // Add user data for update
    semiProductData.updated_by = req.user?.id;
    semiProductData.updated_at = new Date();
    
    const { data, error } = await supabase
      .from('semi_products')
      .update(semiProductData)
      .eq('id', id)
      .eq('status', true)
      .select(`
        *,
        semi_product_group:semi_product_group_id(id, name)
      `)
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating semi-product:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a semi-product (soft delete)
export const deleteSemiProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if semi-product is used as an output in any recipes
    const { data: outputRecipes, error: outputError } = await supabase
      .from('recipes')
      .select('id')
      .eq('semi_product_id', id)
      .eq('status', true)
      .limit(1);
      
    if (outputError) throw outputError;
    
    if (outputRecipes && outputRecipes.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete semi-product: it is an output in one or more recipes' 
      });
    }
    
    // Check if semi-product is used as an ingredient in any recipes
    const { data: ingredientRecipes, error: ingredientError } = await supabase
      .from('recipe_details')
      .select('id')
      .eq('semi_product_id', id)
      .eq('status', true)
      .limit(1);
      
    if (ingredientError) throw ingredientError;
    
    if (ingredientRecipes && ingredientRecipes.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete semi-product: it is used as an ingredient in one or more recipes' 
      });
    }
    
    // Soft delete by setting status to false
    const { error } = await supabase
      .from('semi_products')
      .update({ 
        status: false,
        updated_by: req.user?.id,
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({ message: 'Semi-product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting semi-product:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get semi-products with filter and pagination
export const getFilteredSemiProducts = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const { 
      searchTerm,
      groupId,
      stockTracking,
      bbdTracking,
      lotTracking
    } = req.query;
    
    let query = supabase
      .from('semi_products')
      .select(`
        *,
        semi_product_group:semi_product_group_id(id, name, description)
      `, { count: 'exact' })
      .eq('status', true);
    
    // Apply filters
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }
    
    if (groupId) {
      query = query.eq('semi_product_group_id', groupId);
    }
    
    if (stockTracking !== undefined) {
      query = query.eq('stock_tracking', stockTracking === 'true');
    }
    
    if (bbdTracking !== undefined) {
      query = query.eq('bbd_tracking', bbdTracking === 'true');
    }
    
    if (lotTracking !== undefined) {
      query = query.eq('lot_tracking', lotTracking === 'true');
    }
    
    // Apply pagination
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return res.status(200).json({
      items: data,
      totalCount: count || 0,
      offset,
      limit
    });
  } catch (error: any) {
    console.error('Error fetching filtered semi-products:', error);
    return res.status(500).json({ message: error.message });
  }
};