import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ProductModel } from '../models/product.model';
import { ControllerHelpers } from '../utils/controller-helpers';
import { BusinessRules } from '../utils/business-rules';
import { Logger } from '../startup';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

export class UploadController {
  /**
   * Upload product photo with validation and processing
   */
  static async uploadProductPhoto(req: AuthRequest, res: Response): Promise<any> {
    try {
      const { id: productId } = req.params;
      const userRole = req.user?.role;
      const companyId = req.companyId!;
      const userId = req.userId!;
      
      // Check authorization
      const access = BusinessRules.checkResourceAccess(userRole, 'product:update');
      if (!access.allowed) {
        return ControllerHelpers.sendError(res, access.reason || 'Insufficient permissions', 403);
      }

      if (!req.file) {
        return ControllerHelpers.sendError(res, 'No file uploaded', 400);
      }

      // Validate file using business rules
      const fileErrors = BusinessRules.validateFileUpload(req.file, {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
      });

      if (fileErrors.length > 0) {
        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return ControllerHelpers.sendValidationError(res, fileErrors);
      }

      // Verify product exists and belongs to user's company
      const product = await ProductModel.findById(productId, companyId);
      if (!product) {
        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return ControllerHelpers.sendError(res, 'Product not found', 404);
      }

      // Process image with multiple sizes
      const uploadDir = path.join(process.cwd(), 'uploads', 'products');
      const fileBaseName = `${productId}_${Date.now()}`;
      
      // Ensure upload directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const processedImages = {
        original: null as string | null,
        large: null as string | null,
        medium: null as string | null,
        thumbnail: null as string | null
      };

      try {
        // Original size (optimized)
        const originalPath = path.join(uploadDir, `${fileBaseName}_original.webp`);
        await sharp(req.file.path)
          .webp({ quality: 90 })
          .toFile(originalPath);
        processedImages.original = `/uploads/products/${fileBaseName}_original.webp`;

        // Large size (1200px max width)
        const largePath = path.join(uploadDir, `${fileBaseName}_large.webp`);
        await sharp(req.file.path)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(largePath);
        processedImages.large = `/uploads/products/${fileBaseName}_large.webp`;

        // Medium size (600px max width)
        const mediumPath = path.join(uploadDir, `${fileBaseName}_medium.webp`);
        await sharp(req.file.path)
          .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(mediumPath);
        processedImages.medium = `/uploads/products/${fileBaseName}_medium.webp`;

        // Thumbnail (150px max width)
        const thumbnailPath = path.join(uploadDir, `${fileBaseName}_thumb.webp`);
        await sharp(req.file.path)
          .resize(150, 150, { fit: 'cover' })
          .webp({ quality: 75 })
          .toFile(thumbnailPath);
        processedImages.thumbnail = `/uploads/products/${fileBaseName}_thumb.webp`;

        // Clean up original uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        Logger.info('Product photo uploaded and processed', {
          userId,
          productId,
          companyId,
          originalName: req.file.originalname,
          originalSize: req.file.size,
          processedImages: Object.keys(processedImages)
        });

