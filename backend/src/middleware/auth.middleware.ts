import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';

// Extend the Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        full_name?: string;
        companyId?: number;
        role?: string;
        is_admin?: boolean;
        is_company_admin?: boolean;
      };
      supabase?: typeof supabase;
    }
  }
}

// Middleware to verify JWT token and set up user data
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const jwtSecret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;

    // Get user info from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*, company:company_id(id)')
      .eq('id', decoded.sub || decoded.user_id)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Token is not valid or user is inactive' });
    }

    // Check if user has admin role
    let isAdmin = false;
    let isCompanyAdmin = false;

    // System admin check from token claims
    if (decoded.role === 'admin') {
      isAdmin = true;
    }

    // Company admin check (will be verified in role-specific middleware)
    // Just initializing the property here
    
    // Attach user to request object
    req.user = {
      id: user.id,
      email: decoded.email || user.email,
      full_name: user.full_name,
      companyId: user.company_id,
      role: decoded.role,
      is_admin: isAdmin,
      is_company_admin: isCompanyAdmin
    };

    // Make supabase client available to route handlers
    req.supabase = supabase;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware alias for backward compatibility
export const authenticate = authMiddleware;

// Middleware to check if user has admin role
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: 'Access denied: Admin role required' });
  }
  next();
};

// Middleware to verify company access
export const hasCompanyAccess = (req: Request, res: Response, next: NextFunction) => {
  const companyId = parseInt(req.params.companyId || req.query.companyId as string);
  
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // Allow if user is admin or belongs to the company
  if (req.user.is_admin || req.user.companyId === companyId) {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Not authorized for this company' });
  }
};