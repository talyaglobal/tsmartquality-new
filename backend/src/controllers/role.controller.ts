import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

/**
 * Get all roles
 */
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    let query = supabase
      .from('roles')
      .select('*', { count: 'exact' });
    
    // If not a system admin, restrict to company roles
    if (!req.user.is_admin) {
      query = query.eq('company_id', req.user.company_id);
    }
    
    const { data, error, count } = await query
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
 * Get a role by ID
 */
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    let query = supabase
      .from('roles')
      .select('*')
      .eq('id', id);
    
    // If not a system admin, restrict to company roles
    if (!req.user.is_admin) {
      query = query.eq('company_id', req.user.company_id);
    }
    
    const { data, error } = await query.single();
    
    if (error) {
      return res.status(404).json({ success: false, error: 'Role not found' });
    }
    
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create a new role
 */
export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    // Only admins can create roles
    if (!req.user.is_admin && !req.user.is_company_admin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions to create roles' 
      });
    }
    
    // Check if role name already exists in the company
    const { data: existingRole, error: checkError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', name)
      .eq('company_id', req.user.company_id)
      .limit(1);
    
    if (existingRole && existingRole.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Role with this name already exists in your company' 
      });
    }
    
    // Create the role
    const { data, error } = await supabase
      .from('roles')
      .insert({
        name,
        description,
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
 * Update a role
 */
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id, name, description } = req.body;
    
    // Only admins can update roles
    if (!req.user.is_admin && !req.user.is_company_admin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions to update roles' 
      });
    }
    
    // Check if the role exists and belongs to the admin's company
    let query = supabase
      .from('roles')
      .select('*')
      .eq('id', id);
    
    // Company admins can only update roles in their company
    if (!req.user.is_admin) {
      query = query.eq('company_id', req.user.company_id);
    }
    
    const { data: existingRole, error: roleError } = await query.single();
    
    if (roleError) {
      return res.status(404).json({ 
        success: false, 
        error: 'Role not found or you do not have permission to update it' 
      });
    }
    
    // Check if the updated name would conflict with another role
    if (name && name !== existingRole.name) {
      const { data: nameCheck, error: nameError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', name)
        .eq('company_id', existingRole.company_id)
        .neq('id', id)
        .limit(1);
      
      if (nameCheck && nameCheck.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Another role with this name already exists in the company' 
        });
      }
    }
    
    // Update the role
    const { data, error } = await supabase
      .from('roles')
      .update({
        name: name || existingRole.name,
        description: description !== undefined ? description : existingRole.description,
        updated_at: new Date(),
        updated_by: req.user.id
      })
      .eq('id', id)
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
 * Delete a role
 */
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Only admins can delete roles
    if (!req.user.is_admin && !req.user.is_company_admin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions to delete roles' 
      });
    }
    
    // Check if the role exists and belongs to the admin's company
    let query = supabase
      .from('roles')
      .select('id, company_id')
      .eq('id', id);
    
    // Company admins can only delete roles in their company
    if (!req.user.is_admin) {
      query = query.eq('company_id', req.user.company_id);
    }
    
    const { data: roleData, error: roleError } = await query.single();
    
    if (roleError) {
      return res.status(404).json({ 
        success: false, 
        error: 'Role not found or you do not have permission to delete it' 
      });
    }
    
    // Check if role is assigned to any users
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role_id', id)
      .limit(1);
    
    if (userRoles && userRoles.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete role that is assigned to users. Remove all user assignments first.' 
      });
    }
    
    // Delete role permissions first
    await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', id);
    
    // Delete the role
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Role deleted successfully' 
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get permissions for a role
 */
export const getRolePermissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if the role exists and belongs to the user's company
    let roleQuery = supabase
      .from('roles')
      .select('id, company_id')
      .eq('id', id);
    
    // If not a system admin, restrict to company roles
    if (!req.user.is_admin) {
      roleQuery = roleQuery.eq('company_id', req.user.company_id);
    }
    
    const { data: roleData, error: roleError } = await roleQuery.single();
    
    if (roleError) {
      return res.status(404).json({ 
        success: false, 
        error: 'Role not found or you do not have permission to view it' 
      });
    }
    
    // Get the role's permissions
    const { data, error } = await supabase
      .from('role_permissions')
      .select('permission')
      .eq('role_id', id);
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    const permissions = data.map(item => item.permission);
    
    return res.status(200).json({ success: true, data: permissions });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Add permission to role
 */
