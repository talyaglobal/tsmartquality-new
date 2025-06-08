import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { config } from './config/config-manager';
import routes from './routes';

// Security middleware
import {
  securityHeaders,
  compressionMiddleware,
  requestTimeout,
  requestSizeLimit,
  sanitizeResponseHeaders,
  securityMonitoring,
  corsConfiguration,
  hppProtection,
  requestId
} from './middleware/security.middleware';

import {
  globalRateLimit,
  adaptiveRateLimit
} from './middleware/rate-limiting.middleware';

import {
  sanitizeInputs,
  detectSQLInjection,
  detectNoSQLInjection
} from './middleware/validation.middleware';

// Monitoring and logging
import { Logger } from './utils/logger';
import { 
  monitor,
  monitoringMiddleware,
  errorMonitoringMiddleware,
  startPeriodicMonitoring
} from './utils/monitoring';

// Error handling
import { notFound, errorHandler } from './utils/simple-error-handler';

/**
 * Comprehensive secured Express application
 */
function createSecuredApp(): express.Application {
  const app = express();

  // Trust proxy for accurate IP addresses behind load balancers
  app.set('trust proxy', 1);

  // Request ID for tracing
  app.use(requestId());

  // Security headers (must be early)
  app.use(securityHeaders({
    contentSecurityPolicy: config.nodeEnv === 'production',
    hsts: config.nodeEnv === 'production'
  }));

  // CORS configuration
  app.use(corsConfiguration());

  // Response compression
  app.use(compressionMiddleware());

  // Request monitoring
  app.use(monitoringMiddleware());

  // Request logging
  if (config.features.requestLogging) {
    app.use(Logger.middleware());
  }

  // Request timeout
  app.use(requestTimeout(config.request.timeout));

  // Request size limiting
  app.use(requestSizeLimit());

  // Rate limiting
  if (config.features.rateLimiting) {
    app.use(globalRateLimit);
    
    // Adaptive rate limiting for API routes
    app.use('/api', adaptiveRateLimit.createMiddleware());
  }

  // Security monitoring
  app.use(securityMonitoring());

  // HTTP Parameter Pollution protection
  app.use(hppProtection());

  // Input sanitization
  app.use(sanitizeInputs({
    logViolations: true
  }));

  // Injection attack detection
  app.use(detectSQLInjection());
  app.use(detectNoSQLInjection());

  // Body parsing with size limits
  app.use(express.json({ 
    limit: config.request.sizeLimit,
    strict: true
  }));
  
  app.use(express.urlencoded({ 
    extended: true, 
    limit: config.request.sizeLimit,
    parameterLimit: 100
  }));

  // Sanitize response headers
  app.use(sanitizeResponseHeaders());

  // Serve static files with security headers
  app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1d',
    setHeaders: (res: Response, path: string) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      
      // Prevent execution of uploaded files
      const ext = path.split('.').pop()?.toLowerCase();
      if (['js', 'html', 'htm', 'php', 'py', 'rb'].includes(ext || '')) {
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('X-Download-Options', 'noopen');
      }
    }
  }));

  // API Routes
  app.use(config.apiPrefix, routes);

  // Health check endpoints
  app.get('/health', createHealthCheckHandler());
  app.get('/health/detailed', createDetailedHealthCheckHandler());
  app.get('/metrics', createMetricsHandler());

  // Simple health check for load balancers
  app.get('/ping', (req: Request, res: Response) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      version: config.apiVersion 
    });
  });

  // Security endpoint for monitoring
  app.get('/security/status', createSecurityStatusHandler());

  // 404 handler
  app.use(notFound);

  // Error monitoring
  app.use(errorMonitoringMiddleware());

  // Error handler
  app.use(errorHandler);

  return app;
}

/**
 * Health check handler
 */
function createHealthCheckHandler() {
  return async (req: Request, res: Response) => {
    try {
      const healthCheck = await monitor.performHealthCheck();
      const status = healthCheck.status === 'healthy' ? 200 : 
                    healthCheck.status === 'degraded' ? 200 : 503;

      res.status(status).json({
        status: healthCheck.status,
        timestamp: healthCheck.timestamp,
        environment: config.nodeEnv,
        version: config.apiVersion,
        uptime: healthCheck.uptime
      });
    } catch (error: any) {
      Logger.error('Health check failed', { error: error.message });
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        environment: config.nodeEnv
      });
    }
  };
}

/**
 * Detailed health check handler
 */
function createDetailedHealthCheckHandler() {
  return async (req: Request, res: Response) => {
    try {
      const healthCheck = await monitor.performHealthCheck();
      const systemStats = monitor.getSystemStats();
      const alerts = monitor.checkAlerts();

      res.json({
        status: healthCheck.status,
        timestamp: healthCheck.timestamp,
        environment: config.nodeEnv,
        version: config.apiVersion,
        uptime: healthCheck.uptime,
        memory: healthCheck.memory,
        cpu: healthCheck.cpu,
        checks: healthCheck.checks,
        stats: systemStats,
        alerts
      });
    } catch (error: any) {
      Logger.error('Detailed health check failed', { error: error.message });
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      });
    }
  };
}

/**
 * Metrics handler
 */
function createMetricsHandler() {
  return (req: Request, res: Response) => {
    try {
      if (!config.monitoring.metricsEnabled) {
        return res.status(404).json({
          success: false,
          message: 'Metrics endpoint disabled'
        });
      }

      const stats = monitor.getSystemStats();
      const metrics = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        stats,
        timestamp: new Date().toISOString()
      };

      res.json(metrics);
    } catch (error: any) {
      Logger.error('Metrics endpoint failed', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve metrics'
      });
    }
  };
}

/**
 * Security status handler
 */
function createSecurityStatusHandler() {
  return (req: Request, res: Response) => {
    try {
      const stats = monitor.getSystemStats();
      const alerts = monitor.checkAlerts();
      const securityAlerts = alerts.filter(alert => 
        ['rate_limit', 'security', 'blocked'].some(type => alert.type.includes(type))
      );

      res.json({
        security: stats.security,
        alerts: securityAlerts,
        features: {
          rateLimiting: config.features.rateLimiting,
          auditLogging: config.features.auditLogging,
          mfaEnabled: config.features.mfaEnabled,
          requestLogging: config.features.requestLogging
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      Logger.error('Security status endpoint failed', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve security status'
      });
    }
  };
}

// Create and export the secured app
const app = createSecuredApp();

// Start periodic monitoring
if (config.monitoring.metricsEnabled) {
  startPeriodicMonitoring();
}

export default app;