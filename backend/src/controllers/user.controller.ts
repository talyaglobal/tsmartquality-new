import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

/**
 * Get all users
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    // Only admins or company admins can view all users
    if (!req.user.is_admin && !req.user.is_company_admin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions to view all users' 
      });
    }
    
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });
    
    // If not a system admin, restrict to company users
    if (!req.user.is_admin) {
      query = query.eq('company_id', req.user.company_id);
    }
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    // Remove sensitive information
    const sanitizedUsers = data.map(user => {
      const { password_hash, ...safeUser } = user;
      return safeUser;
    });
    
    return res.status(200).json({
      success: true,
      data: sanitizedUsers,
      count,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Users can only view their own profile or admins can view any
    if (id !== req.user.id && !req.user.is_admin && !req.user.is_company_admin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions to view this user' 
      });
    }
    
    let query = supabase
      .from('users')
      .select('*')
      .eq('id', id);
    
    // If not a system admin, restrict to company users
    if (!req.user.is_admin && id !== req.user.id) {
      query = query.eq('company_id', req.user.company_id);
    }
    
    const { data, error } = await query.single();
    
    if (error) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Remove sensitive information
    const { password_hash, ...safeUser } = data;
    
    return res.status(200).json({ success: true, data: safeUser });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    if (error) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Remove sensitive information
    const { password_hash, ...safeUser } = data;
    
    return res.status(200).json({ success: true, data: safeUser });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update user profile
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { 
      id,
      full_name, 
      email,
      phone,
      job_title,
      department,
      is_active,
      is_company_admin,
      company_id
    } = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }
    
    // Regular users can only update their own profile
    // Company admins can update users in their company
    // System admins can update any user
    if (id !== req.user.id && !req.user.is_admin) {
      if (!req.user.is_company_admin) {
        return res.status(403).json({ 
          success: false, 
          error: 'Insufficient permissions to update this user' 
        });
      }
      
      // Company admins can only update users in their company
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', id)
        .single();
      
      if (userError || existingUser.company_id !== req.user.company_id) {
        return res.status(403).json({ 
          success: false, 
          error: 'Insufficient permissions to update this user' 
        });
      }
    }
    
    // Get existing user data
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    // Check if email is being changed and if it's unique
    if (email && email !== existingUser.email) {
      const { data: emailCheck, error: emailError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', id)
        .limit(1);
      
      if (emailCheck && emailCheck.length > 0) {
        return res.status(400).json({ success: false, error: 'Email is already in use' });
      }
      
      // Update email in auth.users
      const { error: authError } = await supabase.auth.admin.updateUserById(
        id,
        { email }
      );
      
      if (authError) {
        return res.status(400).json({ success: false, error: authError.message });
      }
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (full_name !== undefined) updateData.full_name = full_name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (job_title !== undefined) updateData.job_title = job_title;
    if (department !== undefined) updateData.department = department;
    
    // Only admins can change these fields
    if (req.user.is_admin || req.user.is_company_admin) {
      if (is_active !== undefined) updateData.is_active = is_active;
      
      // Only system admins can change company_id and admin status
      if (req.user.is_admin) {
        if (company_id !== undefined) updateData.company_id = company_id;
        if (is_company_admin !== undefined) updateData.is_company_admin = is_company_admin;
      }
    }
    
    // Add update metadata
    updateData.updated_at = new Date();
    updateData.updated_by = req.user.id;
    
    // Update the user
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    // Remove sensitive information
    const { password_hash, ...safeUser } = data;
    
    return res.status(200).json({ success: true, data: safeUser });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete a user (soft delete by deactivating)
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Only admins can delete users
    if (!req.user.is_admin && !req.user.is_company_admin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions to delete users' 
      });
    }
    
    // Cannot delete yourself
    if (id === req.user.id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete your own account' 
      });
    }
    
    // Check if user exists and get company info
    let query = supabase
      .from('users')
      .select('company_id')
      .eq('id', id);
    
    // Company admins can only delete users in their company
    if (!req.user.is_admin) {
      query = query.eq('company_id', req.user.company_id);
    }
    
    const { data: userData, error: userError } = await query.single();
    
    if (userError) {
      return res.status(404).json({ success: false, error: 'User not found or you do not have permission to delete this user' });
    }
    
    // Soft delete by deactivating
    const { error } = await supabase
      .from('users')
      .update({ 
        is_active: false,
        updated_at: new Date(),
        updated_by: req.user.id
      })
      .eq('id', id);
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'User deactivated successfully' 
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Change user password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { current_password, new_password } = req.body;
    
    if (!current_password || !new_password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Current password and new password are required' 
      });
    }
    
    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: req.user.email,
      password: current_password,
    });
    
    if (signInError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Current password is incorrect' 
      });
    }
    
    // Update password
    const { error } = await supabase.auth.admin.updateUserById(
      req.user.id,
      { password: new_password }
    );
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get users by company ID
 */
