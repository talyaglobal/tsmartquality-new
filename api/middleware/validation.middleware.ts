import { Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult, ValidationChain } from 'express-validator';
import xss from 'xss';
import { config } from '../config/config-manager';
import { securityEventLogger } from './security.middleware';

export interface ValidationOptions {
  skipSanitization?: boolean;
  allowEmpty?: boolean;
  customSanitizer?: (value: any) => any;
  logViolations?: boolean;
}

/**
 * Generic input sanitizer that removes malicious content
 */
export class InputSanitizer {
  // XSS configuration
  private static xssOptions = {
    whiteList: {
      // Allow basic text formatting only
      'b': [],
      'i': [],
      'u': [],
      'em': [],
      'strong': [],
      'p': [],
      'br': []
    },
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
    allowCommentTag: false,
    css: false
  };

  /**
   * Sanitize string input to prevent XSS
   */
  static sanitizeString(input: string, allowHtml: boolean = false): string {
    if (typeof input !== 'string') {
      return String(input);
    }

    // Remove null bytes
    let sanitized = input.replace(/\0/g, '');

    // Handle HTML content
    if (allowHtml) {
      sanitized = xss(sanitized, this.xssOptions);
    } else {
      // Strip all HTML tags
      sanitized = xss(sanitized, { whiteList: {} });
    }

    // Remove control characters except newlines and tabs
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    return sanitized;
  }

  /**
   * Sanitize SQL input to prevent injection
   */
  static sanitizeSqlInput(input: string): string {
    if (typeof input !== 'string') {
      return String(input);
    }

    // Escape SQL special characters
    return input
      .replace(/'/g, "''")
      .replace(/;/g, '\\;')
      .replace(/--/g, '\\--')
      .replace(/\/\*/g, '\\/\\*')
      .replace(/\*\//g, '\\*\\/')
      .replace(/\\/g, '\\\\');
  }

  /**
   * Sanitize NoSQL input to prevent injection
   */
  static sanitizeNoSqlInput(input: any): any {
    if (typeof input === 'string') {
      return this.sanitizeString(input);
    }

    if (typeof input === 'object' && input !== null) {
      // Remove dangerous operators
      const dangerousOperators = ['$where', '$regex', '$expr', '$jsonSchema'];
      const sanitized = { ...input };
      
      dangerousOperators.forEach(op => {
        if (op in sanitized) {
          delete sanitized[op];
        }
      });

      // Recursively sanitize object properties
      for (const key in sanitized) {
        if (sanitized.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeNoSqlInput(sanitized[key]);
        }
      }

      return sanitized;
    }

    return input;
  }

  /**
   * Sanitize file path to prevent directory traversal
   */
  static sanitizeFilePath(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Remove directory traversal attempts
    let sanitized = input.replace(/\.\./g, '');
    
    // Remove null bytes and control characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
    
    // Remove leading slashes and backslashes
    sanitized = sanitized.replace(/^[\/\\]+/, '');
    
    // Normalize path separators
    sanitized = sanitized.replace(/[\\]/g, '/');
    
    return sanitized;
  }

  /**
   * Validate and sanitize email
   */
  static sanitizeEmail(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = input.toLowerCase().trim();
    
    return emailRegex.test(sanitized) ? sanitized : '';
  }

  /**
   * Sanitize phone number
   */
  static sanitizePhoneNumber(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    // Keep only digits, spaces, hyphens, parentheses, and plus sign
    return input.replace(/[^0-9\s\-\(\)\+]/g, '').trim();
  }

  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(input: any, options: { integer?: boolean; min?: number; max?: number } = {}): number | null {
    const num = parseFloat(input);
    
    if (isNaN(num)) {
      return null;
    }

    if (options.integer && !Number.isInteger(num)) {
      return null;
    }

    if (options.min !== undefined && num < options.min) {
      return null;
    }

    if (options.max !== undefined && num > options.max) {
      return null;
    }

    return num;
  }
}

/**
 * Middleware to sanitize all request inputs
 */
export function sanitizeInputs(options: ValidationOptions = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (options.skipSanitization) {
      return next();
    }

    try {
      // Sanitize query parameters
      if (req.query) {
        req.query = sanitizeObject(req.query, options);
      }

      // Sanitize body parameters
      if (req.body) {
        req.body = sanitizeObject(req.body, options);
      }

      // Sanitize URL parameters
      if (req.params) {
        req.params = sanitizeObject(req.params, options);
      }

      next();
    } catch (error) {
      if (options.logViolations) {
        securityEventLogger.logEvent({
          type: 'input_sanitization_error',
          severity: 'medium',
          ip: req.ip || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
          url: req.originalUrl,
          method: req.method,
          timestamp: new Date(),
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }

      res.status(400).json({
        success: false,
        message: 'Invalid input data',
        code: 'INPUT_VALIDATION_ERROR'
      });
    }
  };
}

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj: any, options: ValidationOptions): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    if (!options.allowEmpty && obj.trim() === '') {
      return '';
    }
    
    if (options.customSanitizer) {
      return options.customSanitizer(obj);
    }
    
    return InputSanitizer.sanitizeString(obj);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const sanitizedKey = InputSanitizer.sanitizeString(key);
        sanitized[sanitizedKey] = sanitizeObject(obj[key], options);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Common validation chains for different data types
 */
export const ValidationChains = {
  // Email validation
  email: (field: string = 'email') => 
    body(field)
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email format'),

  // Password validation
  password: (field: string = 'password', options: { min?: number; requireSpecial?: boolean } = {}) => {
    const minLength = options.min || 8;
    let chain = body(field)
      .isLength({ min: minLength })
      .withMessage(`Password must be at least ${minLength} characters long`)
      .matches(/(?=.*[a-z])/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/(?=.*[A-Z])/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/(?=.*\d)/)
      .withMessage('Password must contain at least one number');

    if (options.requireSpecial) {
      chain = chain
        .matches(/(?=.*[@$!%*?&])/)
        .withMessage('Password must contain at least one special character');
    }

    return chain;
  },

  // Username validation
  username: (field: string = 'username') =>
    body(field)
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),

  // Phone number validation
  phoneNumber: (field: string = 'phoneNumber') =>
    body(field)
      .isMobilePhone('any')
      .withMessage('Invalid phone number format'),

  // URL validation
  url: (field: string = 'url') =>
    body(field)
      .isURL({ protocols: ['http', 'https'] })
      .withMessage('Invalid URL format'),

  // Integer validation
  integer: (field: string, options: { min?: number; max?: number } = {}) => {
    let chain = body(field).isInt();
    
    if (options.min !== undefined) {
      chain = chain.isInt({ min: options.min });
    }
    
    if (options.max !== undefined) {
      chain = chain.isInt({ max: options.max });
    }
    
    return chain.withMessage('Must be a valid integer');
  },

  // String validation
  string: (field: string, options: { min?: number; max?: number; pattern?: RegExp } = {}) => {
    let chain = body(field).isString();
    
    if (options.min !== undefined || options.max !== undefined) {
      chain = chain.isLength({ min: options.min, max: options.max });
    }
    
    if (options.pattern) {
      chain = chain.matches(options.pattern);
    }
    
    return chain.withMessage('Invalid string format');
  },

  // Date validation
  date: (field: string) =>
    body(field)
      .isISO8601()
      .withMessage('Invalid date format (use ISO 8601)'),

  // JSON validation
  json: (field: string) =>
    body(field)
      .custom((value) => {
        try {
          JSON.parse(value);
          return true;
        } catch {
          throw new Error('Invalid JSON format');
        }
      }),

  // File validation
  file: (field: string, options: { 
    maxSize?: number; 
    allowedTypes?: string[]; 
    required?: boolean 
  } = {}) => {
    let chain = body(field);
    
    if (options.required) {
      chain = chain.notEmpty().withMessage('File is required');
    }
    
    return chain.custom((value, { req }) => {
      const file = (req as any).file || (req as any).files?.[field];
      
      if (!file && options.required) {
        throw new Error('File is required');
      }
      
      if (file) {
        if (options.maxSize && file.size > options.maxSize) {
          throw new Error(`File size must be less than ${options.maxSize} bytes`);
        }
        
        if (options.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
          throw new Error(`File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}`);
        }
      }
      
      return true;
    });
  }
};

/**
 * Middleware to handle validation errors
 */
export function handleValidationErrors() {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const errorDetails = errors.array().map(error => ({
        field: 'path' in error ? error.path : 'unknown',
        message: error.msg,
        value: 'value' in error ? error.value : undefined,
        location: 'location' in error ? error.location : undefined
      }));

      // Log validation failures for security monitoring
      securityEventLogger.logEvent({
        type: 'validation_failure',
        severity: 'low',
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date(),
        details: { errors: errorDetails }
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: errorDetails
      });
    }

