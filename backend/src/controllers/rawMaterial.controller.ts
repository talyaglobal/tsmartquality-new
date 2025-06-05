import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all raw materials
export const getAllRawMaterials = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('raw_materials')
      .select(`
        *,
        raw_material_group:raw_material_group_id(id, name, description)
      `)
      .eq('status', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching raw materials:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get raw material by ID
export const getRawMaterialById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('raw_materials')
      .select(`
        *,
        raw_material_group:raw_material_group_id(id, name, description)
      `)
      .eq('id', id)
      .eq('status', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Raw material not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching raw material:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Create a new raw material
export const createRawMaterial = async (req: Request, res: Response) => {
  try {
    const rawMaterialData = req.body;
    
    // Check if code is unique
    if (rawMaterialData.code) {
      const { data: existingMaterial, error: searchError } = await supabase
        .from('raw_materials')
        .select('id')
        .eq('code', rawMaterialData.code)
        .eq('status', true)
        .limit(1);
        
      if (searchError) throw searchError;
      
      if (existingMaterial && existingMaterial.length > 0) {
        return res.status(409).json({ message: `Raw material with code '${rawMaterialData.code}' already exists` });
      }
    }
    
    // Add user and company data
    rawMaterialData.created_by = req.user?.id;
    rawMaterialData.company_id = req.user?.companyId;
    rawMaterialData.status = true;
    
    const { data, error } = await supabase
      .from('raw_materials')
      .insert(rawMaterialData)
      .select(`
        *,
        raw_material_group:raw_material_group_id(id, name)
      `)
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating raw material:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update a raw material
export const updateRawMaterial = async (req: Request, res: Response) => {
  try {
    const rawMaterialData = req.body;
    const { id } = rawMaterialData;
    
    if (!id) {
      return res.status(400).json({ message: 'Raw material ID is required' });
    }
    
    // Check if code is unique (if changed)
    if (rawMaterialData.code) {
      const { data: currentMaterial, error: currentError } = await supabase
        .from('raw_materials')
        .select('code')
        .eq('id', id)
        .single();
        
      if (currentError) throw currentError;
      
      // Only check uniqueness if code is being changed
      if (currentMaterial.code !== rawMaterialData.code) {
        const { data: existingMaterial, error: searchError } = await supabase
          .from('raw_materials')
          .select('id')
          .eq('code', rawMaterialData.code)
          .eq('status', true)
          .neq('id', id)
          .limit(1);
          
        if (searchError) throw searchError;
        
        if (existingMaterial && existingMaterial.length > 0) {
          return res.status(409).json({ message: `Raw material with code '${rawMaterialData.code}' already exists` });
        }
      }
    }
    
    // Add user data for update
    rawMaterialData.updated_by = req.user?.id;
    rawMaterialData.updated_at = new Date();
    
    const { data, error } = await supabase
      .from('raw_materials')
      .update(rawMaterialData)
      .eq('id', id)
      .eq('status', true)
      .select(`
        *,
        raw_material_group:raw_material_group_id(id, name)
      `)
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating raw material:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a raw material (soft delete)
export const deleteRawMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if raw material is used in any recipes
    const { data: recipes, error: recipesError } = await supabase
      .from('recipe_details')
      .select('id')
      .eq('raw_material_id', id)
      .eq('status', true)
      .limit(1);
      
    if (recipesError) throw recipesError;
    
    if (recipes && recipes.length > 0) {
      return res.status(400).json({ message: 'Cannot delete raw material: it is used in one or more recipes' });
    }
    
    // Soft delete by setting status to false
    const { error } = await supabase
      .from('raw_materials')
      .update({ 
        status: false,
        updated_by: req.user?.id,
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({ message: 'Raw material deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting raw material:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get raw materials with filter and pagination
export const getFilteredRawMaterials = async (req: Request, res: Response) => {
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
      .from('raw_materials')
      .select(`
        *,
        raw_material_group:raw_material_group_id(id, name, description)
      `, { count: 'exact' })
      .eq('status', true);
    
    // Apply filters
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }
    
    if (groupId) {
      query = query.eq('raw_material_group_id', groupId);
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
    console.error('Error fetching filtered raw materials:', error);
    return res.status(500).json({ message: error.message });
  }
};