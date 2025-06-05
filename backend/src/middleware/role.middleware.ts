import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

/**
 * Middleware to check if user has one of the specified roles
 */
export const roleMiddleware = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // System admin can do anything
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Get the user's roles from group memberships
      const { data: userGroups, error: groupsError } = await supabase
        .from('user_in_groups')
        .select('group_id')
        .eq('user_id', req.user.id)
        .eq('status', true);
      
      if (groupsError) throw groupsError;
      
      if (!userGroups || userGroups.length === 0) {
        return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
      }
      
      const groupIds = userGroups.map(group => group.group_id);
      
      // Get roles assigned to user's groups
      const { data: groupRoles, error: rolesError } = await supabase
        .from('group_in_roles')
        .select(`
          role:role_id(id, name)
        `)
        .in('group_id', groupIds)
        .eq('status', true);
      
      if (rolesError) throw rolesError;
      
      if (!groupRoles || groupRoles.length === 0) {
        return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
      }
      
      // Check if user has any of the allowed roles
      const userRoles = groupRoles.map(gr => gr.role.name);
      const hasAllowedRole = allowedRoles.some(role => userRoles.includes(role));
      
      if (!hasAllowedRole) {
        return res.status(403).json({ 
          message: `Access denied: Required role(s): ${allowedRoles.join(', ')}` 
        });
      }
      
      // User has an allowed role, proceed
      next();
    } catch (error) {
      console.error('Role verification error:', error);
      return res.status(500).json({ message: 'Error checking user permissions' });
    }
  };
};

/**
 * Middleware to check if user is a system admin
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access denied: Administrator permissions required'
    });
  }
  next();
};

/**
 * Middleware to check if user is a company admin or system admin
 */
export const isCompanyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // System admins can do anything
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if user has company admin role
    const { data: userGroups, error: groupsError } = await supabase
      .from('user_in_groups')
      .select('group_id')
      .eq('user_id', req.user.id)
      .eq('status', true);
    
    if (groupsError) throw groupsError;
    
    if (!userGroups || userGroups.length === 0) {
      return res.status(403).json({ message: 'Access denied: Company administrator permissions required' });
    }
    
    const groupIds = userGroups.map(group => group.group_id);
    
    // Get roles assigned to user's groups
    const { data: groupRoles, error: rolesError } = await supabase
      .from('group_in_roles')
      .select(`
        role:role_id(id, name)
      `)
      .in('group_id', groupIds)
      .eq('status', true);
    
    if (rolesError) throw rolesError;
    
    if (!groupRoles || groupRoles.length === 0) {
      return res.status(403).json({ message: 'Access denied: Company administrator permissions required' });
    }
    
    // Check if user has company admin role
    const userRoles = groupRoles.map(gr => gr.role.name);
    if (!userRoles.includes('company_admin')) {
      return res.status(403).json({ 
        message: 'Access denied: Company administrator permissions required' 
      });
    }
    
    // User is a company admin, proceed
    next();
  } catch (error) {
    console.error('Company admin verification error:', error);
    return res.status(500).json({ message: 'Error checking user permissions' });
  }
};

/**
 * Middleware to check if user is the resource owner, a company admin, or a system admin
 */
export const isResourceOwnerOrAdmin = (resourceTable: string, resourceIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // System admins can access any resource
      if (req.user.role === 'admin') {
        return next();
      }
      
      const resourceId = req.params[resourceIdParam] || req.body.id;
      if (!resourceId) {
        return res.status(400).json({ message: 'Resource ID is required' });
      }
      
      // Check resource ownership
      const { data: resource, error: resourceError } = await supabase
        .from(resourceTable)
        .select('created_by, company_id')
        .eq('id', resourceId)
        .eq('status', true)
        .single();
      
      if (resourceError || !resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }
      
      // If user created the resource or is from the same company
      if (resource.created_by === req.user.id) {
        return next();
      }
      
      // Check if user is a company admin for the resource's company
      if (resource.company_id === req.user.companyId) {
        const isCompAdmin = await isUserCompanyAdmin(req.user.id);
        if (isCompAdmin) {
          return next();
        }
      }
      
      return res.status(403).json({ message: 'Access denied: Insufficient permissions for this resource' });
    } catch (error) {
      console.error('Resource ownership verification error:', error);
      return res.status(500).json({ message: 'Error checking resource permissions' });
    }
  };
};

// Helper function to check if a user is a company admin
async function isUserCompanyAdmin(userId: string): Promise<boolean> {
  try {
    const { data: userGroups, error: groupsError } = await supabase
      .from('user_in_groups')
      .select('group_id')
      .eq('user_id', userId)
      .eq('status', true);
    
    if (groupsError || !userGroups || userGroups.length === 0) {
      return false;
    }
    
    const groupIds = userGroups.map(group => group.group_id);
    
    const { data: groupRoles, error: rolesError } = await supabase
      .from('group_in_roles')
      .select(`
        role:role_id(id, name)
      `)
      .in('group_id', groupIds)
      .eq('status', true);
    
    if (rolesError || !groupRoles || groupRoles.length === 0) {
      return false;
    }
    
    const userRoles = groupRoles.map(gr => gr.role.name);
    return userRoles.includes('company_admin');
  } catch (error) {
    console.error('Error checking company admin status:', error);
    return false;
  }
}