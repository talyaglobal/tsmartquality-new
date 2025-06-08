import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { AuthRequest } from '../middleware/auth.middleware';

export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await UserModel.create({
        name,
        email,
        password: hashedPassword
      });
      
      const token = jwt.sign({ id: user.id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
      
      res.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        token
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const token = jwt.sign({ id: user.id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
      
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        token
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      res.json({
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const { name, email, password } = req.body;
      
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (password) updateData.password = await bcrypt.hash(password, 10);
      
      const updatedUser = await UserModel.update(req.user.id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}