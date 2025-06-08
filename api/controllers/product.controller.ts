import { Request, Response } from 'express';
import { ProductModel } from '../models/product.model';
import { AuthRequest } from '../middleware/auth.middleware';
import path from 'path';

export class ProductController {
  static async getAllProducts(req: AuthRequest, res: Response) {
    try {
      const { page = 1, pageSize = 20, sellerId, brandId, orderBy } = req.query;
      const companyId = req.companyId!;
      
      const filters = {
        sellerId: sellerId ? parseInt(sellerId as string) : undefined,
        brandId: brandId ? parseInt(brandId as string) : undefined,
        orderBy: orderBy as string
      };

      const result = await ProductModel.findAll(
        companyId, 
        parseInt(page as string), 
        parseInt(pageSize as string), 
        filters
      );
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async getProductById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const companyId = req.companyId!;
      
      const product = await ProductModel.findById(id, companyId);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async createProduct(req: AuthRequest, res: Response) {
    try {
      const { code, name, sellerId, brandId, description, weight, volume, criticalStockAmount } = req.body;
      const companyId = req.companyId!;
      const userId = req.userId!;
      
      // Validation
      if (!code || !name || !sellerId || !brandId || criticalStockAmount === undefined) {
        return res.status(400).json({ 
          message: 'Code, name, sellerId, brandId, and criticalStockAmount are required' 
        });
      }

      if (criticalStockAmount <= 0) {
        return res.status(400).json({ 
          message: 'criticalStockAmount must be greater than 0' 
        });
      }

      if (weight && weight < 0) {
        return res.status(400).json({ message: 'Weight cannot be negative' });
      }

      if (volume && volume < 0) {
        return res.status(400).json({ message: 'Volume cannot be negative' });
      }
      
      // Check for duplicate code within company
      const existingProduct = await ProductModel.findByCode(code, companyId);
      if (existingProduct) {
        return res.status(409).json({ message: 'Product code exists' });
      }
      
      const product = await ProductModel.create({
        code,
        name,
        sellerId,
        brandId,
        companyId,
        description,
        weight,
        volume,
        criticalStockAmount,
        created_by: userId
      });
      
      res.status(201).json({
        id: product.id,
        code: product.code,
        name: product.name,
        createdDate: product.created_at,
        createdBy: product.created_by,
        companyId: product.companyId
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async updateProduct(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { code, name, sellerId, brandId, description, weight, volume, criticalStockAmount } = req.body;
      const companyId = req.companyId!;
      const userId = req.userId!;
      
      // Validation for negative values
      if (weight && weight < 0) {
        return res.status(400).json({ message: 'Weight cannot be negative' });
      }

      if (volume && volume < 0) {
        return res.status(400).json({ message: 'Volume cannot be negative' });
      }

      if (criticalStockAmount && criticalStockAmount <= 0) {
        return res.status(400).json({ message: 'criticalStockAmount must be greater than 0' });
      }
      
      // Check for duplicate code if code is being updated
      if (code) {
        const existingProduct = await ProductModel.findByCode(code, companyId);
        if (existingProduct && existingProduct.id !== id) {
          return res.status(409).json({ message: 'Product code exists' });
        }
      }
      
      const updateData: any = { updated_by: userId };
      if (code) updateData.code = code;
      if (name) updateData.name = name;
      if (sellerId) updateData.sellerId = sellerId;
      if (brandId) updateData.brandId = brandId;
      if (description !== undefined) updateData.description = description;
      if (weight !== undefined) updateData.weight = weight;
      if (volume !== undefined) updateData.volume = volume;
      if (criticalStockAmount !== undefined) updateData.criticalStockAmount = criticalStockAmount;
      
      const updatedProduct = await ProductModel.update(id, companyId, updateData);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async deleteProduct(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const companyId = req.companyId!;
      
      const deleted = await ProductModel.softDelete(id, companyId);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json({
        message: 'Product deactivated',
        productId: id,
        deletedDate: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async bulkUpdateStatus(req: AuthRequest, res: Response) {
    try {
      const { ids, updates } = req.body;
      const companyId = req.companyId!;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Product IDs array is required' });
      }

      if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'Updates object is required' });
      }
      
      const updatedCount = await ProductModel.bulkUpdateStatus(ids, companyId, updates);
      
      res.json({
        message: `${updatedCount} products updated`,
        updatedCount
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async uploadPhoto(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const companyId = req.companyId!;
      
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Verify product exists and belongs to user's company
      const product = await ProductModel.findById(id, companyId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const photoUrl = `/uploads/${req.file.filename}`;
      
      res.json({
        message: 'Photo uploaded successfully',
        photoUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}