import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

/**
 * Get all recipes
 */
export const getAllRecipes = async (req: Request, res: Response) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const { data, error, count } = await supabase
      .from('recipes')
      .select('*', { count: 'exact' })
      .eq('company_id', req.user.company_id)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(200).json({
      success: true,
      data,
      count,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get all recipes with their details
 */
export const getAllRecipesWithDetails = async (req: Request, res: Response) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    // Get recipes with count
    const { data: recipes, error: recipesError, count } = await supabase
      .from('recipes')
      .select('*', { count: 'exact' })
      .eq('company_id', req.user.company_id)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
    
    if (recipesError) {
      return res.status(400).json({ success: false, error: recipesError.message });
    }
    
    if (!recipes || recipes.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        limit: Number(limit),
        offset: Number(offset)
      });
    }
    
    // Get recipe IDs
    const recipeIds = recipes.map(recipe => recipe.id);
    
    // Get recipe details for these recipes
    const { data: recipeDetails, error: detailsError } = await supabase
      .from('recipe_details')
      .select(`
        *,
        raw_materials(*),
        semi_products(*)
      `)
      .eq('company_id', req.user.company_id)
      .in('recipe_id', recipeIds);
    
    if (detailsError) {
      return res.status(400).json({ success: false, error: detailsError.message });
    }
    
    // Get product and semi-product information for recipes
    const { data: productsInfo, error: productsError } = await supabase
      .from('products')
      .select('id, name, code')
      .eq('company_id', req.user.company_id)
      .in('id', recipes.filter(r => r.product_id).map(r => r.product_id));
    
    const { data: semiProductsInfo, error: semiProductsError } = await supabase
      .from('semi_products')
      .select('id, name, code')
      .eq('company_id', req.user.company_id)
      .in('id', recipes.filter(r => r.semi_product_id).map(r => r.semi_product_id));
    
    if (productsError || semiProductsError) {
      return res.status(400).json({ 
        success: false, 
        error: productsError?.message || semiProductsError?.message 
      });
    }
    
    // Map products and semi-products to lookup objects
    const productsMap = (productsInfo || []).reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
    
    const semiProductsMap = (semiProductsInfo || []).reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
    
    // Group recipe details by recipe_id
    const detailsByRecipeId = (recipeDetails || []).reduce((acc, curr) => {
      if (!acc[curr.recipe_id]) {
        acc[curr.recipe_id] = [];
      }
      acc[curr.recipe_id].push(curr);
      return acc;
    }, {});
    
    // Combine recipes with their details and related information
    const recipesWithDetails = recipes.map(recipe => ({
      ...recipe,
      product: recipe.product_id ? productsMap[recipe.product_id] : null,
      semi_product: recipe.semi_product_id ? semiProductsMap[recipe.semi_product_id] : null,
      recipe_details: detailsByRecipeId[recipe.id] || []
    }));
    
    return res.status(200).json({
      success: true,
      data: recipesWithDetails,
      count,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get a recipe with its details by ID
 */
export const getRecipeWithDetails = async (req: Request, res: Response) => {
  try {
    const { recipeId } = req.params;
    
    // Get the recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', recipeId)
      .eq('company_id', req.user.company_id)
      .single();
    
    if (recipeError) {
      return res.status(404).json({ success: false, error: 'Recipe not found' });
    }
    
    // Get recipe details
    const { data: recipeDetails, error: detailsError } = await supabase
      .from('recipe_details')
      .select(`
        *,
        raw_materials(*),
        semi_products(*)
      `)
      .eq('recipe_id', recipeId)
      .eq('company_id', req.user.company_id);
    
    if (detailsError) {
      return res.status(400).json({ success: false, error: detailsError.message });
    }
    
    // Get product or semi-product information if associated
    let product = null;
    let semiProduct = null;
    
    if (recipe.product_id) {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id, name, code')
        .eq('id', recipe.product_id)
        .eq('company_id', req.user.company_id)
        .single();
      
      if (!productError) {
        product = productData;
      }
    }
    
    if (recipe.semi_product_id) {
      const { data: semiProductData, error: semiProductError } = await supabase
        .from('semi_products')
        .select('id, name, code')
        .eq('id', recipe.semi_product_id)
        .eq('company_id', req.user.company_id)
        .single();
      
      if (!semiProductError) {
        semiProduct = semiProductData;
      }
    }
    
    // Combine recipe with its details and related information
    const recipeWithDetails = {
      ...recipe,
      product,
      semi_product: semiProduct,
      recipe_details: recipeDetails || []
    };
    
    return res.status(200).json({
      success: true,
      data: recipeWithDetails
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get a recipe by ID
 */
export const getRecipeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .eq('company_id', req.user.company_id)
      .single();
    
    if (error) {
      return res.status(404).json({ success: false, error: 'Recipe not found' });
    }
    
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create a new recipe
 */
export const createRecipe = async (req: Request, res: Response) => {
  try {
    const { 
      code, 
      name, 
      description, 
      product_id, 
      semi_product_id,
      total_quantity 
    } = req.body;
    
    // Check that either product_id or semi_product_id is provided, but not both
    if ((product_id && semi_product_id) || (!product_id && !semi_product_id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Either product_id or semi_product_id must be provided, but not both' 
      });
    }
    
    // Create the recipe
    const { data, error } = await supabase
      .from('recipes')
      .insert({
        code,
        name,
        description,
        product_id: product_id || null,
        semi_product_id: semi_product_id || null,
        total_quantity,
        company_id: req.user.company_id,
        created_by: req.user.id
      })
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update a recipe
 */
export const updateRecipe = async (req: Request, res: Response) => {
  try {
    const { 
      id,
      code, 
      name, 
      description, 
      product_id, 
      semi_product_id,
      total_quantity,
      status 
    } = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, error: 'Recipe ID is required' });
    }
    
    // Check that either product_id or semi_product_id is provided, but not both
    if (product_id && semi_product_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Only one of product_id or semi_product_id can be provided' 
      });
    }
    
    // Check if the recipe exists and belongs to the company
    const { data: existingRecipe, error: checkError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .eq('company_id', req.user.company_id)
      .single();
    
    if (checkError) {
      return res.status(404).json({ success: false, error: 'Recipe not found' });
    }
    
    // Update the recipe
    const { data, error } = await supabase
      .from('recipes')
      .update({
        code: code || existingRecipe.code,
        name: name || existingRecipe.name,
        description: description !== undefined ? description : existingRecipe.description,
        product_id: product_id !== undefined ? product_id : existingRecipe.product_id,
        semi_product_id: semi_product_id !== undefined ? semi_product_id : existingRecipe.semi_product_id,
        total_quantity: total_quantity !== undefined ? total_quantity : existingRecipe.total_quantity,
        status: status !== undefined ? status : existingRecipe.status,
        updated_at: new Date(),
        updated_by: req.user.id
      })
      .eq('id', id)
      .eq('company_id', req.user.company_id)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete a recipe
 */
export const deleteRecipe = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if recipe has associated recipe details
    const { data: recipeDetails, error: detailsError } = await supabase
      .from('recipe_details')
      .select('id')
      .eq('recipe_id', id)
      .eq('company_id', req.user.company_id)
      .limit(1);
    
    if (detailsError) {
      return res.status(400).json({ success: false, error: detailsError.message });
    }
    
    // If recipe has details, delete them first
    if (recipeDetails && recipeDetails.length > 0) {
      const { error: deleteDetailsError } = await supabase
        .from('recipe_details')
        .delete()
        .eq('recipe_id', id)
        .eq('company_id', req.user.company_id);
      
      if (deleteDetailsError) {
        return res.status(400).json({ success: false, error: deleteDetailsError.message });
      }
    }
    
    // Delete the recipe
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
      .eq('company_id', req.user.company_id);
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(200).json({ success: true, message: 'Recipe deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get all recipe details for a recipe
 */
export const getRecipeDetails = async (req: Request, res: Response) => {
  try {
    const { recipeId } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    
    // Check if the recipe exists and belongs to the company
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', recipeId)
      .eq('company_id', req.user.company_id)
      .single();
    
    if (recipeError) {
      return res.status(404).json({ success: false, error: 'Recipe not found' });
    }
    
    // Get recipe details
    const { data, error, count } = await supabase
      .from('recipe_details')
      .select(`
        *,
        raw_materials(*),
        semi_products(*)
      `, { count: 'exact' })
      .eq('recipe_id', recipeId)
      .eq('company_id', req.user.company_id)
      .order('sequence', { ascending: true })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(200).json({
      success: true,
      data,
      count,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get a recipe detail by ID
 */
export const getRecipeDetailById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('recipe_details')
      .select(`
        *,
        raw_materials(*),
        semi_products(*)
      `)
      .eq('id', id)
      .eq('company_id', req.user.company_id)
      .single();
    
    if (error) {
      return res.status(404).json({ success: false, error: 'Recipe detail not found' });
    }
    
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create a new recipe detail
 */
export const createRecipeDetail = async (req: Request, res: Response) => {
  try {
    const { 
      recipe_id, 
      raw_material_id, 
      semi_product_id, 
      quantity, 
      unit,
      sequence
    } = req.body;
    
    // Check that recipe_id is provided
    if (!recipe_id) {
      return res.status(400).json({ success: false, error: 'Recipe ID is required' });
    }
    
    // Check that either raw_material_id or semi_product_id is provided, but not both
    if ((raw_material_id && semi_product_id) || (!raw_material_id && !semi_product_id)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Either raw_material_id or semi_product_id must be provided, but not both' 
      });
    }
    
    // Check if the recipe exists and belongs to the company
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', recipe_id)
      .eq('company_id', req.user.company_id)
      .single();
    
    if (recipeError) {
      return res.status(404).json({ success: false, error: 'Recipe not found' });
    }
    
    // If raw_material_id is provided, check if it exists and belongs to the company
    if (raw_material_id) {
      const { data: rawMaterial, error: rawMaterialError } = await supabase
        .from('raw_materials')
        .select('id')
        .eq('id', raw_material_id)
        .eq('company_id', req.user.company_id)
        .single();
      
      if (rawMaterialError) {
        return res.status(404).json({ success: false, error: 'Raw material not found' });
      }
    }
    
    // If semi_product_id is provided, check if it exists and belongs to the company
    if (semi_product_id) {
      const { data: semiProduct, error: semiProductError } = await supabase
        .from('semi_products')
        .select('id')
        .eq('id', semi_product_id)
        .eq('company_id', req.user.company_id)
        .single();
      
      if (semiProductError) {
        return res.status(404).json({ success: false, error: 'Semi product not found' });
      }
    }
    
    // Get the max sequence number for this recipe if sequence is not provided
    let nextSequence = sequence;
    if (nextSequence === undefined) {
      const { data: maxSequence } = await supabase
        .from('recipe_details')
        .select('sequence')
        .eq('recipe_id', recipe_id)
        .eq('company_id', req.user.company_id)
        .order('sequence', { ascending: false })
        .limit(1);
      
      nextSequence = maxSequence && maxSequence.length > 0 ? maxSequence[0].sequence + 10 : 10;
    }
    
    // Create the recipe detail
    const { data, error } = await supabase
      .from('recipe_details')
      .insert({
        recipe_id,
        raw_material_id: raw_material_id || null,
        semi_product_id: semi_product_id || null,
        quantity,
        unit,
        sequence: nextSequence,
        company_id: req.user.company_id,
        created_by: req.user.id
      })
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update a recipe detail
 */
export const updateRecipeDetail = async (req: Request, res: Response) => {
  try {
    const { 
      id,
      recipe_id, 
      raw_material_id, 
      semi_product_id, 
      quantity, 
      unit,
      sequence,
      status
    } = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, error: 'Recipe detail ID is required' });
    }
    
    // Check that recipe_id is provided
    if (!recipe_id) {
      return res.status(400).json({ success: false, error: 'Recipe ID is required' });
    }
    
    // Check that either raw_material_id or semi_product_id is provided, but not both
    if (raw_material_id && semi_product_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Only one of raw_material_id or semi_product_id can be provided' 
      });
    }
    
    // Check if the recipe detail exists and belongs to the company
    const { data: existingDetail, error: checkError } = await supabase
      .from('recipe_details')
      .select('*')
      .eq('id', id)
      .eq('company_id', req.user.company_id)
      .single();
    
    if (checkError) {
      return res.status(404).json({ success: false, error: 'Recipe detail not found' });
    }
    
    // Check if the recipe exists and belongs to the company
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', recipe_id)
      .eq('company_id', req.user.company_id)
      .single();
    
    if (recipeError) {
      return res.status(404).json({ success: false, error: 'Recipe not found' });
    }
    
    // If raw_material_id is provided, check if it exists and belongs to the company
    if (raw_material_id) {
      const { data: rawMaterial, error: rawMaterialError } = await supabase
        .from('raw_materials')
        .select('id')
        .eq('id', raw_material_id)
        .eq('company_id', req.user.company_id)
        .single();
      
      if (rawMaterialError) {
        return res.status(404).json({ success: false, error: 'Raw material not found' });
      }
    }
    
    // If semi_product_id is provided, check if it exists and belongs to the company
    if (semi_product_id) {
      const { data: semiProduct, error: semiProductError } = await supabase
        .from('semi_products')
        .select('id')
        .eq('id', semi_product_id)
        .eq('company_id', req.user.company_id)
        .single();
      
      if (semiProductError) {
        return res.status(404).json({ success: false, error: 'Semi product not found' });
      }
    }
    
    // Update the recipe detail
    const { data, error } = await supabase
      .from('recipe_details')
      .update({
        recipe_id,
        raw_material_id: raw_material_id !== undefined ? raw_material_id : existingDetail.raw_material_id,
        semi_product_id: semi_product_id !== undefined ? semi_product_id : existingDetail.semi_product_id,
        quantity: quantity !== undefined ? quantity : existingDetail.quantity,
        unit: unit !== undefined ? unit : existingDetail.unit,
        sequence: sequence !== undefined ? sequence : existingDetail.sequence,
        status: status !== undefined ? status : existingDetail.status,
        updated_at: new Date(),
        updated_by: req.user.id
      })
      .eq('id', id)
      .eq('company_id', req.user.company_id)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete a recipe detail
 */
export const deleteRecipeDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('recipe_details')
      .delete()
      .eq('id', id)
      .eq('company_id', req.user.company_id);
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(200).json({ success: true, message: 'Recipe detail deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};