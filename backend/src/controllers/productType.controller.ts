import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

/**
 * Get all product types
 */
export const getAllProductTypes = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('product_types')
      .select('*')
      .eq('status', true)
      .order('name');

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching product types:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Get product type by ID
 */
export const getProductTypeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('product_types')
      .select('*')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ message: 'Product type not found' });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching product type:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Create a new product type
 */
export const createProductType = async (req: Request, res: Response) => {
  try {
    const { name, product_group_id, company_id } = req.body;
    const user = req.user;

    const { data, error } = await supabase
      .from('product_types')
      .insert([
        { 
          name, 
          product_group_id, 
          company_id: company_id || user?.companyId,
          created_by: user?.id,
          updated_by: user?.id,
          status: true
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating product type:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Update a product type
 */
export const updateProductType = async (req: Request, res: Response) => {
  try {
    const { id, name, product_group_id, company_id } = req.body;
    const user = req.user;

    // Check if product type exists
    const { data: existingData, error: existingError } = await supabase
      .from('product_types')
      .select('*')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (existingError || !existingData) {
      return res.status(404).json({ message: 'Product type not found' });
    }

    const { data, error } = await supabase
      .from('product_types')
      .update({ 
        name, 
        product_group_id, 
        company_id: company_id || existingData.company_id,
        updated_by: user?.id,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating product type:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Delete a product type (soft delete)
 */
export const deleteProductType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Check if product type exists
    const { data: existingData, error: existingError } = await supabase
      .from('product_types')
      .select('*')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (existingError || !existingData) {
      return res.status(404).json({ message: 'Product type not found' });
    }

    // Check if product type is in use
    const { data: usageData, error: usageError } = await supabase
      .from('products')
      .select('id')
      .eq('product_type_id', id)
      .eq('status', true);

    if (usageError) throw usageError;

    if (usageData && usageData.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete product type that is in use by products' 
      });
    }

    const { error } = await supabase
      .from('product_types')
      .update({ 
        status: false,
        updated_by: user?.id,
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({ message: 'Product type deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product type:', error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Get product types by product group ID
 */
export const getProductTypesByProductGroup = async (req: Request, res: Response) => {
  try {
    const { productGroupId } = req.params;
    
    const { data, error } = await supabase
      .from('product_types')
      .select('*')
      .eq('product_group_id', productGroupId)
      .eq('status', true)
      .order('name');

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching product types by product group:', error);
    return res.status(500).json({ message: error.message });
  }
};
