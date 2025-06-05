import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Type for Express route handler functions
 */
type ExpressHandler<T = any> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<T>;

/**
 * Wraps an async route handler to catch errors and pass them to the next middleware
 * This follows the Single Responsibility Principle by separating error handling from business logic
 */
export const asyncHandler = (fn: ExpressHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Creates a validation middleware using Zod schemas
 * This follows the Open/Closed Principle by allowing extension through different schema configurations
 */
export const createValidationMiddleware = (schema: {
  body?: z.ZodType<any>;
  query?: z.ZodType<any>;
  params?: z.ZodType<any>;
}) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: {
            message: 'Validation error',
            details: error.errors
          }
        });
      } else {
        next(error);
      }
    }
  });
};

/**
 * Creates a factory function for API responses
 * This follows the Dependency Inversion Principle by depending on abstractions rather than concrete implementations
 */
export const createResponseFactory = (res: Response) => {
  return {
    success: <T>(data: T, statusCode: number = 200) => {
      return res.status(statusCode).json({
        success: true,
        data
      });
    },
    
    error: (message: string, statusCode: number = 500, details?: any) => {
      return res.status(statusCode).json({
        success: false,
        error: {
          message,
          details
        }
      });
    }
  };
};