        ControllerHelpers.sendSuccess(res, {
          productId,
          images: processedImages,
          metadata: {
            originalName: req.file.originalname,
            originalSize: req.file.size,
            mimeType: req.file.mimetype,
            uploadedBy: userId,
            uploadedAt: new Date().toISOString()
          }
        }, 'Photo uploaded and processed successfully');

      } catch (processingError: any) {
        // Clean up any partially created files
        Object.values(processedImages).forEach(imagePath => {
          if (imagePath) {
            const fullPath = path.join(process.cwd(), imagePath.substring(1));
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          }
        });

        // Clean up original uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }

        throw new Error(`Image processing failed: ${processingError.message}`);
      }

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'UploadController.uploadProductPhoto', req.userId, req.companyId);
    }
  }

  /**
   * Upload quality check attachment
   */
  static async uploadQualityCheckAttachment(req: AuthRequest, res: Response): Promise<any> {
    try {
      const { id: qualityCheckId } = req.params;
      const userRole = req.user?.role;
      const userId = req.userId!;
      
      // Check authorization
      const access = BusinessRules.checkResourceAccess(userRole, 'quality_check:update');
      if (!access.allowed) {
        return ControllerHelpers.sendError(res, access.reason || 'Insufficient permissions', 403);
      }

      if (!req.file) {
        return ControllerHelpers.sendError(res, 'No file uploaded', 400);
      }

      // Validate file for quality check attachments (more permissive than product photos)
      const fileErrors = BusinessRules.validateFileUpload(req.file, {
        maxSize: 25 * 1024 * 1024, // 25MB for quality check documents
        allowedTypes: [
          'image/jpeg', 'image/png', 'image/webp',
          'application/pdf', 'text/plain', 'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ],
        allowedExtensions: [
          '.jpg', '.jpeg', '.png', '.webp', '.pdf', '.txt', '.csv', '.xls', '.xlsx'
        ]
      });

      if (fileErrors.length > 0) {
        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return ControllerHelpers.sendValidationError(res, fileErrors);
      }

      // Create attachment directory
      const attachmentDir = path.join(process.cwd(), 'uploads', 'quality-checks', qualityCheckId);
      if (!fs.existsSync(attachmentDir)) {
        fs.mkdirSync(attachmentDir, { recursive: true });
      }

      // Generate unique filename
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}${fileExtension}`;
      const finalPath = path.join(attachmentDir, fileName);

      // Move file to final location
      fs.renameSync(req.file.path, finalPath);

      const attachmentUrl = `/uploads/quality-checks/${qualityCheckId}/${fileName}`;

      Logger.info('Quality check attachment uploaded', {
        userId,
        qualityCheckId,
        fileName: req.file.originalname,
        size: req.file.size,
        attachmentUrl
      });

      ControllerHelpers.sendSuccess(res, {
        qualityCheckId,
        attachment: {
          url: attachmentUrl,
          fileName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString()
        }
      }, 'Attachment uploaded successfully');

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'UploadController.uploadQualityCheckAttachment', req.userId, req.companyId);
    }
  }

  /**
   * Delete uploaded file
   */
  static async deleteFile(req: AuthRequest, res: Response): Promise<any> {
    try {
      const { filePath } = req.body;
      const userRole = req.user?.role;
      
      // Only admin or manager can delete files
      if (!['admin', 'manager'].includes(userRole)) {
        return ControllerHelpers.sendError(res, 'Insufficient permissions', 403);
      }

      if (!filePath || typeof filePath !== 'string') {
        return ControllerHelpers.sendError(res, 'File path is required', 400);
      }

      // Security check: ensure path is within uploads directory
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const fullPath = path.join(process.cwd(), filePath.substring(1)); // Remove leading slash
      
      if (!fullPath.startsWith(uploadsDir)) {
        return ControllerHelpers.sendError(res, 'Invalid file path', 400);
      }

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        
        Logger.info('File deleted', {
          userId: req.userId,
          filePath,
          deletedBy: req.userId
        });

        ControllerHelpers.sendSuccess(res, null, 'File deleted successfully');
      } else {
        ControllerHelpers.sendError(res, 'File not found', 404);
      }

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'UploadController.deleteFile', req.userId, req.companyId);
    }
  }

  /**
   * Get file info and metadata
   */
  static async getFileInfo(req: AuthRequest, res: Response): Promise<any> {
    try {
      const { filePath } = req.params;
      const userRole = req.user?.role;
      
      // Check basic read permissions
      const access = BusinessRules.checkResourceAccess(userRole, 'product:read');
      if (!access.allowed) {
        return ControllerHelpers.sendError(res, access.reason || 'Insufficient permissions', 403);
      }

      if (!filePath) {
        return ControllerHelpers.sendError(res, 'File path is required', 400);
      }

      const decodedPath = decodeURIComponent(filePath);
      const fullPath = path.join(process.cwd(), 'uploads', decodedPath);
      
      // Security check
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fullPath.startsWith(uploadsDir)) {
        return ControllerHelpers.sendError(res, 'Invalid file path', 400);
      }

      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        const extension = path.extname(fullPath).toLowerCase();
        const fileName = path.basename(fullPath);

        ControllerHelpers.sendSuccess(res, {
          fileName,
          filePath: `/uploads/${decodedPath}`,
          size: stats.size,
          lastModified: stats.mtime,
          extension,
          isImage: ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(extension),
          isDocument: ['.pdf', '.txt', '.csv', '.xls', '.xlsx', '.doc', '.docx'].includes(extension)
        }, 'File info retrieved successfully');
      } else {
        ControllerHelpers.sendError(res, 'File not found', 404);
      }

    } catch (error) {
      ControllerHelpers.handleError(res, error, 'UploadController.getFileInfo', req.userId, req.companyId);
    }
  }
}