import { Request, Response } from 'express';
import { ProductModel } from '../models/product.model';
import { EnhancedAuthRequest } from '../middleware/enhanced-auth.middleware';
import { ControllerHelpers, ValidationError } from '../utils/controller-helpers';
import { BusinessRules } from '../utils/business-rules';
import { AuditService } from '../services/audit.service';
import { Logger } from '../startup';
import path from 'path';

export class ProductController {
  static async getAllProducts(req: EnhancedAuthRequest, res: Response): Promise<any> {
    try {
      const userRole = req.user?.role;
      const companyId = req.companyId!;
      
      // Check authorization
      const access = BusinessRules.checkResourceAccess(userRole, 'product:read');
      if (!access.allowed) {
        return ControllerHelpers.sendError(res, access.reason || 'Insufficient permissions', 403);
      }

      const { page, pageSize, offset } = ControllerHelpers.parsePagination(req.query);
      const { orderBy, sortDirection } = ControllerHelpers.parseSorting(req.query, [
        'name', 'code', 'created_at', 'updated_at', 'critical_stock_amount'
      ]);

      // Extract and validate filters
      const filters: any = {};
      
      if (req.query.sellerId) {
        const sellerIdErrors = ControllerHelpers.validateNumeric(req.query.sellerId, 'sellerId', { integer: true, min: 1 });
        if (sellerIdErrors.length > 0) {
          return ControllerHelpers.sendValidationError(res, sellerIdErrors);
        }
        filters.sellerId = parseInt(req.query.sellerId as string);
      }

      if (req.query.brandId) {
        const brandIdErrors = ControllerHelpers.validateNumeric(req.query.brandId, 'brandId', { integer: true, min: 1 });
        if (brandIdErrors.length > 0) {
          return ControllerHelpers.sendValidationError(res, brandIdErrors);
        }
        filters.brandId = parseInt(req.query.brandId as string);
      }

      if (req.query.productTypeId) {
        const typeIdErrors = ControllerHelpers.validateNumeric(req.query.productTypeId, 'productTypeId', { integer: true, min: 1 });
        if (typeIdErrors.length > 0) {
          return ControllerHelpers.sendValidationError(res, typeIdErrors);
        }
        filters.productTypeId = parseInt(req.query.productTypeId as string);
      }

      if (req.query.status) {
        const statusError = ControllerHelpers.validateEnum(req.query.status as string, 'status', ['active', 'inactive', 'discontinued']);
        if (statusError) {
          return ControllerHelpers.sendValidationError(res, [statusError]);
        }
        filters.status = req.query.status;
      }

      if (req.query.search) {
        filters.search = ControllerHelpers.sanitizeString(req.query.search as string);
      }

      const result = await ProductModel.findAllAdvanced(
        companyId, 
        page,
        pageSize,
        offset,
        filters,
        orderBy,
        sortDirection
      );

      // Log data access
      await AuditService.logDataAccess({
        userId: req.userId!,
        sessionId: req.sessionId,
        companyId,
        action: 'list',
        resource: 'product',
        ipAddress: req.securityContext?.ipAddress,
        userAgent: req.securityContext?.userAgent,
        metadata: { resultCount: result.items.length, filters }
      });

      Logger.info('Products retrieved', {
        userId: req.userId,
        companyId,
        resultCount: result.items.length,
        totalCount: result.totalCount,
        filters
      });
      
      ControllerHelpers.sendPaginatedSuccess(
        res,
        result.items,
        { page, pageSize, totalCount: result.totalCount },
        'Products retrieved successfully',
        {
          filters: filters,
          sorting: { orderBy, sortDirection }
        }
      );

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'ProductController.getAllProducts', req.userId, req.companyId);
    }
  }
  
  static async getProductById(req: EnhancedAuthRequest, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const userRole = req.user?.role;
      const companyId = req.companyId!;
      
      // Check authorization
      const access = BusinessRules.checkResourceAccess(userRole, 'product:read');
      if (!access.allowed) {
        return ControllerHelpers.sendError(res, access.reason || 'Insufficient permissions', 403);
      }

      // Validate product ID format
      if (!id || id.length < 1) {
        return ControllerHelpers.sendError(res, 'Invalid product ID', 400);
      }
      
      const product = await ProductModel.findByIdWithDetails(id, companyId);
      
      if (!product) {
        return ControllerHelpers.sendError(res, 'Product not found', 404);
      }

      // Log data access
      await AuditService.logDataAccess({
        userId: req.userId!,
        sessionId: req.sessionId,
        companyId,
        action: 'read',
        resource: 'product',
        resourceId: id,
        ipAddress: req.securityContext?.ipAddress,
        userAgent: req.securityContext?.userAgent,
        metadata: { productCode: product.code }
      });

      Logger.info('Product retrieved', {
        userId: req.userId,
        productId: id,
        companyId
      });
      
      ControllerHelpers.sendSuccess(res, { product }, 'Product retrieved successfully');

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'ProductController.getProductById', req.userId, req.companyId);
    }
  }
  
  static async createProduct(req: EnhancedAuthRequest, res: Response): Promise<any> {
    try {
      const { 
        code, name, sellerId, brandId, productTypeId, description, 
        weight, volume, criticalStockAmount, unitPrice, currentStock,
        specifications, tags 
      } = req.body;
      const userRole = req.user?.role;
      const companyId = req.companyId!;
      const userId = req.userId!;
      
      // Check authorization
      const access = BusinessRules.checkResourceAccess(userRole, 'product:create');
      if (!access.allowed) {
        return ControllerHelpers.sendError(res, access.reason || 'Insufficient permissions', 403);
      }

      // Comprehensive validation using business rules
      const validationErrors = BusinessRules.validateProductData({
        code,
        name,
        sellerId,
        brandId,
        productTypeId,
        criticalStockAmount,
        weight,
        volume,
        unitPrice,
        description
      });

      // Additional field validations
      if (currentStock !== undefined) {
        const stockErrors = ControllerHelpers.validateNumeric(currentStock, 'currentStock', { min: 0, integer: true });
        validationErrors.push(...stockErrors);
      }

      if (tags && Array.isArray(tags)) {
        const tagErrors = ControllerHelpers.validateArray(tags, 'tags', { maxLength: 10 });
        validationErrors.push(...tagErrors);
      }

      if (validationErrors.length > 0) {
        return ControllerHelpers.sendValidationError(res, validationErrors);
      }

      // Check for duplicate code within company
      const existingProduct = await ProductModel.findByCode(ControllerHelpers.sanitizeString(code), companyId);
      if (existingProduct) {
        return ControllerHelpers.sendError(res, 'Product code already exists', 409, [{
          field: 'code',
          message: 'A product with this code already exists in your company',
          code: 'DUPLICATE_CODE'
        }]);
      }

      // Verify foreign key relationships exist
      const relationshipErrors = await this.validateProductRelationships({
        sellerId,
        brandId,
        productTypeId
      }, companyId);

      if (relationshipErrors.length > 0) {
        return ControllerHelpers.sendValidationError(res, relationshipErrors);
      }
      
      const productData = {
        code: ControllerHelpers.sanitizeString(code),
        name: ControllerHelpers.sanitizeString(name),
        sellerId,
        brandId,
        productTypeId,
        companyId,
        description: description ? ControllerHelpers.sanitizeString(description) : undefined,
        weight,
        volume,
        criticalStockAmount,
        unitPrice,
        currentStock: currentStock || 0,
        specifications: specifications || {},
        tags: tags || [],
        status: 'active',
        created_by: userId
      };

      const product = await ProductModel.createAdvanced(productData);

      // Log data modification
      await AuditService.logDataModification({
        userId,
        sessionId: req.sessionId,
        companyId,
        action: 'create',
        resource: 'product',
        resourceId: product.id,
        newValues: {
          code: product.code,
          name: product.name,
          sellerId: product.sellerId,
          brandId: product.brandId,
          productTypeId: product.productTypeId
        },
        success: true,
        ipAddress: req.securityContext?.ipAddress,
        userAgent: req.securityContext?.userAgent
      });

      Logger.info('Product created', {
        userId,
        productId: product.id,
        productCode: product.code,
        companyId
      });
      
      ControllerHelpers.sendSuccess(res, {
        product: {
          id: product.id,
          code: product.code,
          name: product.name,
          description: product.description,
          status: product.status,
          createdAt: product.created_at,
          createdBy: product.created_by,
          companyId: product.companyId
        }
      }, 'Product created successfully', 201);

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'ProductController.createProduct', req.userId, req.companyId);
    }
  }
  
  static async updateProduct(req: EnhancedAuthRequest, res: Response): Promise<any> {
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
      
      // Get old values before update for audit
      const oldProduct = await ProductModel.findById(id, companyId);
      
      const updatedProduct = await ProductModel.update(id, companyId, updateData);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Log data modification
      await AuditService.logDataModification({
        userId,
        sessionId: req.sessionId,
        companyId,
        action: 'update',
        resource: 'product',
        resourceId: id,
        oldValues: oldProduct ? {
          code: oldProduct.code,
          name: oldProduct.name,
          description: oldProduct.description,
          weight: oldProduct.weight,
          volume: oldProduct.volume
        } : undefined,
        newValues: updateData,
        success: true,
        ipAddress: req.securityContext?.ipAddress,
        userAgent: req.securityContext?.userAgent
      });
      
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  static async deleteProduct(req: EnhancedAuthRequest, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const companyId = req.companyId!;
      
      // Get product details before deletion for audit
      const product = await ProductModel.findById(id, companyId);
      
      const deleted = await ProductModel.softDelete(id, companyId);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Log data modification
      await AuditService.logDataModification({
        userId: req.userId!,
        sessionId: req.sessionId,
        companyId,
        action: 'delete',
        resource: 'product',
        resourceId: id,
        oldValues: product ? {
          code: product.code,
          name: product.name,
          status: product.status
        } : undefined,
        success: true,
        ipAddress: req.securityContext?.ipAddress,
        userAgent: req.securityContext?.userAgent
      });
      
      res.json({
        message: 'Product deactivated',
        productId: id,
        deletedDate: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async bulkUpdateStatus(req: EnhancedAuthRequest, res: Response): Promise<any> {
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
      
      // Log bulk data modification
      await AuditService.logDataModification({
        userId: req.userId!,
        sessionId: req.sessionId,
        companyId,
        action: 'bulk_update',
        resource: 'product',
        newValues: { updates, affectedIds: ids },
        success: true,
        ipAddress: req.securityContext?.ipAddress,
        userAgent: req.securityContext?.userAgent,
        metadata: { updatedCount }
      });
      
      res.json({
        message: `${updatedCount} products updated`,
        updatedCount
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async uploadPhoto(req: EnhancedAuthRequest, res: Response): Promise<any> {
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
      
      // Log data modification for photo upload
      await AuditService.logDataModification({
        userId: req.userId!,
        sessionId: req.sessionId,
        companyId,
        action: 'update',
        resource: 'product_photo',
        resourceId: id,
        newValues: {
          photoUrl,
          filename: req.file.filename,
          size: req.file.size
        },
        success: true,
        ipAddress: req.securityContext?.ipAddress,
        userAgent: req.securityContext?.userAgent
      });
      
      ControllerHelpers.sendSuccess(res, {
        photoUrl,
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        productId: id
      }, 'Photo uploaded successfully');

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'ProductController.uploadPhoto', req.userId, req.companyId);
    }
  }

  /**
   * Helper method to validate product relationships
   */
  private static async validateProductRelationships(
    data: { sellerId?: number; brandId?: number; productTypeId?: number },
    companyId: number
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    try {
      // Validate seller exists (if provided)
      if (data.sellerId) {
        const seller = await ProductModel.validateSeller(data.sellerId, companyId);
        if (!seller) {
          errors.push({
            field: 'sellerId',
            message: 'Seller not found or not accessible',
            code: 'INVALID_SELLER'
          });
        }
      }

      // Validate brand exists (if provided)
      if (data.brandId) {
        const brand = await ProductModel.validateBrand(data.brandId, companyId);
        if (!brand) {
          errors.push({
            field: 'brandId',
            message: 'Brand not found or not accessible',
            code: 'INVALID_BRAND'
          });
        }
      }

      // Validate product type exists (if provided)
      if (data.productTypeId) {
        const productType = await ProductModel.validateProductType(data.productTypeId, companyId);
        if (!productType) {
          errors.push({
            field: 'productTypeId',
            message: 'Product type not found or not accessible',
            code: 'INVALID_PRODUCT_TYPE'
          });
        }
      }
    } catch (error) {
      // If validation queries fail, treat as validation errors
      errors.push({
        field: 'relationships',
        message: 'Failed to validate product relationships',
        code: 'VALIDATION_ERROR'
      });
    }

    return errors;
  }
}