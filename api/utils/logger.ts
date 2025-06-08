import * as fs from 'fs';
import * as path from 'path';
import { config } from '../config/config-manager';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  VERBOSE = 3,
  DEBUG = 4,
  SILLY = 5
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  metadata?: any;
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LoggerOptions {
  level: string;
  format: 'json' | 'simple' | 'combined';
  fileEnabled: boolean;
  filePath: string;
  console: boolean;
  maxFileSize: number;
  maxFiles: number;
}

/**
 * Structured logger with multiple output formats and transports
 */
export class StructuredLogger {
  private options: LoggerOptions;
  private logLevelMap: Record<string, LogLevel> = {
    error: LogLevel.ERROR,
    warn: LogLevel.WARN,
    info: LogLevel.INFO,
    verbose: LogLevel.VERBOSE,
    debug: LogLevel.DEBUG,
    silly: LogLevel.SILLY
  };

  constructor(options?: Partial<LoggerOptions>) {
    this.options = {
      level: config.logging.level,
      format: config.logging.format as 'json' | 'simple' | 'combined',
      fileEnabled: config.logging.fileEnabled,
      filePath: config.logging.filePath,
      console: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      ...options
    };

    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (this.options.fileEnabled && !fs.existsSync(this.options.filePath)) {
      fs.mkdirSync(this.options.filePath, { recursive: true });
    }
  }

  private shouldLog(level: string): boolean {
    const currentLevel = this.logLevelMap[this.options.level] || LogLevel.INFO;
    const messageLevel = this.logLevelMap[level] || LogLevel.INFO;
    return messageLevel <= currentLevel;
  }

