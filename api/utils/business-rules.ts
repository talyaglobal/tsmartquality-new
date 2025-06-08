import { ValidationError } from './controller-helpers';

export interface ProductData {
  code?: string;
  name?: string;
  sellerId?: number;
  brandId?: number;
  productTypeId?: number;
  criticalStockAmount?: number;
  weight?: number;
  volume?: number;
  unitPrice?: number;
  description?: string;
}

export interface QualityCheckData {
  productId?: string;
  inspectorId?: string;
  checkType?: string;
  status?: string;
  overallGrade?: string;
  score?: number;
  notes?: string;
  checkDate?: Date;
}

export interface UserData {
  username?: string;
  name?: string;
  surname?: string;
  email?: string;
  password?: string;
  role?: string;
  companyId?: number;
}

export class BusinessRules {
  /**
   * Validate product creation/update data
   */
  static validateProductData(data: ProductData, isUpdate = false): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required fields for creation
    if (!isUpdate) {
      if (!data.code) {
        errors.push({
          field: 'code',
          message: 'Product code is required',
          code: 'REQUIRED'
        });
      }

      if (!data.name) {
        errors.push({
          field: 'name',
          message: 'Product name is required',
          code: 'REQUIRED'
        });
      }

      if (!data.sellerId) {
        errors.push({
          field: 'sellerId',
          message: 'Seller ID is required',
          code: 'REQUIRED'
        });
      }

      if (!data.brandId) {
        errors.push({
          field: 'brandId',
          message: 'Brand ID is required',
          code: 'REQUIRED'
        });
      }

      if (data.criticalStockAmount === undefined) {
        errors.push({
          field: 'criticalStockAmount',
          message: 'Critical stock amount is required',
          code: 'REQUIRED'
        });
      }
    }

    // Product code validation
    if (data.code) {
      if (data.code.length < 3) {
        errors.push({
          field: 'code',
          message: 'Product code must be at least 3 characters long',
          code: 'TOO_SHORT'
        });
      }

      if (data.code.length > 50) {
        errors.push({
          field: 'code',
          message: 'Product code cannot exceed 50 characters',
          code: 'TOO_LONG'
        });
      }

      if (!/^[A-Z0-9_-]+$/i.test(data.code)) {
        errors.push({
          field: 'code',
          message: 'Product code can only contain letters, numbers, underscores, and hyphens',
          code: 'INVALID_FORMAT'
        });
      }
    }

    // Product name validation
    if (data.name) {
      if (data.name.length < 3) {
        errors.push({
          field: 'name',
          message: 'Product name must be at least 3 characters long',
          code: 'TOO_SHORT'
        });
      }

      if (data.name.length > 300) {
        errors.push({
          field: 'name',
          message: 'Product name cannot exceed 300 characters',
          code: 'TOO_LONG'
        });
      }
    }

    // Critical stock amount validation
    if (data.criticalStockAmount !== undefined) {
      if (data.criticalStockAmount < 0) {
        errors.push({
          field: 'criticalStockAmount',
          message: 'Critical stock amount cannot be negative',
          code: 'NEGATIVE_VALUE'
        });
      }

      if (data.criticalStockAmount > 1000000) {
        errors.push({
          field: 'criticalStockAmount',
          message: 'Critical stock amount cannot exceed 1,000,000',
          code: 'ABOVE_MAXIMUM'
        });
      }
    }

    // Weight validation
    if (data.weight !== undefined) {
      if (data.weight < 0) {
        errors.push({
          field: 'weight',
          message: 'Weight cannot be negative',
          code: 'NEGATIVE_VALUE'
        });
      }

      if (data.weight > 50000) {
        errors.push({
          field: 'weight',
          message: 'Weight cannot exceed 50,000 kg',
          code: 'ABOVE_MAXIMUM'
        });
      }
    }

    // Volume validation
    if (data.volume !== undefined) {
      if (data.volume < 0) {
        errors.push({
          field: 'volume',
          message: 'Volume cannot be negative',
          code: 'NEGATIVE_VALUE'
        });
      }

      if (data.volume > 1000000) {
        errors.push({
          field: 'volume',
          message: 'Volume cannot exceed 1,000,000 cubic units',
          code: 'ABOVE_MAXIMUM'
        });
      }
    }

    // Unit price validation
    if (data.unitPrice !== undefined) {
      if (data.unitPrice < 0) {
        errors.push({
          field: 'unitPrice',
          message: 'Unit price cannot be negative',
          code: 'NEGATIVE_VALUE'
        });
      }

      if (data.unitPrice > 1000000) {
        errors.push({
          field: 'unitPrice',
          message: 'Unit price cannot exceed 1,000,000',
          code: 'ABOVE_MAXIMUM'
        });
      }
    }

