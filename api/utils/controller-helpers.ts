import { Response } from 'express';
import { Logger } from '../startup';

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  meta?: Record<string, any>;
}

export class ControllerHelpers {
  /**
   * Send success response
   */
  static sendSuccess<T>(
    res: Response, 
    data: T, 
    message?: string, 
    statusCode = 200,
    meta?: Record<string, any>
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      meta
    };
    res.status(statusCode).json(response);
  }

  /**
   * Send paginated success response
   */
  static sendPaginatedSuccess<T>(
    res: Response,
    data: T[],
    pagination: { page: number; pageSize: number; totalCount: number },
    message?: string,
    meta?: Record<string, any>
  ): void {
    const response: ApiResponse<T[]> = {
      success: true,
      data,
      message,
      pagination: {
        ...pagination,
        totalPages: Math.ceil(pagination.totalCount / pagination.pageSize)
      },
      meta
    };
    res.status(200).json(response);
  }

  /**
   * Send error response
   */
  static sendError(
    res: Response,
    message: string,
    statusCode = 500,
    errors?: ValidationError[],
    meta?: Record<string, any>
  ): void {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
      meta
    };
    res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static sendValidationError(
    res: Response,
    errors: ValidationError[],
    message = 'Validation failed'
  ): void {
    this.sendError(res, message, 400, errors);
  }

  /**
   * Handle controller errors
   */
  static handleError(
    res: Response,
    error: any,
    context: string,
    userId?: string,
    companyId?: number
  ): void {
    const errorId = Math.random().toString(36).substring(2);
    
    Logger.error(`Controller error in ${context}`, {
      errorId,
      error: error.message,
      stack: error.stack,
      userId,
      companyId,
      timestamp: new Date().toISOString()
    });

    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production') {
      this.sendError(res, 'An internal error occurred', 500, undefined, { errorId });
    } else {
      this.sendError(res, error.message || 'Server error', 500, undefined, { 
        errorId,
        stack: error.stack 
      });
    }
  }

  /**
   * Validate required fields
   */
  static validateRequiredFields(
    data: Record<string, any>,
    requiredFields: string[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0 && data[field] !== false) {
        errors.push({
          field,
          message: `${field} is required`,
          code: 'REQUIRED'
        });
      }
    }

    return errors;
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): ValidationError | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        field: 'email',
        message: 'Invalid email format',
        code: 'INVALID_EMAIL'
      };
    }
    return null;
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (password.length < 8) {
      errors.push({
        field: 'password',
        message: 'Password must be at least 8 characters long',
        code: 'PASSWORD_TOO_SHORT'
      });
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one lowercase letter',
        code: 'PASSWORD_NO_LOWERCASE'
      });
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one uppercase letter',
        code: 'PASSWORD_NO_UPPERCASE'
      });
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one number',
        code: 'PASSWORD_NO_NUMBER'
      });
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one special character (@$!%*?&)',
        code: 'PASSWORD_NO_SPECIAL'
      });
    }

    return errors;
  }

  /**
   * Validate numeric values
   */
  static validateNumeric(
    value: any,
    field: string,
    options: {
      min?: number;
      max?: number;
      integer?: boolean;
      allowZero?: boolean;
    } = {}
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (value === null || value === undefined) {
      return errors; // Let required validation handle this
    }

    const num = Number(value);

    if (isNaN(num)) {
      errors.push({
        field,
        message: `${field} must be a valid number`,
        code: 'INVALID_NUMBER'
      });
      return errors;
    }

    if (options.integer && !Number.isInteger(num)) {
      errors.push({
        field,
        message: `${field} must be an integer`,
        code: 'NOT_INTEGER'
      });
    }

    if (!options.allowZero && num < 0) {
      errors.push({
        field,
        message: `${field} cannot be negative`,
        code: 'NEGATIVE_VALUE'
      });
    }

    if (options.min !== undefined && num < options.min) {
      errors.push({
        field,
        message: `${field} must be at least ${options.min}`,
        code: 'BELOW_MINIMUM'
      });
    }

    if (options.max !== undefined && num > options.max) {
      errors.push({
        field,
        message: `${field} must be at most ${options.max}`,
        code: 'ABOVE_MAXIMUM'
      });
    }

    return errors;
  }

  /**
   * Validate string length
   */
  static validateStringLength(
    value: string,
    field: string,
    options: {
      min?: number;
      max?: number;
    } = {}
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!value) {
      return errors; // Let required validation handle this
    }

    if (options.min !== undefined && value.length < options.min) {
      errors.push({
        field,
        message: `${field} must be at least ${options.min} characters long`,
        code: 'TOO_SHORT'
      });
    }

    if (options.max !== undefined && value.length > options.max) {
      errors.push({
        field,
        message: `${field} must be at most ${options.max} characters long`,
        code: 'TOO_LONG'
      });
    }

    return errors;
  }

  /**
   * Validate enum values
   */
  static validateEnum(
    value: string,
    field: string,
    allowedValues: string[]
  ): ValidationError | null {
    if (!allowedValues.includes(value)) {
      return {
        field,
        message: `${field} must be one of: ${allowedValues.join(', ')}`,
        code: 'INVALID_ENUM'
      };
    }
    return null;
  }

  /**
   * Validate array
   */
  static validateArray(
    value: any,
    field: string,
    options: {
      minLength?: number;
      maxLength?: number;
      uniqueItems?: boolean;
    } = {}
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!Array.isArray(value)) {
      errors.push({
        field,
        message: `${field} must be an array`,
        code: 'NOT_ARRAY'
      });
      return errors;
    }

    if (options.minLength !== undefined && value.length < options.minLength) {
      errors.push({
        field,
        message: `${field} must contain at least ${options.minLength} items`,
        code: 'ARRAY_TOO_SHORT'
      });
    }

    if (options.maxLength !== undefined && value.length > options.maxLength) {
      errors.push({
        field,
        message: `${field} must contain at most ${options.maxLength} items`,
        code: 'ARRAY_TOO_LONG'
      });
    }

    if (options.uniqueItems) {
      const uniqueValues = new Set(value);
      if (uniqueValues.size !== value.length) {
        errors.push({
          field,
          message: `${field} must contain unique items`,
          code: 'DUPLICATE_ITEMS'
        });
      }
    }

    return errors;
  }

  /**
   * Parse pagination parameters
   */
  static parsePagination(query: any): {
    page: number;
    pageSize: number;
    offset: number;
  } {
    const page = Math.max(1, parseInt(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize) || 20));
    const offset = (page - 1) * pageSize;

    return { page, pageSize, offset };
  }

  /**
   * Parse sorting parameters
   */
  static parseSorting(query: any, allowedFields: string[] = []): {
    orderBy: string;
    sortDirection: 'ASC' | 'DESC';
  } {
    let orderBy = 'created_at';
    let sortDirection: 'ASC' | 'DESC' = 'DESC';

    if (query.orderBy && allowedFields.includes(query.orderBy)) {
      orderBy = query.orderBy;
    }

    if (query.sortDirection && ['ASC', 'DESC'].includes(query.sortDirection.toUpperCase())) {
      sortDirection = query.sortDirection.toUpperCase();
    }

    return { orderBy, sortDirection };
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input: string): string {
    if (!input) return '';
    return input.trim().replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
  }

  /**
   * Rate limiting helper
   */
  static checkRateLimit(
    identifier: string,
    maxAttempts: number,
    windowMs: number,
    storage: Map<string, { count: number; resetTime: number }> = new Map()
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = identifier;
    const record = storage.get(key);

    if (!record || now > record.resetTime) {
      const resetTime = now + windowMs;
      storage.set(key, { count: 1, resetTime });
      return { allowed: true, remaining: maxAttempts - 1, resetTime };
    }

    if (record.count >= maxAttempts) {
      return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    record.count++;
    storage.set(key, record);
    return { allowed: true, remaining: maxAttempts - record.count, resetTime: record.resetTime };
  }
}