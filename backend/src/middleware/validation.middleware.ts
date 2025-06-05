import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

// Interface for custom validation rules
interface ValidationRule {
  field: string;
  validation: string;
  location?: 'body' | 'params' | 'query';
  message?: string;
}

// Parse validation rule string and apply the corresponding express-validator
function parseValidationRule(rule: ValidationRule) {
  const { field, validation, location = 'body', message } = rule;
  const validations = validation.split('|');
  
  // Select the appropriate validator based on location
  let validator;
  switch (location) {
    case 'params':
      validator = param(field);
      break;
    case 'query':
      validator = query(field);
      break;
    default:
      validator = body(field);
  }
  
  // Apply each validation rule
  for (const val of validations) {
    if (val === 'required') {
      validator = validator.exists().withMessage(message || `${field} is required`);
    }
    else if (val === 'string') {
      validator = validator.isString().withMessage(message || `${field} must be a string`);
    }
    else if (val === 'integer') {
      validator = validator.isInt().withMessage(message || `${field} must be an integer`);
    }
    else if (val === 'numeric' || val === 'number') {
      validator = validator.isNumeric().withMessage(message || `${field} must be a number`);
    }
    else if (val === 'boolean') {
      validator = validator.isBoolean().withMessage(message || `${field} must be a boolean`);
    }
    else if (val === 'array') {
      validator = validator.isArray().withMessage(message || `${field} must be an array`);
    }
    else if (val === 'email') {
      validator = validator.isEmail().withMessage(message || `${field} must be a valid email`);
    }
    else if (val === 'url') {
      validator = validator.isURL().withMessage(message || `${field} must be a valid URL`);
    }
    else if (val === 'date') {
      validator = validator.isDate().withMessage(message || `${field} must be a valid date`);
    }
    else if (val === 'iso8601') {
      validator = validator.isISO8601().withMessage(message || `${field} must be a valid ISO8601 date`);
    }
    else if (val.startsWith('min:')) {
      const min = parseInt(val.split(':')[1]);
      validator = validator.isLength({ min }).withMessage(message || `${field} must be at least ${min} characters long`);
    }
    else if (val.startsWith('max:')) {
      const max = parseInt(val.split(':')[1]);
      validator = validator.isLength({ max }).withMessage(message || `${field} must be at most ${max} characters long`);
    }
    else if (val.startsWith('in:')) {
      const options = val.split(':')[1].split(',');
      validator = validator.isIn(options).withMessage(message || `${field} must be one of: ${options.join(', ')}`);
    }
    else if (val.startsWith('gt:')) {
      const gtValue = parseInt(val.split(':')[1]);
      validator = validator.isInt({ gt: gtValue }).withMessage(message || `${field} must be greater than ${gtValue}`);
    }
    else if (val.startsWith('gte:')) {
      const gteValue = parseInt(val.split(':')[1]);
      validator = validator.isInt({ min: gteValue }).withMessage(message || `${field} must be greater than or equal to ${gteValue}`);
    }
    else if (val.startsWith('lt:')) {
      const ltValue = parseInt(val.split(':')[1]);
      validator = validator.isInt({ lt: ltValue }).withMessage(message || `${field} must be less than ${ltValue}`);
    }
    else if (val.startsWith('lte:')) {
      const lteValue = parseInt(val.split(':')[1]);
      validator = validator.isInt({ max: lteValue }).withMessage(message || `${field} must be less than or equal to ${lteValue}`);
    }
    else if (val === 'notEmpty') {
      validator = validator.notEmpty().withMessage(message || `${field} must not be empty`);
    }
  }
  
  return validator;
}

/**
 * Middleware to validate request data
 * @param rules Array of validation rules
 */
export const validate = (rules: ValidationRule[]) => {
  // Convert our custom validation rules to express-validator middleware
  const validations = rules.map(rule => parseValidationRule(rule));
  
  // Return middleware that checks validation results
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    
    next();
  };
};

// Middleware to handle file upload validation
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file && !req.files) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  next();
};

// Middleware to validate file types
export const validateFileType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const fileType = req.file.mimetype;
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({ 
        message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      });
    }
    
    next();
  };
};

// Middleware to validate file size
export const validateFileSize = (maxSizeInBytes: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    if (req.file.size > maxSizeInBytes) {
      return res.status(400).json({ 
        message: `File size exceeds the limit of ${maxSizeInBytes / (1024 * 1024)}MB`
      });
    }
    
    next();
  };
};