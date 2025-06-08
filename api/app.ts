import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './config/config';
import routes from './routes';
import { notFound, errorHandler } from './utils/simple-error-handler';

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api', routes);

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  try {
    const { HealthChecker } = await import('./startup');
    const healthCheck = await HealthChecker.performHealthCheck();
    
    const status = healthCheck.overall ? 200 : 503;
    res.status(status).json({
      status: healthCheck.overall ? 'healthy' : 'unhealthy',
      timestamp: healthCheck.timestamp,
      environment: config.env,
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      checks: {
        database: healthCheck.database,
        environment: healthCheck.environment,
        nodeVersion: healthCheck.nodeVersion
      }
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      environment: config.env
    });
  }
});

// Simple health check for load balancers
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;