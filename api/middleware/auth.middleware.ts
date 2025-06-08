import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { UserModel } from '../models/user.model';

export interface AuthRequest extends Request {
  user?: any;
  companyId?: number;
  userId?: string;
  role?: string;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }
    
    const decoded = jwt.verify(token, config.jwt.secret) as { 
      userId: string; 
      companyId: number; 
      role: string; 
    };
    
    const user = await UserModel.findById(decoded.userId);
    
    if (!user) {
      res.status(401).json({ message: 'Invalid authentication token' });
      return;
    }
    
    req.user = user;
    req.userId = decoded.userId;
    req.companyId = decoded.companyId;
    req.role = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};