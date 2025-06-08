import { Request, Response } from 'express';
import { ProductModel } from '../models/product.model';
import { AuthRequest } from '../middleware/auth.middleware';

export class ProductController {
  static async getAllProducts(req: Request, res: Response) {
    try {
      const products = await ProductModel.findAll();
      res.json({ products });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const product = await ProductModel.findById(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json({ product });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async createProduct(req: AuthRequest, res: Response) {
    try {
      const { name, sku, description, category } = req.body;
      
      if (!name || !sku) {
        return res.status(400).json({ message: 'Name and SKU are required' });
      }
      
      const existingProduct = await ProductModel.findBySku(sku);
      if (existingProduct) {
        return res.status(400).json({ message: 'Product with this SKU already exists' });
      }
      
      const product = await ProductModel.create({
        name,
        sku,
        description: description || '',
        category: category || 'Uncategorized'
      });
      
      res.status(201).json({ product });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async updateProduct(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, sku, description, category } = req.body;
      
      if (sku) {
        const existingProduct = await ProductModel.findBySku(sku);
        if (existingProduct && existingProduct.id !== id) {
          return res.status(400).json({ message: 'Another product with this SKU already exists' });
        }
      }
      
      const updateData: any = {};
      if (name) updateData.name = name;
      if (sku) updateData.sku = sku;
      if (description !== undefined) updateData.description = description;
      if (category) updateData.category = category;
      
      const updatedProduct = await ProductModel.update(id, updateData);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json({ product: updatedProduct });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async deleteProduct(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      const deleted = await ProductModel.delete(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}