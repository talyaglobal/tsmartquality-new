import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ProductModel } from '../models/product.model';
import { ControllerHelpers, ValidationError } from '../utils/controller-helpers';
import { BusinessRules } from '../utils/business-rules';
import { Logger } from '../startup';
import { executeTransaction } from '../database/index';

export interface BulkOperationResult {
  totalRequested: number;
  successful: number;
  failed: number;
  errors: Array<{
    index: number;
    item: any;
    error: string;
  }>;
  successfulItems: Array<{
    index: number;
    item: any;
    result: any;
  }>;
}

export class BulkOperationsController {
  /**
   * Bulk create products with transaction support
   */
  static async bulkCreateProducts(req: AuthRequest, res: Response): Promise<any> {
    try {
      const { products } = req.body;
      const userRole = req.user?.role;
      const companyId = req.companyId!;
      const userId = req.userId!;
      
      // Check authorization
      const access = BusinessRules.checkResourceAccess(userRole, 'product:create');
      if (!access.allowed) {
        return ControllerHelpers.sendError(res, access.reason || 'Insufficient permissions', 403);
      }

      // Validate bulk operation constraints
      const bulkErrors = BusinessRules.validateBulkOperation(products, 100); // Max 100 products per batch
      if (bulkErrors.length > 0) {
        return ControllerHelpers.sendValidationError(res, bulkErrors);
      }

      const result: BulkOperationResult = {
        totalRequested: products.length,
        successful: 0,
        failed: 0,
        errors: [],
        successfulItems: []
      };

      // Process in transaction to ensure consistency
      await executeTransaction(async (client) => {
        for (let i = 0; i < products.length; i++) {
          const productData = products[i];
          
          try {
            // Validate each product
            const validationErrors = BusinessRules.validateProductData({
              code: productData.code,
              name: productData.name,
              sellerId: productData.sellerId,
              brandId: productData.brandId,
              productTypeId: productData.productTypeId,
              criticalStockAmount: productData.criticalStockAmount,
              weight: productData.weight,
              volume: productData.volume,
              unitPrice: productData.unitPrice,
              description: productData.description
            });

            if (validationErrors.length > 0) {
              throw new Error(`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`);
            }

            // Check for duplicate code
            const existingProduct = await ProductModel.findByCode(
              ControllerHelpers.sanitizeString(productData.code), 
              companyId
            );
            if (existingProduct) {
              throw new Error(`Product code '${productData.code}' already exists`);
            }

            // Create product
            const newProductData = {
              code: ControllerHelpers.sanitizeString(productData.code),
              name: ControllerHelpers.sanitizeString(productData.name),
              sellerId: productData.sellerId,
              brandId: productData.brandId,
              productTypeId: productData.productTypeId,
              companyId,
              description: productData.description ? ControllerHelpers.sanitizeString(productData.description) : undefined,
              weight: productData.weight,
              volume: productData.volume,
              criticalStockAmount: productData.criticalStockAmount,
              unitPrice: productData.unitPrice,
              currentStock: productData.currentStock || 0,
              specifications: productData.specifications || {},
              tags: productData.tags || [],
              status: 'active',
              created_by: userId
            };

            const createdProduct = await ProductModel.createAdvanced(newProductData);

            result.successful++;
            result.successfulItems.push({
              index: i,
              item: productData,
              result: {
                id: createdProduct.id,
                code: createdProduct.code,
                name: createdProduct.name
              }
            });

          } catch (error: any) {
            result.failed++;
            result.errors.push({
              index: i,
              item: productData,
              error: error.message
            });
          }
        }

        // If more than 50% failed, rollback transaction
        if (result.failed > result.totalRequested * 0.5) {
          throw new Error('Too many failures in bulk operation, rolling back transaction');
        }
      });

      Logger.info('Bulk product creation completed', {
        userId,
        companyId,
        totalRequested: result.totalRequested,
        successful: result.successful,
        failed: result.failed
      });

      ControllerHelpers.sendSuccess(res, result, 'Bulk product creation completed', 201);

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'BulkOperationsController.bulkCreateProducts', req.userId, req.companyId);
    }
  }

  /**
   * Bulk update product status/fields
   */
  static async bulkUpdateProducts(req: AuthRequest, res: Response): Promise<any> {
    try {
      const { productIds, updates } = req.body;
      const userRole = req.user?.role;
      const companyId = req.companyId!;
      const userId = req.userId!;
      
      // Check authorization
      const access = BusinessRules.checkResourceAccess(userRole, 'product:update');
      if (!access.allowed) {
        return ControllerHelpers.sendError(res, access.reason || 'Insufficient permissions', 403);
      }

      // Validate inputs
      const validationErrors: ValidationError[] = [];
      
      // Validate product IDs array
      const idErrors = ControllerHelpers.validateArray(productIds, 'productIds', { 
        minLength: 1, 
        maxLength: 1000, 
        uniqueItems: true 
      });
      validationErrors.push(...idErrors);

      // Validate updates object
      if (!updates || Object.keys(updates).length === 0) {
        validationErrors.push({
          field: 'updates',
          message: 'Updates object is required and cannot be empty',
          code: 'REQUIRED'
        });
      }

      if (validationErrors.length > 0) {
        return ControllerHelpers.sendValidationError(res, validationErrors);
      }

      // Sanitize and validate update fields
      const sanitizedUpdates: any = { updated_by: userId };
      const allowedFields = ['status', 'critical_stock_amount', 'unit_price', 'current_stock', 'tags'];

      for (const [field, value] of Object.entries(updates)) {
        if (!allowedFields.includes(field)) {
          return ControllerHelpers.sendError(res, `Field '${field}' is not allowed for bulk updates`, 400);
        }

        if (field === 'status') {
          const statusError = ControllerHelpers.validateEnum(value as string, 'status', ['active', 'inactive', 'discontinued']);
          if (statusError) {
            return ControllerHelpers.sendValidationError(res, [statusError]);
          }
          sanitizedUpdates[field] = value;
        } else if (['critical_stock_amount', 'unit_price', 'current_stock'].includes(field)) {
          const numericErrors = ControllerHelpers.validateNumeric(value, field, { min: 0 });
          if (numericErrors.length > 0) {
            return ControllerHelpers.sendValidationError(res, numericErrors);
          }
          sanitizedUpdates[field] = value;
        } else if (field === 'tags') {
          if (Array.isArray(value)) {
            const tagErrors = ControllerHelpers.validateArray(value, 'tags', { maxLength: 10 });
            if (tagErrors.length > 0) {
              return ControllerHelpers.sendValidationError(res, tagErrors);
            }
            sanitizedUpdates[field] = JSON.stringify(value);
          }
        }
      }

      const updatedCount = await ProductModel.bulkUpdateStatus(productIds, companyId, sanitizedUpdates);

      Logger.info('Bulk product update completed', {
        userId,
        companyId,
        productIds: productIds.length,
        updatedCount,
        updates: Object.keys(sanitizedUpdates)
      });

      ControllerHelpers.sendSuccess(res, {
        totalRequested: productIds.length,
        updated: updatedCount,
        updates: sanitizedUpdates
      }, `${updatedCount} products updated successfully`);

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'BulkOperationsController.bulkUpdateProducts', req.userId, req.companyId);
    }
  }

  /**
   * Bulk delete (soft delete) products
   */
  static async bulkDeleteProducts(req: AuthRequest, res: Response): Promise<any> {
    try {
      const { productIds, confirmationCode } = req.body;
      const userRole = req.user?.role;
      const companyId = req.companyId!;
      const userId = req.userId!;
      
      // Check authorization
      const access = BusinessRules.checkResourceAccess(userRole, 'product:delete');
      if (!access.allowed) {
        return ControllerHelpers.sendError(res, access.reason || 'Insufficient permissions', 403);
      }

      // Require confirmation for bulk delete
      if (confirmationCode !== 'CONFIRM_BULK_DELETE') {
        return ControllerHelpers.sendError(res, 'Invalid confirmation code for bulk delete operation', 400);
      }

      // Validate product IDs array
      const idErrors = ControllerHelpers.validateArray(productIds, 'productIds', { 
        minLength: 1, 
        maxLength: 500, // Limit bulk delete to 500 items
        uniqueItems: true 
      });

      if (idErrors.length > 0) {
        return ControllerHelpers.sendValidationError(res, idErrors);
      }

      const result: BulkOperationResult = {
        totalRequested: productIds.length,
        successful: 0,
        failed: 0,
        errors: [],
        successfulItems: []
      };

      // Process deletions
      await executeTransaction(async (client) => {
        for (let i = 0; i < productIds.length; i++) {
          const productId = productIds[i];
          
          try {
            const deleted = await ProductModel.softDelete(productId, companyId);
            
            if (deleted) {
              result.successful++;
              result.successfulItems.push({
                index: i,
                item: productId,
                result: { deleted: true }
              });
            } else {
              throw new Error('Product not found or already deleted');
            }

          } catch (error: any) {
            result.failed++;
            result.errors.push({
              index: i,
              item: productId,
              error: error.message
            });
          }
        }
      });

      Logger.warn('Bulk product deletion completed', {
        userId,
        companyId,
        totalRequested: result.totalRequested,
        successful: result.successful,
        failed: result.failed
      });

      ControllerHelpers.sendSuccess(res, result, 'Bulk product deletion completed');

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'BulkOperationsController.bulkDeleteProducts', req.userId, req.companyId);
    }
  }

  /**
   * Export products to CSV/JSON
   */
  static async exportProducts(req: AuthRequest, res: Response): Promise<any> {
    try {
      const { format = 'csv', filters = {} } = req.query;
      const userRole = req.user?.role;
      const companyId = req.companyId!;
      
      // Check authorization
      const access = BusinessRules.checkResourceAccess(userRole, 'product:read');
      if (!access.allowed) {
        return ControllerHelpers.sendError(res, access.reason || 'Insufficient permissions', 403);
      }

      // Validate format
      if (!['csv', 'json'].includes(format as string)) {
        return ControllerHelpers.sendError(res, 'Format must be csv or json', 400);
      }

      // Get products for export (no pagination for export)
      const result = await ProductModel.findAllAdvanced(
        companyId, 
        1, 
        10000, // Large limit for export
        0,
        filters,
        'created_at',
        'ASC'
      );

      if (format === 'csv') {
        // Generate CSV
        const csvHeaders = [
          'ID', 'Code', 'Name', 'Description', 'Seller', 'Brand', 'Product Type',
          'Weight', 'Volume', 'Critical Stock', 'Unit Price', 'Current Stock', 
          'Status', 'Created At'
        ];

        const csvRows = result.items.map(product => [
          product.id,
          product.code,
          product.name,
          product.description || '',
          product.seller_name || '',
          product.brand_name || '',
          product.product_type_name || '',
          product.weight || '',
          product.volume || '',
          product.criticalStockAmount || '',
          product.unitPrice || '',
          product.currentStock || '',
          product.status || '',
          product.created_at
        ]);

        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
          .join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="products_${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);

      } else {
        // Return JSON
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="products_${new Date().toISOString().split('T')[0]}.json"`);
        
        ControllerHelpers.sendSuccess(res, {
          exportDate: new Date().toISOString(),
          totalProducts: result.totalCount,
          products: result.items
        }, 'Products exported successfully');
      }

      Logger.info('Products exported', {
        userId: req.userId,
        companyId,
        format,
        count: result.items.length
      });

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'BulkOperationsController.exportProducts', req.userId, req.companyId);
    }
  }
}