    // Description validation
    if (data.description && data.description.length > 1000) {
      errors.push({
        field: 'description',
        message: 'Description cannot exceed 1000 characters',
        code: 'TOO_LONG'
      });
    }

    return errors;
  }

  /**
   * Validate quality check data
   */
  static validateQualityCheckData(data: QualityCheckData, isUpdate = false): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required fields for creation
    if (!isUpdate) {
      if (!data.productId) {
        errors.push({
          field: 'productId',
          message: 'Product ID is required',
          code: 'REQUIRED'
        });
      }

      if (!data.checkType) {
        errors.push({
          field: 'checkType',
          message: 'Check type is required',
          code: 'REQUIRED'
        });
      }

      if (!data.status) {
        errors.push({
          field: 'status',
          message: 'Status is required',
          code: 'REQUIRED'
        });
      }
    }

    // Check type validation
    if (data.checkType) {
      const validCheckTypes = ['incoming', 'in_process', 'final', 'random'];
      if (!validCheckTypes.includes(data.checkType)) {
        errors.push({
          field: 'checkType',
          message: `Check type must be one of: ${validCheckTypes.join(', ')}`,
          code: 'INVALID_ENUM'
        });
      }
    }

    // Status validation
    if (data.status) {
      const validStatuses = ['pending', 'in_progress', 'passed', 'failed', 'conditional'];
      if (!validStatuses.includes(data.status)) {
        errors.push({
          field: 'status',
          message: `Status must be one of: ${validStatuses.join(', ')}`,
          code: 'INVALID_ENUM'
        });
      }
    }

    // Overall grade validation
    if (data.overallGrade) {
      const validGrades = ['A', 'B', 'C', 'D', 'F'];
      if (!validGrades.includes(data.overallGrade)) {
        errors.push({
          field: 'overallGrade',
          message: `Overall grade must be one of: ${validGrades.join(', ')}`,
          code: 'INVALID_ENUM'
        });
      }
    }

    // Score validation
    if (data.score !== undefined) {
      if (data.score < 0) {
        errors.push({
          field: 'score',
          message: 'Score cannot be negative',
          code: 'NEGATIVE_VALUE'
        });
      }

      if (data.score > 100) {
        errors.push({
          field: 'score',
          message: 'Score cannot exceed 100',
          code: 'ABOVE_MAXIMUM'
        });
      }
    }

    // Notes validation
    if (data.notes && data.notes.length > 2000) {
      errors.push({
        field: 'notes',
        message: 'Notes cannot exceed 2000 characters',
        code: 'TOO_LONG'
      });
    }

    // Check date validation
    if (data.checkDate) {
      const now = new Date();
      const maxFutureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      if (data.checkDate > maxFutureDate) {
        errors.push({
          field: 'checkDate',
          message: 'Check date cannot be more than 7 days in the future',
          code: 'DATE_TOO_FUTURE'
        });
      }

      const minPastDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
      if (data.checkDate < minPastDate) {
        errors.push({
          field: 'checkDate',
          message: 'Check date cannot be more than 1 year in the past',
          code: 'DATE_TOO_PAST'
        });
      }
    }

    return errors;
  }

  /**
   * Validate user registration/update data
   */
  static validateUserData(data: UserData, isUpdate = false): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required fields for creation
    if (!isUpdate) {
      if (!data.username) {
        errors.push({
          field: 'username',
          message: 'Username is required',
          code: 'REQUIRED'
        });
      }

      if (!data.name) {
        errors.push({
          field: 'name',
          message: 'Name is required',
          code: 'REQUIRED'
        });
      }

      if (!data.surname) {
        errors.push({
          field: 'surname',
          message: 'Surname is required',
          code: 'REQUIRED'
        });
      }

      if (!data.email) {
        errors.push({
          field: 'email',
          message: 'Email is required',
          code: 'REQUIRED'
        });
      }

      if (!data.password) {
        errors.push({
          field: 'password',
          message: 'Password is required',
          code: 'REQUIRED'
        });
      }

      if (!data.companyId) {
        errors.push({
          field: 'companyId',
          message: 'Company ID is required',
          code: 'REQUIRED'
        });
      }
    }

    // Username validation
    if (data.username) {
      if (data.username.length < 3) {
        errors.push({
          field: 'username',
          message: 'Username must be at least 3 characters long',
          code: 'TOO_SHORT'
        });
      }

      if (data.username.length > 50) {
        errors.push({
          field: 'username',
          message: 'Username cannot exceed 50 characters',
          code: 'TOO_LONG'
        });
      }

      if (!/^[a-zA-Z0-9_.-]+$/.test(data.username)) {
        errors.push({
          field: 'username',
          message: 'Username can only contain letters, numbers, underscores, dots, and hyphens',
          code: 'INVALID_FORMAT'
        });
      }
    }

    // Name validation
    if (data.name) {
      if (data.name.length < 2) {
        errors.push({
          field: 'name',
          message: 'Name must be at least 2 characters long',
          code: 'TOO_SHORT'
        });
      }

      if (data.name.length > 100) {
        errors.push({
          field: 'name',
          message: 'Name cannot exceed 100 characters',
          code: 'TOO_LONG'
        });
      }
    }

    // Surname validation
    if (data.surname) {
      if (data.surname.length < 2) {
        errors.push({
          field: 'surname',
          message: 'Surname must be at least 2 characters long',
          code: 'TOO_SHORT'
        });
      }

      if (data.surname.length > 100) {
        errors.push({
          field: 'surname',
          message: 'Surname cannot exceed 100 characters',
          code: 'TOO_LONG'
        });
      }
    }

    // Email validation
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push({
          field: 'email',
          message: 'Invalid email format',
          code: 'INVALID_EMAIL'
        });
      }

      if (data.email.length > 255) {
        errors.push({
          field: 'email',
          message: 'Email cannot exceed 255 characters',
          code: 'TOO_LONG'
        });
      }
    }

    // Role validation
    if (data.role) {
      const validRoles = ['admin', 'manager', 'inspector', 'user'];
      if (!validRoles.includes(data.role)) {
        errors.push({
          field: 'role',
          message: `Role must be one of: ${validRoles.join(', ')}`,
          code: 'INVALID_ENUM'
        });
      }
    }

    return errors;
  }

  /**
   * Validate file upload constraints
   */
  static validateFileUpload(
    file: Express.Multer.File,
    options: {
      maxSize?: number;
      allowedTypes?: string[];
      allowedExtensions?: string[];
    } = {}
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Default constraints
    const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB
    const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
    const allowedExtensions = options.allowedExtensions || ['.jpg', '.jpeg', '.png', '.webp'];

    // File size validation
    if (file.size > maxSize) {
      errors.push({
        field: 'file',
        message: `File size cannot exceed ${Math.round(maxSize / 1024 / 1024)}MB`,
        code: 'FILE_TOO_LARGE'
      });
    }

    // MIME type validation
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push({
        field: 'file',
        message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        code: 'INVALID_FILE_TYPE'
      });
    }

    // File extension validation
    const extension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (!allowedExtensions.includes(extension)) {
      errors.push({
        field: 'file',
        message: `File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`,
        code: 'INVALID_FILE_EXTENSION'
      });
    }

    // Basic security checks
    if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
      errors.push({
        field: 'file',
        message: 'Invalid file name',
        code: 'INVALID_FILE_NAME'
      });
    }

    return errors;
  }

  /**
   * Validate bulk operation constraints
   */
  static validateBulkOperation(
    items: any[],
    maxBatchSize = 1000
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!Array.isArray(items)) {
      errors.push({
        field: 'items',
        message: 'Items must be an array',
        code: 'NOT_ARRAY'
      });
      return errors;
    }

    if (items.length === 0) {
      errors.push({
        field: 'items',
        message: 'At least one item is required',
        code: 'EMPTY_ARRAY'
      });
    }

    if (items.length > maxBatchSize) {
      errors.push({
        field: 'items',
        message: `Batch size cannot exceed ${maxBatchSize} items`,
        code: 'BATCH_TOO_LARGE'
      });
    }

    return errors;
  }

  /**
   * Check authorization for resource access
   */
  static checkResourceAccess(
    userRole: string,
    resourceAction: string,
    resourceOwner?: string,
    userId?: string
  ): { allowed: boolean; reason?: string } {
    // Admin can do everything
    if (userRole === 'admin') {
      return { allowed: true };
    }

    // Manager permissions
    if (userRole === 'manager') {
      const managerActions = [
        'product:create', 'product:read', 'product:update', 'product:delete',
        'quality_check:create', 'quality_check:read', 'quality_check:update',
        'user:read', 'report:read'
      ];
      
      if (managerActions.includes(resourceAction)) {
        return { allowed: true };
      }
    }

    // Inspector permissions
    if (userRole === 'inspector') {
      const inspectorActions = [
        'product:read',
        'quality_check:create', 'quality_check:read', 'quality_check:update'
      ];
      
      if (inspectorActions.includes(resourceAction)) {
        // Can only modify their own quality checks
        if (resourceAction.includes('quality_check') && resourceOwner && resourceOwner !== userId) {
          return { allowed: false, reason: 'Can only access own quality checks' };
        }
        return { allowed: true };
      }
    }

    // User permissions
    if (userRole === 'user') {
      const userActions = [
        'product:read',
        'quality_check:read'
      ];
      
      if (userActions.includes(resourceAction)) {
        return { allowed: true };
      }
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  }
}