  private formatMessage(entry: LogEntry): string {
    switch (this.options.format) {
      case 'json':
        return JSON.stringify(entry);
      
      case 'simple':
        return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${
          entry.metadata ? ' | ' + JSON.stringify(entry.metadata) : ''
        }`;
      
      case 'combined':
        const parts = [
          `[${entry.timestamp}]`,
          `[${entry.level.toUpperCase()}]`,
          entry.requestId ? `[${entry.requestId}]` : '',
          entry.ip ? `[${entry.ip}]` : '',
          entry.message
        ].filter(Boolean);
        
        return parts.join(' ') + (entry.metadata ? ' | ' + JSON.stringify(entry.metadata) : '');
      
      default:
        return JSON.stringify(entry);
    }
  }

  private writeToConsole(entry: LogEntry): void {
    if (!this.options.console) return;

    const message = this.formatMessage(entry);
    
    switch (entry.level) {
      case 'error':
        console.error(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      default:
        console.log(message);
    }
  }

  private writeToFile(entry: LogEntry): void {
    if (!this.options.fileEnabled) return;

    try {
      const logFile = path.join(this.options.filePath, `app.log`);
      const message = this.formatMessage(entry) + '\n';

      // Check file size and rotate if necessary
      this.rotateLogFile(logFile);

      fs.appendFileSync(logFile, message, 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private rotateLogFile(logFile: string): void {
    try {
      if (!fs.existsSync(logFile)) return;

      const stats = fs.statSync(logFile);
      if (stats.size < this.options.maxFileSize) return;

      // Rotate log files
      for (let i = this.options.maxFiles - 1; i > 0; i--) {
        const oldFile = `${logFile}.${i}`;
        const newFile = `${logFile}.${i + 1}`;
        
        if (fs.existsSync(oldFile)) {
          if (i === this.options.maxFiles - 1) {
            fs.unlinkSync(oldFile); // Delete oldest file
          } else {
            fs.renameSync(oldFile, newFile);
          }
        }
      }

      fs.renameSync(logFile, `${logFile}.1`);
    } catch (error) {
      console.error('Failed to rotate log file:', error);
    }
  }

  private createLogEntry(
    level: string,
    message: string,
    metadata?: any,
    context?: Partial<LogEntry>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
      ...context
    };
  }

  log(level: string, message: string, metadata?: any, context?: Partial<LogEntry>): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, metadata, context);
    
    this.writeToConsole(entry);
    this.writeToFile(entry);
  }

  error(message: string, metadata?: any, context?: Partial<LogEntry>): void {
    this.log('error', message, metadata, context);
  }

  warn(message: string, metadata?: any, context?: Partial<LogEntry>): void {
    this.log('warn', message, metadata, context);
  }

  info(message: string, metadata?: any, context?: Partial<LogEntry>): void {
    this.log('info', message, metadata, context);
  }

  verbose(message: string, metadata?: any, context?: Partial<LogEntry>): void {
    this.log('verbose', message, metadata, context);
  }

  debug(message: string, metadata?: any, context?: Partial<LogEntry>): void {
    this.log('debug', message, metadata, context);
  }

  silly(message: string, metadata?: any, context?: Partial<LogEntry>): void {
    this.log('silly', message, metadata, context);
  }

  // HTTP request logging
  logRequest(req: any, res: any, responseTime: number): void {
    const entry = this.createLogEntry('info', 'HTTP Request', {
      request: {
        method: req.method,
        url: req.originalUrl || req.url,
        headers: this.sanitizeHeaders(req.headers),
        query: req.query,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      },
      response: {
        statusCode: res.statusCode,
        headers: this.sanitizeHeaders(res.getHeaders()),
        responseTime
      },
      user: {
        id: req.userId,
        role: req.role
      }
    }, {
      requestId: req.headers['x-request-id'],
      userId: req.userId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      url: req.originalUrl || req.url,
      method: req.method,
      statusCode: res.statusCode,
      responseTime
    });

    this.writeToConsole(entry);
    this.writeToFile(entry);
  }

  // Error logging with stack trace
  logError(error: Error, context?: Partial<LogEntry>): void {
    const entry = this.createLogEntry('error', error.message, {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    }, {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });

    this.writeToConsole(entry);
    this.writeToFile(entry);
  }

  // Security event logging
  logSecurityEvent(event: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    ip?: string;
    userAgent?: string;
    userId?: string;
    details?: any;
  }, context?: Partial<LogEntry>): void {
    const level = event.severity === 'critical' ? 'error' : 
                  event.severity === 'high' ? 'warn' : 'info';

    const entry = this.createLogEntry(level, `SECURITY: ${event.message}`, {
      security: {
        type: event.type,
        severity: event.severity,
        details: event.details
      }
    }, {
      ...context,
      userId: event.userId,
      ip: event.ip,
      userAgent: event.userAgent
    });

    this.writeToConsole(entry);
    this.writeToFile(entry);

    // Also write to security-specific log file
    if (this.options.fileEnabled) {
      try {
        const securityLogFile = path.join(this.options.filePath, 'security.log');
        const message = this.formatMessage(entry) + '\n';
        fs.appendFileSync(securityLogFile, message, 'utf8');
      } catch (error) {
        console.error('Failed to write to security log file:', error);
      }
    }
  }

  // Performance logging
  logPerformance(operation: string, duration: number, metadata?: any, context?: Partial<LogEntry>): void {
    const level = duration > 5000 ? 'warn' : duration > 1000 ? 'info' : 'debug';
    
    this.log(level, `Performance: ${operation}`, {
      performance: {
        operation,
        duration,
        ...metadata
      }
    }, context);
  }

  // Database query logging
  logDatabaseQuery(query: string, duration: number, metadata?: any, context?: Partial<LogEntry>): void {
    if (config.nodeEnv === 'production' && duration < 1000) {
      return; // Only log slow queries in production
    }

    this.log('debug', 'Database Query', {
      database: {
        query: this.sanitizeQuery(query),
        duration,
        ...metadata
      }
    }, context);
  }

  private sanitizeHeaders(headers: any): any {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
    const sanitized = { ...headers };

    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sanitizeQuery(query: string): string {
    // Remove potential sensitive data from queries
    return query
      .replace(/password\s*=\s*'[^']*'/gi, "password = '[REDACTED]'")
      .replace(/token\s*=\s*'[^']*'/gi, "token = '[REDACTED]'")
      .replace(/secret\s*=\s*'[^']*'/gi, "secret = '[REDACTED]'");
  }

  // Get log statistics
  getStats(): {
    level: string;
    format: string;
    fileEnabled: boolean;
    totalEntries: number;
  } {
    let totalEntries = 0;

    if (this.options.fileEnabled) {
      try {
        const logFile = path.join(this.options.filePath, 'app.log');
        if (fs.existsSync(logFile)) {
          const content = fs.readFileSync(logFile, 'utf8');
          totalEntries = content.split('\n').filter(line => line.trim()).length;
        }
      } catch (error) {
        // Ignore errors
      }
    }

    return {
      level: this.options.level,
      format: this.options.format,
      fileEnabled: this.options.fileEnabled,
      totalEntries
    };
  }

  // Clean up old log files
  cleanup(maxAgeMs: number = 30 * 24 * 60 * 60 * 1000): void { // 30 days
    if (!this.options.fileEnabled) return;

    try {
      const files = fs.readdirSync(this.options.filePath);
      const cutoffTime = Date.now() - maxAgeMs;

      files.forEach(file => {
        const filePath = path.join(this.options.filePath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          this.info(`Cleaned up old log file: ${file}`);
        }
      });
    } catch (error) {
      this.error('Failed to cleanup log files', { error });
    }
  }
}

// Create default logger instance
export const logger = new StructuredLogger();

// Export a simplified interface compatible with existing code
export const Logger = {
  error: (message: string, metadata?: any) => logger.error(message, metadata),
  warn: (message: string, metadata?: any) => logger.warn(message, metadata),
  info: (message: string, metadata?: any) => logger.info(message, metadata),
  debug: (message: string, metadata?: any) => logger.debug(message, metadata),
  
  // Request logging middleware
  middleware: () => {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();

      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        logger.logRequest(req, res, responseTime);
      });

      next();
    };
  }
};