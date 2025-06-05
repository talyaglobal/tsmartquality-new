import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all raw material groups
export const getAllRawMaterialGroups = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('raw_material_groups')
      .select('*')
      .eq('status', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching raw material groups:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get raw material group by ID
export const getRawMaterialGroupById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('raw_material_groups')
      .select('*')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Raw material group not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching raw material group:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Create a new raw material group
export const createRawMaterialGroup = async (req: Request, res: Response) => {
  try {
    const groupData = req.body;
    
    // Check if group name is unique in company
    const { data: existingGroups, error: searchError } = await supabase
      .from('raw_material_groups')
      .select('id')
      .eq('name', groupData.name)
      .eq('company_id', req.user?.companyId)
      .eq('status', true)
      .limit(1);
    
    if (searchError) throw searchError;
    
    if (existingGroups && existingGroups.length > 0) {
      return res.status(409).json({ message: `Raw material group with name '${groupData.name}' already exists` });
    }
    
    // Add user and company data
    groupData.created_by = req.user?.id;
    groupData.company_id = req.user?.companyId;
    groupData.status = true;
    
    const { data, error } = await supabase
      .from('raw_material_groups')
      .insert(groupData)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating raw material group:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update a raw material group
export const updateRawMaterialGroup = async (req: Request, res: Response) => {
  try {
    const groupData = req.body;
    const { id } = groupData;
    
    if (!id) {
      return res.status(400).json({ message: 'Raw material group ID is required' });
    }
    
    // Check if group name is unique (if changed)
    if (groupData.name) {
      const { data: currentGroup, error: currentError } = await supabase
        .from('raw_material_groups')
        .select('name')
        .eq('id', id)
        .single();
        
      if (currentError) throw currentError;
      
      // Only check uniqueness if name is being changed
      if (currentGroup.name !== groupData.name) {
        const { data: existingGroups, error: searchError } = await supabase
          .from('raw_material_groups')
          .select('id')
          .eq('name', groupData.name)
          .eq('company_id', req.user?.companyId)
          .eq('status', true)
          .neq('id', id)
          .limit(1);
          
        if (searchError) throw searchError;
        
        if (existingGroups && existingGroups.length > 0) {
          return res.status(409).json({ message: `Raw material group with name '${groupData.name}' already exists` });
        }
      }
    }
    
    // Add user data for update
    groupData.updated_by = req.user?.id;
    groupData.updated_at = new Date();
    
    const { data, error } = await supabase
      .from('raw_material_groups')
      .update(groupData)
      .eq('id', id)
      .eq('status', true)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating raw material group:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a raw material group (soft delete)
export const deleteRawMaterialGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if raw material group is used by any raw materials
    const { data: materials, error: materialsError } = await supabase
      .from('raw_materials')
      .select('id')
      .eq('raw_material_group_id', id)
      .eq('status', true)
      .limit(1);
      
    if (materialsError) throw materialsError;
    
    if (materials && materials.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete group: it is used by one or more raw materials. Reassign these materials first.' 
      });
    }
    
    // Soft delete by setting status to false
    const { error } = await supabase
      .from('raw_material_groups')
      .update({ 
        status: false,
        updated_by: req.user?.id,
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({ message: 'Raw material group deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting raw material group:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get raw material group with associated raw materials
export const getRawMaterialGroupWithMaterials = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get the group
    const { data: group, error: groupError } = await supabase
      .from('raw_material_groups')
      .select('*')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (groupError) {
      if (groupError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Raw material group not found' });
      }
      throw groupError;
    }
    
    // Get raw materials in this group
    const { data: materials, error: materialsError } = await supabase
      .from('raw_materials')
      .select('*')
      .eq('raw_material_group_id', id)
      .eq('status', true)
      .order('name');

    if (materialsError) throw materialsError;
    
    // Format the response
    const groupWithMaterials = {
      ...group,
      materials: materials || []
    };

    return res.status(200).json(groupWithMaterials);
  } catch (error: any) {
    console.error('Error fetching raw material group with materials:', error);
    return res.status(500).json({ message: error.message });
  }
};