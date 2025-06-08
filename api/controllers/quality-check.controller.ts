import { Request, Response } from 'express';
import { QualityCheckModel } from '../models/quality-check.model';
import { ProductModel } from '../models/product.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class QualityCheckController {
  static async getAllQualityChecks(req: Request, res: Response): Promise<any> {
    try {
      const qualityChecks = await QualityCheckModel.findAll();
      res.json({ qualityChecks });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async getQualityCheckById(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      
      const qualityCheck = await QualityCheckModel.findById(id);
      
      if (!qualityCheck) {
        return res.status(404).json({ message: 'Quality check not found' });
      }
      
      res.json({ qualityCheck });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async getQualityChecksByProduct(req: AuthRequest, res: Response): Promise<any> {
    try {
      const { productId } = req.params;
      const companyId = req.companyId!;
      
      const product = await ProductModel.findById(productId, companyId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      const qualityChecks = await QualityCheckModel.findByProductId(productId);
      
      res.json({ qualityChecks });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async createQualityCheck(req: AuthRequest, res: Response): Promise<any> {
    try {
      const { product_id, check_date, status, notes } = req.body;
      const inspector_id = req.user.id;
      
      if (!product_id || !check_date || !status) {
        return res.status(400).json({ message: 'Product ID, check date, and status are required' });
      }
      
      // Validate product exists
      const companyId = req.companyId!;
      const product = await ProductModel.findById(product_id, companyId);
      if (!product) {
        return res.status(400).json({ message: 'Product not found' });
      }
      
      // Validate status
      if (!['pending', 'passed', 'failed'].includes(status)) {
        return res.status(400).json({ message: 'Status must be pending, passed, or failed' });
      }
      
      const qualityCheck = await QualityCheckModel.create({
        product_id,
        inspector_id,
        check_date: new Date(check_date),
        status,
        notes: notes || ''
      });
      
      res.status(201).json({ qualityCheck });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async updateQualityCheck(req: AuthRequest, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      
      // Get the existing check to verify ownership
      const existingCheck = await QualityCheckModel.findById(id);
      if (!existingCheck) {
        return res.status(404).json({ message: 'Quality check not found' });
      }
      
      // Ensure the inspector is updating their own check or is an admin
      if (existingCheck.inspector_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'You can only update your own quality checks' });
      }
      
      // Validate status if provided
      if (status && !['pending', 'passed', 'failed'].includes(status)) {
        return res.status(400).json({ message: 'Status must be pending, passed, or failed' });
      }
      
      const updateData: any = {};
      if (status) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      
      const updatedCheck = await QualityCheckModel.update(id, updateData);
      
      res.json({ qualityCheck: updatedCheck });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async deleteQualityCheck(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      // Get the existing check to verify ownership
      const existingCheck = await QualityCheckModel.findById(id);
      if (!existingCheck) {
        return res.status(404).json({ message: 'Quality check not found' });
      }
      
      // Ensure the inspector is deleting their own check or is an admin
      if (existingCheck.inspector_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'You can only delete your own quality checks' });
      }
      
      const deleted = await QualityCheckModel.delete(id);
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}