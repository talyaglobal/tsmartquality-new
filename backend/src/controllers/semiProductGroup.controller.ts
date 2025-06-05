import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all semi-product groups
export const getAllSemiProductGroups = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('semi_product_groups')
      .select('*')
      .eq('status', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching semi-product groups:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get semi-product group by ID
export const getSemiProductGroupById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('semi_product_groups')
      .select('*')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Semi-product group not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching semi-product group:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Create a new semi-product group
export const createSemiProductGroup = async (req: Request, res: Response) => {
  try {
    const groupData = req.body;
    
    // Check if group name is unique in company
    const { data: existingGroups, error: searchError } = await supabase
      .from('semi_product_groups')
      .select('id')
      .eq('name', groupData.name)
      .eq('company_id', req.user?.companyId)
      .eq('status', true)
      .limit(1);
    
    if (searchError) throw searchError;
    
    if (existingGroups && existingGroups.length > 0) {
      return res.status(409).json({ message: `Semi-product group with name '${groupData.name}' already exists` });
    }
    
    // Add user and company data
    groupData.created_by = req.user?.id;
    groupData.company_id = req.user?.companyId;
    groupData.status = true;
    
    const { data, error } = await supabase
      .from('semi_product_groups')
      .insert(groupData)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating semi-product group:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update a semi-product group
export const updateSemiProductGroup = async (req: Request, res: Response) => {
  try {
    const groupData = req.body;
    const { id } = groupData;
    
    if (!id) {
      return res.status(400).json({ message: 'Semi-product group ID is required' });
    }
    
    // Check if group name is unique (if changed)
    if (groupData.name) {
      const { data: currentGroup, error: currentError } = await supabase
        .from('semi_product_groups')
        .select('name')
        .eq('id', id)
        .single();
        
      if (currentError) throw currentError;
      
      // Only check uniqueness if name is being changed
      if (currentGroup.name !== groupData.name) {
        const { data: existingGroups, error: searchError } = await supabase
          .from('semi_product_groups')
          .select('id')
          .eq('name', groupData.name)
          .eq('company_id', req.user?.companyId)
          .eq('status', true)
          .neq('id', id)
          .limit(1);
          
        if (searchError) throw searchError;
        
        if (existingGroups && existingGroups.length > 0) {
          return res.status(409).json({ message: `Semi-product group with name '${groupData.name}' already exists` });
        }
      }
    }
    
    // Add user data for update
    groupData.updated_by = req.user?.id;
    groupData.updated_at = new Date();
    
    const { data, error } = await supabase
      .from('semi_product_groups')
      .update(groupData)
      .eq('id', id)
      .eq('status', true)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating semi-product group:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a semi-product group (soft delete)
export const deleteSemiProductGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if semi-product group is used by any semi-products
    const { data: products, error: productsError } = await supabase
      .from('semi_products')
      .select('id')
      .eq('semi_product_group_id', id)
      .eq('status', true)
      .limit(1);
      
    if (productsError) throw productsError;
    
    if (products && products.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete group: it is used by one or more semi-products. Reassign these products first.' 
      });
    }
    
    // Soft delete by setting status to false
    const { error } = await supabase
      .from('semi_product_groups')
      .update({ 
        status: false,
        updated_by: req.user?.id,
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({ message: 'Semi-product group deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting semi-product group:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get semi-product group with associated semi-products
export const getSemiProductGroupWithProducts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get the group
    const { data: group, error: groupError } = await supabase
      .from('semi_product_groups')
      .select('*')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (groupError) {
      if (groupError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Semi-product group not found' });
      }
      throw groupError;
    }
    
    // Get semi-products in this group
    const { data: products, error: productsError } = await supabase
      .from('semi_products')
      .select('*')
      .eq('semi_product_group_id', id)
      .eq('status', true)
      .order('name');

    if (productsError) throw productsError;
    
    // Format the response
    const groupWithProducts = {
      ...group,
      products: products || []
    };

    return res.status(200).json(groupWithProducts);
  } catch (error: any) {
    console.error('Error fetching semi-product group with products:', error);
    return res.status(500).json({ message: error.message });
  }
};