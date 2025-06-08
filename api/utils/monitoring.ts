import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config-manager';
import { logger } from './logger';

export interface Metric {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  cpu: NodeJS.CpuUsage;
  checks: Record<string, {
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    latency?: number;
  }>;
}

export interface SystemStats {
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
  };
  memory: {
    used: number;
    free: number;
    total: number;
    percentage: number;
  };
  uptime: number;
  errors: {
    total: number;
    rate: number; // errors per minute
  };
  security: {
    blockedRequests: number;
    rateLimitViolations: number;
    suspiciousActivity: number;
  };
}

/**
 * Application monitoring and metrics collection
 */
export class ApplicationMonitor {
  private metrics: Metric[] = [];
  private maxMetrics = 10000;
  private requestStats = {
    total: 0,
    successful: 0,
    failed: 0,
    responseTimes: [] as number[]
  };
  private errorCount = 0;
  private securityStats = {
    blockedRequests: 0,
    rateLimitViolations: 0,
    suspiciousActivity: 0
  };
  private startTime = Date.now();

  /**
   * Record a metric
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      timestamp: new Date(),
      tags
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-Math.floor(this.maxMetrics * 0.8));
    }

    if (config.monitoring.metricsEnabled) {
      logger.debug('Metric recorded', { metric });
    }
  }

  /**
   * Record request metrics
   */
  recordRequest(req: Request, res: Response, responseTime: number): void {
    this.requestStats.total++;
    
    if (res.statusCode >= 200 && res.statusCode < 400) {
      this.requestStats.successful++;
    } else {
      this.requestStats.failed++;
    }

    this.requestStats.responseTimes.push(responseTime);
    
    // Keep only last 1000 response times for average calculation
    if (this.requestStats.responseTimes.length > 1000) {
      this.requestStats.responseTimes = this.requestStats.responseTimes.slice(-1000);
    }

    // Record metrics
    this.recordMetric('http_requests_total', this.requestStats.total, {
      method: req.method,
      status: res.statusCode.toString(),
      endpoint: this.getEndpointPattern(req.route?.path || req.path)
    });

    this.recordMetric('http_request_duration', responseTime, {
      method: req.method,
      endpoint: this.getEndpointPattern(req.route?.path || req.path)
    });
  }

  /**
   * Record error
   */
  recordError(error: Error, context?: any): void {
    this.errorCount++;
    
    this.recordMetric('errors_total', this.errorCount, {
      type: error.name,
      message: error.message.substring(0, 100)
    });

    logger.logError(error, context);
  }

  /**
   * Record security event
   */
  recordSecurityEvent(type: 'blocked' | 'rate_limit' | 'suspicious', details?: any): void {
    switch (type) {
      case 'blocked':
        this.securityStats.blockedRequests++;
        break;
      case 'rate_limit':
        this.securityStats.rateLimitViolations++;
        break;
      case 'suspicious':
        this.securityStats.suspiciousActivity++;
        break;
    }

    this.recordMetric(`security_${type}_total`, this.securityStats[type === 'rate_limit' ? 'rateLimitViolations' : type === 'blocked' ? 'blockedRequests' : 'suspiciousActivity']);
  }

  /**
   * Get endpoint pattern for consistent metrics
   */
  private getEndpointPattern(path: string): string {
    return path
      .replace(/\/\d+/g, '/:id')
      .replace(/\/[a-f0-9-]{36}/g, '/:uuid')
      .replace(/\/\w{24}/g, '/:objectId')
      || '/unknown';
  }

  /**
   * Get system statistics
   */
  getSystemStats(): SystemStats {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    const averageResponseTime = this.requestStats.responseTimes.length > 0
      ? this.requestStats.responseTimes.reduce((a, b) => a + b, 0) / this.requestStats.responseTimes.length
      : 0;

    // Calculate error rate (errors per minute)
    const uptimeMinutes = uptime / 60;
    const errorRate = uptimeMinutes > 0 ? this.errorCount / uptimeMinutes : 0;

    return {
      requests: {
        total: this.requestStats.total,
        successful: this.requestStats.successful,
        failed: this.requestStats.failed,
        averageResponseTime
      },
      memory: {
        used: memUsage.heapUsed,
        free: memUsage.heapTotal - memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
      },
      uptime,
      errors: {
        total: this.errorCount,
        rate: errorRate
      },
      security: this.securityStats
    };
  }

