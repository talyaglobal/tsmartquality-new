import app from './app-secured';
import { config, configManager } from './config/config-manager';
import { initializeDatabase } from './utils/database';
import { ServiceInitializer } from './services/service-initializer';
import { Logger, logger } from './utils/logger';

// Enhanced logging utility (updated to use new logger)
export { Logger };

// System health checker
export class HealthChecker {
  static async checkDatabase(): Promise<{ status: boolean; message: string; latency?: number }> {
    try {
      const startTime = Date.now();
      await initializeDatabase();
      const latency = Date.now() - startTime;
      return { status: true, message: 'Database connection successful', latency };
    } catch (error: any) {
      return { status: false, message: error.message || 'Database connection failed' };
    }
  }

  static checkConfiguration(): { status: boolean; message: string; errors?: string[] } {
    try {
      const validation = configManager.validateConfiguration();
      return {
        status: validation.valid,
        message: validation.valid ? 'Configuration is valid' : 'Configuration validation failed',
        errors: validation.errors
      };
    } catch (error: any) {
      return {
        status: false,
        message: 'Configuration check failed',
        errors: [error.message]
      };
    }
  }

  static checkEnvironmentVariables(): { status: boolean; message: string; missing?: string[] } {
    try {
      // This is now handled by the config manager
      return { status: true, message: 'Environment variables validated' };
    } catch (error: any) {
      return { 
        status: false, 
        message: 'Environment validation failed',
        missing: [error.message]
      };
    }
  }

  static checkNodeVersion(): { status: boolean; message: string; version?: string } {
    const version = process.version;
    const majorVersion = parseInt(version.split('.')[0].substring(1));
    
    if (majorVersion < 16) {
      return { status: false, message: 'Node.js version too old', version };
    }
    
    return { status: true, message: 'Node.js version compatible', version };
  }

  static checkSecurity(): { status: boolean; message: string; warnings?: string[] } {
    const warnings: string[] = [];
    
    // Check if running in production with development settings
    if (config.nodeEnv === 'production') {
      if (config.cors.origin === '*') {
        warnings.push('CORS is set to allow all origins in production');
      }
      
      if (config.logging.level === 'debug') {
        warnings.push('Debug logging enabled in production');
      }
      
      if (!config.database.ssl) {
        warnings.push('Database SSL is disabled in production');
      }
    }

    return {
      status: warnings.length === 0,
      message: warnings.length === 0 ? 'Security configuration is optimal' : 'Security warnings detected',
      warnings
    };
  }

  static async performHealthCheck(): Promise<{
    overall: boolean;
    configuration: any;
    database: any;
    environment: any;
    nodeVersion: any;
    security: any;
    timestamp: string;
  }> {
    Logger.info('Performing comprehensive system health check...');
    
    const [configuration, database, environment, nodeVersion, security] = await Promise.all([
      Promise.resolve(this.checkConfiguration()),
      this.checkDatabase(),
      Promise.resolve(this.checkEnvironmentVariables()),
      Promise.resolve(this.checkNodeVersion()),
      Promise.resolve(this.checkSecurity())
    ]);

    const overall = configuration.status && database.status && environment.status && 
                   nodeVersion.status && security.status;
    
    const result = {
      overall,
      configuration,
      database,
      environment,
      nodeVersion,
      security,
      timestamp: new Date().toISOString()
    };

    Logger.info('Health check completed', { 
      overall, 
      components: 5,
      warnings: security.warnings?.length || 0
    });
    
    return result;
  }
}

// Application startup handler
export class StartupHandler {
  private static isShuttingDown = false;
  private static server: any = null;

