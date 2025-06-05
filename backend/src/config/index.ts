import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'tsmart-quality-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  
  // Database configuration (can be expanded based on your database choice)
  dbUri: process.env.DATABASE_URL || '',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

export default config;
