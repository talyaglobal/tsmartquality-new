import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { z } from 'zod';
import path from 'path';
import config from './config';

// Initialize express app
const app: Express = express();

// Middleware
app.use(helmet()); // Security headers

// Configure CORS based on environment settings
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
})); // Enable CORS
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
// Import routes here as they are developed
// Example: app.use('/api/products', productRoutes);

// Custom error interface for better type handling
interface ApiError extends Error {
  statusCode?: number;
  details?: any;
}

// Error handling middleware
app.use((err: ApiError, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    error: {
      message: err.message || 'An unexpected error occurred',
      details: config.nodeEnv === 'development' ? err.details || err.stack : undefined
    }
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      message: 'Resource not found',
      path: req.path
    }
  });
});

export default app;