export const getUsersByCompany = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    // Only system admins or company admins of the specified company can view these users
    if (!req.user.is_admin && !(req.user.is_company_admin && req.user.company_id === Number(companyId))) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions to view users from this company' 
      });
    }
    
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    // Remove sensitive information
    const sanitizedUsers = data.map(user => {
      const { password_hash, ...safeUser } = user;
      return safeUser;
    });
    
    return res.status(200).json({
      success: true,
      data: sanitizedUsers,
      count,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Assign role to user
 */
export const assignRole = async (req: Request, res: Response) => {
  try {
    const { userId, roleId } = req.body;
    
    // Only admins can assign roles
    if (!req.user.is_admin && !req.user.is_company_admin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions to assign roles' 
      });
    }
    
    // Verify the user exists and belongs to the admin's company
    let userQuery = supabase
      .from('users')
      .select('company_id')
      .eq('id', userId);
    
    // Company admins can only assign roles to users in their company
    if (!req.user.is_admin) {
      userQuery = userQuery.eq('company_id', req.user.company_id);
    }
    
    const { data: userData, error: userError } = await userQuery.single();
    
    if (userError) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found or you do not have permission to assign roles to this user' 
      });
    }
    
    // Verify the role exists and belongs to the admin's company
    let roleQuery = supabase
      .from('roles')
      .select('company_id')
      .eq('id', roleId);
    
    // Company admins can only assign roles from their company
    if (!req.user.is_admin) {
      roleQuery = roleQuery.eq('company_id', req.user.company_id);
    }
    
    const { data: roleData, error: roleError } = await roleQuery.single();
    
    if (roleError) {
      return res.status(404).json({ 
        success: false, 
        error: 'Role not found or you do not have permission to assign this role' 
      });
    }
    
    // Check if the user already has this role
    const { data: existingRole, error: existingRoleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .limit(1);
    
    if (existingRole && existingRole.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'User already has this role' 
      });
    }
    
    // Assign the role
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleId,
        company_id: userData.company_id,
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
 * Remove role from user
 */
export const removeRole = async (req: Request, res: Response) => {
  try {
    const { userId, roleId } = req.params;
    
    // Only admins can remove roles
    if (!req.user.is_admin && !req.user.is_company_admin) {
      return res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions to remove roles' 
      });
    }
    
    // Company admins can only remove roles from users in their company
    let query = supabase
      .from('user_roles')
      .delete();
    
    if (!req.user.is_admin) {
      // Get the user role record first to check company
      const { data: userRole, error: userRoleError } = await supabase
        .from('user_roles')
        .select('company_id')
        .eq('user_id', userId)
        .eq('role_id', roleId)
        .eq('company_id', req.user.company_id)
        .single();
      
      if (userRoleError) {
        return res.status(404).json({ 
          success: false, 
          error: 'Role assignment not found or you do not have permission to remove it' 
        });
      }
      
      query = query
        .eq('user_id', userId)
        .eq('role_id', roleId)
        .eq('company_id', req.user.company_id);
    } else {
      query = query
        .eq('user_id', userId)
        .eq('role_id', roleId);
    }
    
    const { error } = await query;
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Role removed successfully' 
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get roles for user
 */
export const getUserRoles = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Regular users can only view their own roles
    // Admins can view any user's roles
    if (userId !== req.user.id && !req.user.is_admin) {
      // Company admins can view roles of users in their company
      if (!req.user.is_company_admin) {
        return res.status(403).json({ 
          success: false, 
          error: 'Insufficient permissions to view this user\'s roles' 
        });
      }
      
      // Check if user belongs to admin's company
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', userId)
        .eq('company_id', req.user.company_id)
        .single();
      
      if (userError) {
        return res.status(403).json({ 
          success: false, 
          error: 'Insufficient permissions to view this user\'s roles' 
        });
      }
    }
    
    // Get the user's roles with role details
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        id,
        role_id,
        roles (
          id,
          name,
          description
        )
      `)
      .eq('user_id', userId);
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Check if user has specific permission
 */
export const checkPermission = async (req: Request, res: Response) => {
  try {
    const { permission } = req.params;
    
    // System admins have all permissions
    if (req.user.is_admin) {
      return res.status(200).json({ 
        success: true, 
        hasPermission: true 
      });
    }
    
    // Get the user's roles
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', req.user.id);
    
    if (rolesError || !userRoles || userRoles.length === 0) {
      return res.status(200).json({ 
        success: true, 
        hasPermission: false 
      });
    }
    
    const roleIds = userRoles.map(ur => ur.role_id);
    
    // Check if any of the user's roles have the specified permission
    const { data: permissions, error: permError } = await supabase
      .from('role_permissions')
      .select('permission')
      .in('role_id', roleIds)
      .eq('permission', permission)
      .limit(1);
    
    if (permError) {
      return res.status(400).json({ success: false, error: permError.message });
    }
    
    return res.status(200).json({ 
      success: true, 
      hasPermission: permissions && permissions.length > 0 
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};