  /**
   * Perform health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const checks: Record<string, { status: 'pass' | 'fail' | 'warn'; message?: string; latency?: number }> = {};

    // Memory check
    const memoryPercentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    if (memoryPercentage > 90) {
      checks.memory = { status: 'fail', message: 'Memory usage critical' };
    } else if (memoryPercentage > 75) {
      checks.memory = { status: 'warn', message: 'Memory usage high' };
    } else {
      checks.memory = { status: 'pass' };
    }

    // Error rate check
    const stats = this.getSystemStats();
    if (stats.errors.rate > 10) {
      checks.errors = { status: 'fail', message: 'High error rate' };
    } else if (stats.errors.rate > 5) {
      checks.errors = { status: 'warn', message: 'Elevated error rate' };
    } else {
      checks.errors = { status: 'pass' };
    }

    // Response time check
    if (stats.requests.averageResponseTime > 5000) {
      checks.response_time = { status: 'fail', message: 'Slow response times' };
    } else if (stats.requests.averageResponseTime > 2000) {
      checks.response_time = { status: 'warn', message: 'Elevated response times' };
    } else {
      checks.response_time = { status: 'pass' };
    }

    // Database connectivity check (simplified)
    try {
      // In a real implementation, you would check database connectivity here
      checks.database = { status: 'pass', latency: Date.now() - startTime };
    } catch (error) {
      checks.database = { status: 'fail', message: 'Database connection failed' };
    }

    // Determine overall status
    const hasFailures = Object.values(checks).some(check => check.status === 'fail');
    const hasWarnings = Object.values(checks).some(check => check.status === 'warn');
    
    const status = hasFailures ? 'unhealthy' : hasWarnings ? 'degraded' : 'healthy';

    return {
      status,
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: memUsage,
      cpu: cpuUsage,
      checks
    };
  }

  /**
   * Get metrics by name
   */
  getMetrics(name?: string, since?: Date): Metric[] {
    let filtered = this.metrics;

    if (name) {
      filtered = filtered.filter(m => m.name === name);
    }

    if (since) {
      filtered = filtered.filter(m => m.timestamp >= since);
    }

    return filtered;
  }

  /**
   * Get aggregated metrics
   */
  getAggregatedMetrics(name: string, period: number = 300000): { // 5 minutes default
    avg: number;
    min: number;
    max: number;
    count: number;
  } {
    const since = new Date(Date.now() - period);
    const metrics = this.getMetrics(name, since);
    
    if (metrics.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }

    const values = metrics.map(m => m.value);
    
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  }

  /**
   * Alert conditions checker
   */
  checkAlerts(): Array<{ type: string; severity: 'warning' | 'critical'; message: string; value: number }> {
    const alerts = [];
    const stats = this.getSystemStats();

    // Memory alerts
    if (stats.memory.percentage > 90) {
      alerts.push({
        type: 'memory',
        severity: 'critical' as const,
        message: 'Memory usage is critically high',
        value: stats.memory.percentage
      });
    } else if (stats.memory.percentage > 75) {
      alerts.push({
        type: 'memory',
        severity: 'warning' as const,
        message: 'Memory usage is elevated',
        value: stats.memory.percentage
      });
    }

    // Error rate alerts
    if (stats.errors.rate > 10) {
      alerts.push({
        type: 'error_rate',
        severity: 'critical' as const,
        message: 'Error rate is critically high',
        value: stats.errors.rate
      });
    } else if (stats.errors.rate > 5) {
      alerts.push({
        type: 'error_rate',
        severity: 'warning' as const,
        message: 'Error rate is elevated',
        value: stats.errors.rate
      });
    }

    // Response time alerts
    if (stats.requests.averageResponseTime > 5000) {
      alerts.push({
        type: 'response_time',
        severity: 'critical' as const,
        message: 'Response times are critically slow',
        value: stats.requests.averageResponseTime
      });
    } else if (stats.requests.averageResponseTime > 2000) {
      alerts.push({
        type: 'response_time',
        severity: 'warning' as const,
        message: 'Response times are elevated',
        value: stats.requests.averageResponseTime
      });
    }

    return alerts;
  }

  /**
   * Reset statistics
   */
  reset(): void {
    this.metrics = [];
    this.requestStats = {
      total: 0,
      successful: 0,
      failed: 0,
      responseTimes: []
    };
    this.errorCount = 0;
    this.securityStats = {
      blockedRequests: 0,
      rateLimitViolations: 0,
      suspiciousActivity: 0
    };
    this.startTime = Date.now();
  }
}

// Global monitor instance
export const monitor = new ApplicationMonitor();

/**
 * Monitoring middleware
 */
export function monitoringMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      monitor.recordRequest(req, res, responseTime);
    });

    next();
  };
}

/**
 * Error monitoring middleware
 */
export function errorMonitoringMiddleware() {
  return (error: Error, req: Request, res: Response, next: NextFunction) => {
    monitor.recordError(error, {
      requestId: req.headers['x-request-id'],
      userId: (req as any).userId,
      ip: req.ip,
      url: req.originalUrl,
      method: req.method
    });

    next(error);
  };
}

/**
 * Periodic monitoring tasks
 */
export function startPeriodicMonitoring(): void {
  // Check alerts every minute
  setInterval(() => {
    const alerts = monitor.checkAlerts();
    
    alerts.forEach(alert => {
      if (alert.severity === 'critical') {
        logger.error(`Critical Alert: ${alert.message}`, { alert });
      } else {
        logger.warn(`Warning Alert: ${alert.message}`, { alert });
      }
    });
  }, 60000);

  // Log system stats every 5 minutes
  setInterval(() => {
    const stats = monitor.getSystemStats();
    logger.info('System Statistics', { stats });
  }, 300000);

  // Cleanup old metrics every hour
  setInterval(() => {
    const oldMetricsCount = monitor.getMetrics().length;
    // This is handled internally by the monitor
    logger.debug('Metrics cleanup completed', { oldCount: oldMetricsCount });
  }, 3600000);

  logger.info('Periodic monitoring started');
}

/**
 * Performance timing decorator
 */
export function timed(name: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;
        
        monitor.recordMetric(`${name}_duration`, duration);
        logger.logPerformance(name, duration);
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        monitor.recordMetric(`${name}_duration`, duration, { status: 'error' });
        monitor.recordError(error as Error, { operation: name });
        
        throw error;
      }
    };

    return descriptor;
  };
}