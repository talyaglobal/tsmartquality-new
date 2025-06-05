import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all group-role associations
export const getAllGroupInRoles = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('group_in_roles')
      .select(`
        *,
        group:group_id(id, name, description),
        role:role_id(id, name, description)
      `)
      .eq('status', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching group-role associations:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get group-role association by ID
export const getGroupInRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('group_in_roles')
      .select(`
        *,
        group:group_id(id, name, description),
        role:role_id(id, name, description)
      `)
      .eq('id', id)
      .eq('status', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Group-role association not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching group-role association:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Create a new group-role association
export const createGroupInRole = async (req: Request, res: Response) => {
  try {
    const { group_id, role_id } = req.body;
    
    // Check if the association already exists
    const { data: existingData, error: existingError } = await supabase
      .from('group_in_roles')
      .select('*')
      .eq('group_id', group_id)
      .eq('role_id', role_id)
      .eq('status', true)
      .limit(1);
      
    if (existingError) throw existingError;
    
    if (existingData && existingData.length > 0) {
      return res.status(409).json({ message: 'This group-role association already exists' });
    }
    
    // Add company data
    const groupInRoleData = {
      group_id,
      role_id,
      company_id: req.user?.companyId,
      status: true
    };
    
    const { data, error } = await supabase
      .from('group_in_roles')
      .insert(groupInRoleData)
      .select(`
        *,
        group:group_id(id, name, description),
        role:role_id(id, name, description)
      `)
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating group-role association:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update a group-role association
export const updateGroupInRole = async (req: Request, res: Response) => {
  try {
    const { id, group_id, role_id } = req.body;
    
    // Check if the association would be a duplicate after update
    if (group_id && role_id) {
      const { data: existingData, error: existingError } = await supabase
        .from('group_in_roles')
        .select('*')
        .eq('group_id', group_id)
        .eq('role_id', role_id)
        .eq('status', true)
        .neq('id', id)
        .limit(1);
        
      if (existingError) throw existingError;
      
      if (existingData && existingData.length > 0) {
        return res.status(409).json({ message: 'This group-role association already exists' });
      }
    }
    
    const { data, error } = await supabase
      .from('group_in_roles')
      .update({ group_id, role_id })
      .eq('id', id)
      .eq('status', true)
      .select(`
        *,
        group:group_id(id, name, description),
        role:role_id(id, name, description)
      `)
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating group-role association:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a group-role association (soft delete)
export const deleteGroupInRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Soft delete by setting status to false
    const { error } = await supabase
      .from('group_in_roles')
      .update({ 
        status: false,
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({ message: 'Group-role association deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting group-role association:', error);
    return res.status(500).json({ message: error.message });
  }
};