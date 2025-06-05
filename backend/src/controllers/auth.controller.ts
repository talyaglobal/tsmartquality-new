import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, notificationToken } = req.body;

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get user data from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*, companies:company_id(*)')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return res.status(500).json({ message: 'Error fetching user data' });
    }

    // Check if user is active
    if (!userData.is_active) {
      return res.status(401).json({ message: 'User account is deactivated' });
    }

    // Update notification token if provided
    if (notificationToken) {
      await supabase
        .from('notification_tokens')
        .upsert({
          user_id: authData.user.id,
          token: notificationToken,
          created_at: new Date()
        });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET as string;
    const token = jwt.sign(
      {
        sub: authData.user.id,
        email: authData.user.email,
        companyId: userData.company_id,
        role: authData.user.role || 'user'
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRY || '1d' }
    );

    // Get user role from groups
    const { data: userGroups, error: groupsError } = await supabase
      .from('user_in_groups')
      .select('groups:group_id(id, name)')
      .eq('user_id', authData.user.id)
      .eq('status', true);

    // Get user permissions
    const { data: permissions, error: permissionsError } = await supabase
      .rpc('get_user_permissions', { user_id: authData.user.id });

    // Return user data with token
    return res.status(200).json({
      token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        fullName: userData.full_name,
        companyId: userData.company_id,
        company: userData.companies,
        groups: userGroups?.map((ug: any) => ug.groups) || [],
        permissions: permissions || []
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Register
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, companyId } = req.body;

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    // Create user record in database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user?.id,
        full_name: fullName,
        company_id: companyId,
        is_active: true
      })
      .select()
      .single();

    if (userError) {
      // Rollback user creation if error
      if (authData.user) {
        await supabase.auth.admin.deleteUser(authData.user.id);
      }
      return res.status(500).json({ message: userError.message });
    }

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userData.id,
        email,
        fullName: userData.full_name,
        companyId: userData.company_id
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*, companies:company_id(*)')
      .eq('id', req.user.id)
      .single();

    if (userError) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user groups
    const { data: userGroups, error: groupsError } = await supabase
      .from('user_in_groups')
      .select('groups:group_id(id, name)')
      .eq('user_id', req.user.id)
      .eq('status', true);

    // Get user permissions
    const { data: permissions, error: permissionsError } = await supabase
      .rpc('get_user_permissions', { user_id: req.user.id });

    return res.status(200).json({
      id: req.user.id,
      email: req.user.email,
      fullName: userData.full_name,
      companyId: userData.company_id,
      company: userData.companies,
      groups: userGroups?.map((ug: any) => ug.groups) || [],
      permissions: permissions || []
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Request password reset
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const { data, error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({ message: 'Password reset email sent' });
  } catch (error: any) {
    console.error('Password reset request error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Change password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // First verify current password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: req.user.email,
      password: currentPassword
    });

    if (authError) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Change password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: error.message });
  }
};