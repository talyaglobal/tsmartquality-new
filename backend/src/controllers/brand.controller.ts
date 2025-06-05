import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all brands
export const getAllBrands = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('status', true)
      .order('name');

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching brands:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get brand by ID
export const getBrandById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Brand not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching brand:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Create a new brand
export const createBrand = async (req: Request, res: Response) => {
  try {
    const brandData = req.body;
    
    // Add user data
    brandData.created_by = req.user?.id;
    brandData.status = true;
    
    const { data, error } = await supabase
      .from('brands')
      .insert(brandData)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating brand:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update a brand
export const updateBrand = async (req: Request, res: Response) => {
  try {
    const brandData = req.body;
    
    // Add user data for update
    brandData.updated_by = req.user?.id;
    brandData.updated_at = new Date();
    
    const { data, error } = await supabase
      .from('brands')
      .update(brandData)
      .eq('id', brandData.id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating brand:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a brand (soft delete)
export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if brand is used by products
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', id)
      .eq('status', true);
      
    if (countError) throw countError;
    
    if (count && count > 0) {
      return res.status(400).json({ 
        message: `Cannot delete brand: it is used by ${count} products`
      });
    }
    
    // Soft delete by setting status to false
    const { data, error } = await supabase
      .from('brands')
      .update({ 
        status: false,
        updated_by: req.user?.id,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ message: 'Brand deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting brand:', error);
    return res.status(500).json({ message: error.message });
  }
};