export const addPermission = async (req: Request, res: Response) => {
  try {
    const { roleId, permission } = req.body;
    
    // Only admins can manage permissions
    if (!req.user.is_admin && !req.user.is_company_admin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions to manage role permissions' 
      });
    }
    
    // Check if the role exists and belongs to the admin's company
    let roleQuery = supabase
      .from('roles')
      .select('id, company_id')
      .eq('id', roleId);
    
    // Company admins can only manage roles in their company
    if (!req.user.is_admin) {
      roleQuery = roleQuery.eq('company_id', req.user.company_id);
    }
    
    const { data: roleData, error: roleError } = await roleQuery.single();
    
    if (roleError) {
      return res.status(404).json({ 
        success: false, 
        error: 'Role not found or you do not have permission to manage it' 
      });
    }
    
    // Check if permission already exists for this role
    const { data: existingPerm, error: permError } = await supabase
      .from('role_permissions')
      .select('id')
      .eq('role_id', roleId)
      .eq('permission', permission)
      .limit(1);
    
    if (existingPerm && existingPerm.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Role already has this permission' 
      });
    }
    
    // Add the permission
    const { data, error } = await supabase
      .from('role_permissions')
      .insert({
        role_id: roleId,
        permission,
        company_id: roleData.company_id,
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
 * Remove permission from role
 */
export const removePermission = async (req: Request, res: Response) => {
  try {
    const { roleId, permission } = req.params;
    
    // Only admins can manage permissions
    if (!req.user.is_admin && !req.user.is_company_admin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions to manage role permissions' 
      });
    }
    
    // Check if the role exists and belongs to the admin's company
    let roleQuery = supabase
      .from('roles')
      .select('id, company_id')
      .eq('id', roleId);
    
    // Company admins can only manage roles in their company
    if (!req.user.is_admin) {
      roleQuery = roleQuery.eq('company_id', req.user.company_id);
    }
    
    const { data: roleData, error: roleError } = await roleQuery.single();
    
    if (roleError) {
      return res.status(404).json({ 
        success: false, 
        error: 'Role not found or you do not have permission to manage it' 
      });
    }
    
    // Delete the permission
    let query = supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId)
      .eq('permission', permission);
    
    // Company admins can only delete permissions for roles in their company
    if (!req.user.is_admin) {
      query = query.eq('company_id', req.user.company_id);
    }
    
    const { error } = await query;
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Permission removed successfully' 
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get all available permissions
 */
export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    // This could be implemented by fetching from a permissions table,
    // or by returning a predefined list of all available permissions in the system
    
    // For simplicity, we'll return a predefined list
    const availablePermissions = [
      // Product permissions
      'product.view', 'product.create', 'product.edit', 'product.delete',
      
      // Customer permissions
      'customer.view', 'customer.create', 'customer.edit', 'customer.delete',
      
      // Supplier permissions
      'supplier.view', 'supplier.create', 'supplier.edit', 'supplier.delete',
      
      // Recipe permissions
      'recipe.view', 'recipe.create', 'recipe.edit', 'recipe.delete',
      
      // Specification permissions
      'spec.view', 'spec.create', 'spec.edit', 'spec.delete',
      
      // Photo permissions
      'photo.view', 'photo.create', 'photo.edit', 'photo.delete',
      
      // User management permissions
      'user.view', 'user.create', 'user.edit', 'user.delete',
      
      // Role management permissions
      'role.view', 'role.create', 'role.edit', 'role.delete',
      
      // Company management permissions
      'company.view', 'company.create', 'company.edit', 'company.delete',
      
      // Report permissions
      'report.view', 'report.create', 'report.export',
      
      // Dashboard permissions
      'dashboard.view'
    ];
    
    return res.status(200).json({ 
      success: true, 
      data: availablePermissions 
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};