import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all product history records
export const getAllProductHistory = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('product_history')
      .select(`
        *,
        product:product_id(id, name, code),
        created_by_user:created_by(id, email, full_name)
      `)
      .eq('status', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching product history:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get product history record by ID
export const getProductHistoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('product_history')
      .select(`
        *,
        product:product_id(id, name, code),
        created_by_user:created_by(id, email, full_name)
      `)
      .eq('id', id)
      .eq('status', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Product history record not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching product history record:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get product history for a specific product
export const getProductHistoryByProductId = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    
    const { data, error } = await supabase
      .from('product_history')
      .select(`
        *,
        created_by_user:created_by(id, email, full_name)
      `)
      .eq('product_id', productId)
      .eq('status', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching product history for product:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get paginated product history
export const getPaginatedProductHistory = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.params.limit) || 10;
    const offset = parseInt(req.params.offset) || 0;
    
    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('product_history')
      .select('*', { count: 'exact', head: true })
      .eq('status', true);
      
    if (countError) throw countError;
    
    // Get paginated data
    const { data, error } = await supabase
      .from('product_history')
      .select(`
        *,
        product:product_id(id, name, code),
        created_by_user:created_by(id, email, full_name)
      `)
      .eq('status', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return res.status(200).json({
      totalCount,
      items: data,
      offset,
      limit
    });
  } catch (error: any) {
    console.error('Error fetching paginated product history:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Create product history record
// Note: This is typically called from other controllers, not directly from API routes
export const createProductHistory = async (productId: number, changeDescription: string, oldValue: string | null, newValue: string | null, userId: string, companyId: number) => {
  try {
    const historyData = {
      product_id: productId,
      change_description: changeDescription,
      old_value: oldValue,
      new_value: newValue,
      created_by: userId,
      company_id: companyId,
      status: true
    };
    
    const { data, error } = await supabase
      .from('product_history')
      .insert(historyData)
      .select();

    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error creating product history record:', error);
    throw error;
  }
};

// Delete product history record (soft delete)
export const deleteProductHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Soft delete by setting status to false
    const { error } = await supabase
      .from('product_history')
      .update({ 
        status: false,
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({ message: 'Product history record deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product history record:', error);
    return res.status(500).json({ message: error.message });
  }
};