import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// Get all groups
export const getAllGroups = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('status', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching groups:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get group by ID
export const getGroupById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Group not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching group:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Create a new group
export const createGroup = async (req: Request, res: Response) => {
  try {
    const groupData = req.body;
    
    // Add user and company data
    groupData.company_id = req.user?.companyId;
    groupData.status = true;
    
    const { data, error } = await supabase
      .from('groups')
      .insert(groupData)
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating group:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update a group
export const updateGroup = async (req: Request, res: Response) => {
  try {
    const groupData = req.body;
    
    const { data, error } = await supabase
      .from('groups')
      .update(groupData)
      .eq('id', groupData.id)
      .eq('status', true)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error updating group:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete a group (soft delete)
export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // First check if the group is in use
    const { data: userInGroups, error: userInGroupsError } = await supabase
      .from('user_in_groups')
      .select('id')
      .eq('group_id', id)
      .eq('status', true)
      .limit(1);

    if (userInGroupsError) throw userInGroupsError;

    if (userInGroups && userInGroups.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete group: it is associated with users. Remove these associations first.'
      });
    }

    // Also check if the group is used in role assignments
    const { data: groupInRoles, error: groupInRolesError } = await supabase
      .from('group_in_roles')
      .select('id')
      .eq('group_id', id)
      .eq('status', true)
      .limit(1);

    if (groupInRolesError) throw groupInRolesError;

    if (groupInRoles && groupInRoles.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete group: it is associated with roles. Remove these associations first.'
      });
    }
    
    // Soft delete by setting status to false
    const { error } = await supabase
      .from('groups')
      .update({ 
        status: false,
        updated_at: new Date()
      })
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({ message: 'Group deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting group:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get groups with associated users and roles
export const getGroupWithDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get the group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('*')
      .eq('id', id)
      .eq('status', true)
      .single();

    if (groupError) {
      if (groupError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Group not found' });
      }
      throw groupError;
    }
    
    // Get users in this group
    const { data: userInGroups, error: userError } = await supabase
      .from('user_in_groups')
      .select(`
        id,
        user:user_id(id, email, full_name)
      `)
      .eq('group_id', id)
      .eq('status', true);

    if (userError) throw userError;
    
    // Get roles for this group
    const { data: groupInRoles, error: roleError } = await supabase
      .from('group_in_roles')
      .select(`
        id,
        role:role_id(id, name, description)
      `)
      .eq('group_id', id)
      .eq('status', true);

    if (roleError) throw roleError;
    
    // Format the response
    const groupWithDetails = {
      ...group,
      users: userInGroups?.map((item) => item.user) || [],
      roles: groupInRoles?.map((item) => item.role) || []
    };

    return res.status(200).json(groupWithDetails);
  } catch (error: any) {
    console.error('Error fetching group details:', error);
    return res.status(500).json({ message: error.message });
  }
};