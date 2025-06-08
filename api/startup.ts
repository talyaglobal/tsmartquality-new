import app from './app';
import { config } from './config/config';
import { initializeDatabase } from './utils/database';

// Enhanced logging utility
class Logger {
  private static formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  static info(message: string, meta?: any): void {
    console.log(this.formatMessage('info', message, meta));
  }

  static error(message: string, meta?: any): void {
    console.error(this.formatMessage('error', message, meta));
  }

  static warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  static debug(message: string, meta?: any): void {
    if (config.env === 'development') {
      console.log(this.formatMessage('debug', message, meta));
    }
  }
}

// System health checker
class HealthChecker {
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

  static checkEnvironmentVariables(): { status: boolean; message: string; missing?: string[] } {
    const required = ['JWT_SECRET'];
    const missing = required.filter(key => !process.env[key] && !config.jwt.secret);
    
    if (missing.length > 0) {
      return { status: false, message: 'Missing required environment variables', missing };
    }
    
    return { status: true, message: 'All required environment variables present' };
  }

  static checkNodeVersion(): { status: boolean; message: string; version?: string } {
    const version = process.version;
    const majorVersion = parseInt(version.split('.')[0].substring(1));
    
    if (majorVersion < 16) {
      return { status: false, message: 'Node.js version too old', version };
    }
    
    return { status: true, message: 'Node.js version compatible', version };
  }

  static async performHealthCheck(): Promise<{
    overall: boolean;
    database: any;
    environment: any;
    nodeVersion: any;
    timestamp: string;
  }> {
    Logger.info('Performing system health check...');
    
    const [database, environment, nodeVersion] = await Promise.all([
      this.checkDatabase(),
      Promise.resolve(this.checkEnvironmentVariables()),
      Promise.resolve(this.checkNodeVersion())
    ]);

    const overall = database.status && environment.status && nodeVersion.status;
    
    const result = {
      overall,
      database,
      environment,
      nodeVersion,
      timestamp: new Date().toISOString()
    };

    Logger.info('Health check completed', { overall, components: 3 });
    return result;
  }
}

// Application startup handler
class StartupHandler {
  private static isShuttingDown = false;

  static async startServer(): Promise<void> {
    try {
      Logger.info('Starting TSmart Quality API server...');
      Logger.info('Environment configuration', {
        nodeEnv: config.env,
        port: config.port,
        nodeVersion: process.version
      });

      // Perform health checks
      const healthCheck = await HealthChecker.performHealthCheck();
      
      if (!healthCheck.overall) {
        Logger.error('Health check failed, cannot start server', healthCheck);
        throw new Error('Pre-startup health check failed');
      }

      // Setup graceful shutdown handlers
      this.setupGracefulShutdown();

      // Start the server
      const PORT = config.port;
      const server = app.listen(PORT, () => {
        Logger.info(`Server started successfully`, {
          port: PORT,
          environment: config.env,
          pid: process.pid,
          memory: process.memoryUsage(),
          uptime: process.uptime()
        });
      });

      // Handle server errors
      server.on('error', (error: any) => {
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
      if (config.env === 'development') {
        setInterval(() => {
          const memUsage = process.memoryUsage();
          Logger.debug('Memory usage', {
            rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
          });
        }, 60000); // Every minute
      }

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
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      Logger.error('Unhandled Rejection', {
        reason: reason?.message || reason,
        promise: promise.toString()
      });
      process.exit(1);
    });
  }
}

// Export for use
export { Logger, HealthChecker, StartupHandler };

// Start the server if this file is run directly
if (require.main === module) {
  StartupHandler.startServer();
}