import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log error
  console.error(`ERROR: ${err.message}`.red);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  
  // Database errors
  if (err.code === '23505') {
    const field = err.detail.match(/\((.*?)\)/)?.[1] || 'field';
    error = new AppError(`Duplicate ${field} value entered`, 400);
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401);
  }
  
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401);
  }
  
  res.status(error.statusCode || 500).json({
    message: error.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};