  static async startServer(): Promise<void> {
    try {
      Logger.info('Starting TSmart Quality API server with enhanced security...');
      Logger.info('Configuration loaded', {
        environment: config.nodeEnv,
        port: config.port,
        nodeVersion: process.version,
        features: config.features,
        security: {
          rateLimiting: config.features.rateLimiting,
          auditLogging: config.features.auditLogging,
          requestLogging: config.features.requestLogging
        }
      });

      // Perform comprehensive health checks
      const healthCheck = await HealthChecker.performHealthCheck();
      
      if (!healthCheck.overall) {
        Logger.error('Health check failed, cannot start server', healthCheck);
        
        // Show specific issues
        if (!healthCheck.configuration.status) {
          Logger.error('Configuration issues:', healthCheck.configuration.errors);
        }
        if (!healthCheck.database.status) {
          Logger.error('Database issue:', healthCheck.database.message);
        }
        if (!healthCheck.security.status) {
          Logger.warn('Security warnings:', healthCheck.security.warnings);
        }
        
        throw new Error('Pre-startup health check failed');
      }

      // Show security warnings in production
      if (healthCheck.security.warnings?.length) {
        Logger.warn('Security configuration warnings detected:', {
          warnings: healthCheck.security.warnings,
          environment: config.nodeEnv
        });
      }

      // Initialize authentication and security services
      await ServiceInitializer.initializeAll();

      // Setup graceful shutdown handlers
      this.setupGracefulShutdown();

      // Start the server
      const PORT = config.port;
      this.server = app.listen(PORT, () => {
        Logger.info(`Secured server started successfully`, {
          port: PORT,
          environment: config.nodeEnv,
          pid: process.pid,
          memory: process.memoryUsage(),
          uptime: process.uptime(),
          endpoints: {
            api: `http://localhost:${PORT}${config.apiPrefix}`,
            health: `http://localhost:${PORT}/health`,
            metrics: config.monitoring.metricsEnabled ? `http://localhost:${PORT}/metrics` : 'disabled',
            security: `http://localhost:${PORT}/security/status`
          },
          security: {
            headers: 'enabled',
            rateLimiting: config.features.rateLimiting ? 'enabled' : 'disabled',
            inputValidation: 'enabled',
            monitoring: config.monitoring.metricsEnabled ? 'enabled' : 'disabled'
          }
        });
      });

      // Handle server errors
      this.server.on('error', (error: any) => {
        Logger.error('Server error occurred', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
        
        if (error.code === 'EADDRINUSE') {
          Logger.error(`Port ${PORT} is already in use`);
          process.exit(1);
        }
      });

      // Log memory usage periodically in development
      if (config.nodeEnv === 'development') {
        setInterval(() => {
          const memUsage = process.memoryUsage();
          Logger.debug('Memory usage', {
            rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
            external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
          });
        }, 60000); // Every minute
      }

      // Log configuration summary
      Logger.info('Server configuration summary', {
        cors: {
          origin: config.cors.origin,
          credentials: config.cors.credentials
        },
        rateLimit: {
          enabled: config.features.rateLimiting,
          windowMs: config.rateLimit.windowMs,
          maxRequests: config.rateLimit.maxRequests
        },
        security: {
          bcryptRounds: config.security.bcryptRounds,
          requestTimeout: config.request.timeout,
          requestSizeLimit: config.request.sizeLimit
        },
        monitoring: {
          enabled: config.monitoring.metricsEnabled,
          healthCheckInterval: config.monitoring.healthCheckInterval
        }
      });

    } catch (error: any) {
      Logger.error('Failed to start server', {
        error: error.message,
        stack: error.stack
      });
      process.exit(1);
    }
  }

  private static setupGracefulShutdown(): void {
    const gracefulShutdown = (signal: string) => {
      if (this.isShuttingDown) {
        Logger.warn('Force shutdown requested');
        process.exit(1);
      }

      this.isShuttingDown = true;
      Logger.info(`Received ${signal}, starting graceful shutdown...`);

      // Close server
      if (this.server) {
        this.server.close(() => {
          Logger.info('HTTP server closed');
        });
      }

      // Give ongoing requests time to complete
      setTimeout(() => {
        Logger.info('Graceful shutdown completed');
        process.exit(0);
      }, 5000);
    };

    // Handle different shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // nodemon restart

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      Logger.error('Uncaught Exception', {
        error: error.message,
        stack: error.stack
      });
      
      // Try to gracefully shutdown
      if (this.server) {
        this.server.close(() => {
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      Logger.error('Unhandled Rejection', {
        reason: reason?.message || reason,
        promise: promise.toString()
      });
      
      // Try to gracefully shutdown
      if (this.server) {
        this.server.close(() => {
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    });
  }

  static getServerInstance() {
    return this.server;
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  StartupHandler.startServer();
}