    next();
  };
}

/**
 * Create validation middleware chain
 */
export function createValidation(validations: ValidationChain[]) {
  return [...validations, handleValidationErrors()];
}

/**
 * SQL injection detection middleware
 */
export function detectSQLInjection() {
  return (req: Request, res: Response, next: NextFunction) => {
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
      /(\b(or|and)\s+\d+\s*=\s*\d+)/gi,
      /('+\s*(or|and)\s*'+\s*=\s*'+)/gi,
      /(\bor\b\s+\d+\s*=\s*\d+)/gi,
      /(\/\*.*?\*\/)/gi,
      /(--[\s\S]*?$)/gm
    ];

    const checkForSQLInjection = (obj: any): boolean => {
      if (typeof obj === 'string') {
        return sqlPatterns.some(pattern => pattern.test(obj));
      }
      
      if (typeof obj === 'object' && obj !== null) {
        return Object.values(obj).some(value => checkForSQLInjection(value));
      }
      
      return false;
    };

    const hasSQLInjection = 
      checkForSQLInjection(req.query) ||
      checkForSQLInjection(req.body) ||
      checkForSQLInjection(req.params);

    if (hasSQLInjection) {
      securityEventLogger.logEvent({
        type: 'sql_injection_attempt',
        severity: 'critical',
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date(),
        details: {
          query: req.query,
          body: req.body,
          params: req.params
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid request',
        code: 'INVALID_INPUT'
      });
    }

    next();
  };
}

/**
 * NoSQL injection detection middleware
 */
export function detectNoSQLInjection() {
  return (req: Request, res: Response, next: NextFunction) => {
    const dangerousOperators = ['$where', '$regex', '$expr', '$jsonSchema', '$function'];
    
    const checkForNoSQLInjection = (obj: any): boolean => {
      if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          if (dangerousOperators.includes(key)) {
            return true;
          }
          
          if (typeof obj[key] === 'object' && checkForNoSQLInjection(obj[key])) {
            return true;
          }
        }
      }
      
      return false;
    };

    const hasNoSQLInjection = 
      checkForNoSQLInjection(req.query) ||
      checkForNoSQLInjection(req.body) ||
      checkForNoSQLInjection(req.params);

    if (hasNoSQLInjection) {
      securityEventLogger.logEvent({
        type: 'nosql_injection_attempt',
        severity: 'critical',
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date(),
        details: {
          query: req.query,
          body: req.body,
          params: req.params
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid request',
        code: 'INVALID_INPUT'
      });
    }

    next();
  };
}