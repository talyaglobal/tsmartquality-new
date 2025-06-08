import { Request, Response } from 'express';
import { QualityCheckModel } from '../models/quality-check.model';
import { ProductModel } from '../models/product.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { ControllerHelpers, ValidationError } from '../utils/controller-helpers';
import { BusinessRules } from '../utils/business-rules';
import { Logger } from '../startup';

export class QualityCheckController {
  static async getAllQualityChecks(req: AuthRequest, res: Response): Promise<any> {
    try {
      const userRole = req.user?.role;
      const companyId = req.companyId!;
      const userId = req.userId!;
      
      // Check authorization
      const access = BusinessRules.checkResourceAccess(userRole, 'quality_check:read');
      if (!access.allowed) {
        return ControllerHelpers.sendError(res, access.reason || 'Insufficient permissions', 403);
      }

      const { page, pageSize, offset } = ControllerHelpers.parsePagination(req.query);
      const { orderBy, sortDirection } = ControllerHelpers.parseSorting(req.query, [
        'check_date', 'status', 'overall_grade', 'score', 'created_at'
      ]);

      // Extract and validate filters
      const filters: any = {};
      
      if (req.query.productId) {
        filters.productId = req.query.productId;
      }

      if (req.query.inspectorId) {
        filters.inspectorId = req.query.inspectorId;
      }

      if (req.query.status) {
        const statusError = ControllerHelpers.validateEnum(
          req.query.status as string, 
          'status', 
          ['pending', 'in_progress', 'passed', 'failed', 'conditional']
        );
        if (statusError) {
          return ControllerHelpers.sendValidationError(res, [statusError]);
        }
        filters.status = req.query.status;
      }

      if (req.query.checkType) {
        const typeError = ControllerHelpers.validateEnum(
          req.query.checkType as string, 
          'checkType', 
          ['incoming', 'in_process', 'final', 'random']
        );
        if (typeError) {
          return ControllerHelpers.sendValidationError(res, [typeError]);
        }
        filters.checkType = req.query.checkType;
      }

      if (req.query.overallGrade) {
        const gradeError = ControllerHelpers.validateEnum(
          req.query.overallGrade as string, 
          'overallGrade', 
          ['A', 'B', 'C', 'D', 'F']
        );
        if (gradeError) {
          return ControllerHelpers.sendValidationError(res, [gradeError]);
        }
        filters.overallGrade = req.query.overallGrade;
      }

      // Date range filters
      if (req.query.dateFrom) {
        filters.dateFrom = req.query.dateFrom;
      }

      if (req.query.dateTo) {
        filters.dateTo = req.query.dateTo;
      }

      // For inspectors, only show their own quality checks
      if (userRole === 'inspector') {
        filters.inspectorId = userId;
      }

      const result = await QualityCheckModel.findAllAdvanced(
        companyId,
        page,
        pageSize,
        offset,
        filters,
        orderBy,
        sortDirection
      );

      Logger.info('Quality checks retrieved', {
        userId,
        companyId,
        resultCount: result.items.length,
        totalCount: result.totalCount,
        filters
      });

      ControllerHelpers.sendPaginatedSuccess(
        res,
        result.items,
        { page, pageSize, totalCount: result.totalCount },
        'Quality checks retrieved successfully',
        {
          filters: filters,
          sorting: { orderBy, sortDirection }
        }
      );

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'QualityCheckController.getAllQualityChecks', req.userId, req.companyId);
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
      const { 
        product_id, check_type, check_date, status, overall_grade, 
        score, notes, measurements, attachments 
      } = req.body;
      const userRole = req.user?.role;
      const inspector_id = req.userId!;
      const companyId = req.companyId!;
      
      // Check authorization
      const access = BusinessRules.checkResourceAccess(userRole, 'quality_check:create');
      if (!access.allowed) {
        return ControllerHelpers.sendError(res, access.reason || 'Insufficient permissions', 403);
      }

      // Comprehensive validation using business rules
      const validationErrors = BusinessRules.validateQualityCheckData({
        productId: product_id,
        checkType: check_type,
        status,
        overallGrade: overall_grade,
        score,
        notes,
        checkDate: check_date ? new Date(check_date) : new Date()
      });

      if (validationErrors.length > 0) {
        return ControllerHelpers.sendValidationError(res, validationErrors);
      }
      
      // Validate product exists and belongs to company
      const product = await ProductModel.findById(product_id, companyId);
      if (!product) {
        return ControllerHelpers.sendError(res, 'Product not found', 404);
      }

      // Validate attachments if provided
      if (attachments && Array.isArray(attachments)) {
        const attachmentErrors = ControllerHelpers.validateArray(attachments, 'attachments', { maxLength: 10 });
        if (attachmentErrors.length > 0) {
          return ControllerHelpers.sendValidationError(res, attachmentErrors);
        }
      }
      
      const qualityCheckData = {
        product_id,
        inspector_id,
        check_type: check_type || 'incoming',
        status: status || 'pending',
        overall_grade,
        score,
        check_date: check_date ? new Date(check_date) : new Date(),
        notes: notes ? ControllerHelpers.sanitizeString(notes) : undefined,
        measurements: measurements || {},
        attachments: attachments || [],
        company_id: companyId
      };

      const qualityCheck = await QualityCheckModel.createAdvanced(qualityCheckData);

      Logger.info('Quality check created', {
        userId: inspector_id,
        qualityCheckId: qualityCheck.id,
        productId: product_id,
        companyId
      });
      
      ControllerHelpers.sendSuccess(res, {
        qualityCheck: {
          id: qualityCheck.id,
          productId: qualityCheck.product_id,
          checkType: qualityCheck.check_type,
          status: qualityCheck.status,
          overallGrade: qualityCheck.overall_grade,
          score: qualityCheck.score,
          checkDate: qualityCheck.check_date,
          createdAt: qualityCheck.created_at
        }
      }, 'Quality check created successfully', 201);

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'QualityCheckController.createQualityCheck', req.userId, req.companyId);
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