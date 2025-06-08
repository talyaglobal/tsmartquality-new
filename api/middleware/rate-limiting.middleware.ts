import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Request, Response } from 'express';
import { config } from '../config/config-manager';
import { securityEventLogger } from './security.middleware';

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request, res: Response) => boolean;
  onLimitReached?: (req: Request, res: Response) => void;
}

/**
 * Create a rate limiter with custom configuration
 */
export function createRateLimit(rateLimitConfig: Partial<RateLimitConfig> = {}) {
  const defaultConfig: RateLimitConfig = {
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: config.rateLimit.skipSuccessful,
    skipFailedRequests: false,
    keyGenerator: (req: Request) => {
      return req.ip || req.connection.remoteAddress || 'unknown';
    },
    onLimitReached: (req: Request, res: Response) => {
      securityEventLogger.logEvent({
        type: 'rate_limit_exceeded',
        severity: 'medium',
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date(),
        details: {
          limit: rateLimitConfig.max || config.rateLimit.maxRequests,
          window: rateLimitConfig.windowMs || config.rateLimit.windowMs
        }
      });
    }
  };

  const finalConfig = { ...defaultConfig, ...rateLimitConfig };
  
  return rateLimit(finalConfig);
}

/**
 * Global rate limiter for all requests
 */
export const globalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // More generous global limit
  message: 'Too many requests from this IP, please try again later'
});

/**
 * Authentication rate limiter (stricter)
 */
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true, // Don't count successful logins
  onLimitReached: (req: Request, res: Response) => {
    securityEventLogger.logEvent({
      type: 'auth_rate_limit_exceeded',
      severity: 'high',
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date(),
      details: {
        limit: 5,
        window: 15 * 60 * 1000,
        endpoint: req.originalUrl
      }
    });
  }
});

/**
 * Password reset rate limiter (very strict)
 */
export const passwordResetRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 password reset attempts per hour
  message: 'Too many password reset attempts, please try again later',
  keyGenerator: (req: Request) => {
    // Rate limit by email if provided, otherwise by IP
    const email = req.body?.email || req.query?.email;
    return email ? `email:${email}` : `ip:${req.ip}`;
  }
});

/**
 * API rate limiter for general API calls
 */
export const apiRateLimit = createRateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'API rate limit exceeded, please try again later'
});

/**
 * File upload rate limiter
 */
export const uploadRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 uploads per 15 minutes
  message: 'Too many file uploads, please try again later',
  skip: (req: Request) => {
    // Skip if not a file upload request
    return !req.headers['content-type']?.includes('multipart/form-data');
  }
});

/**
 * Search rate limiter (more generous for searches)
 */
export const searchRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: 'Too many search requests, please try again later'
});

/**
 * User-specific rate limiter (for authenticated users)
 */
export function createUserRateLimit(options: Partial<RateLimitConfig> = {}) {
  return createRateLimit({
    ...options,
    keyGenerator: (req: Request) => {
      // Use user ID if authenticated, otherwise fall back to IP
      const userId = (req as any).userId;
      return userId ? `user:${userId}` : `ip:${req.ip}`;
    }
  });
}

/**
 * Slow down middleware for gradual response delays
 */
export function createSlowDown(options: {
  windowMs?: number;
  delayAfter?: number;
  delayMs?: number;
  maxDelayMs?: number;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
} = {}) {
  return slowDown({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    delayAfter: options.delayAfter || 50, // Allow 50 requests per window without delay
    delayMs: options.delayMs || 100, // Add 100ms delay per request after delayAfter
    maxDelayMs: options.maxDelayMs || 2000, // Maximum delay of 2 seconds
    skipFailedRequests: options.skipFailedRequests || false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    keyGenerator: (req: Request) => {
      return req.ip || req.connection.remoteAddress || 'unknown';
    }
  });
}

/**
 * Adaptive rate limiting based on server load
 */
export class AdaptiveRateLimit {
  private baseMax: number;
  private currentMax: number;
  private lastAdjustment: number = Date.now();
  private adjustmentInterval: number = 60000; // 1 minute

  constructor(baseMax: number = 100) {
    this.baseMax = baseMax;
    this.currentMax = baseMax;
  }

  getLimit(): number {
    this.adjustBasedOnLoad();
    return this.currentMax;
  }

  private adjustBasedOnLoad(): void {
    const now = Date.now();
    if (now - this.lastAdjustment < this.adjustmentInterval) {
      return;
    }

    // Get basic system metrics
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Calculate load factor (simplified)
    const memoryPressure = memUsage.heapUsed / memUsage.heapTotal;
    const loadFactor = memoryPressure;

    if (loadFactor > 0.8) {
      // High load: reduce limits
      this.currentMax = Math.max(Math.floor(this.baseMax * 0.5), 10);
    } else if (loadFactor > 0.6) {
      // Medium load: moderate reduction
      this.currentMax = Math.max(Math.floor(this.baseMax * 0.75), 25);
    } else {
      // Normal load: use base limits
      this.currentMax = this.baseMax;
    }

    this.lastAdjustment = now;
  }

  createMiddleware() {
    return createRateLimit({
      max: this.currentMax,
      windowMs: config.rateLimit.windowMs,
      message: 'Server is under high load, please try again later'
    });
  }
}

/**
 * Create adaptive rate limiter instance
 */
export const adaptiveRateLimit = new AdaptiveRateLimit(config.rateLimit.maxRequests);

/**
 * Rate limit monitoring and alerting
 */
export class RateLimitMonitor {
  private violations: Map<string, number> = new Map();
  private alertThreshold: number = 10;
  private resetInterval: number = 3600000; // 1 hour

  constructor() {
    // Reset violation counts periodically
    setInterval(() => {
      this.violations.clear();
    }, this.resetInterval);
  }

  recordViolation(ip: string): void {
    const current = this.violations.get(ip) || 0;
    this.violations.set(ip, current + 1);

    if (current + 1 >= this.alertThreshold) {
      this.alertHighViolations(ip, current + 1);
    }
  }

  private alertHighViolations(ip: string, count: number): void {
    securityEventLogger.logEvent({
      type: 'rate_limit_abuse',
      severity: 'critical',
      ip,
      userAgent: 'unknown',
      url: 'multiple',
      method: 'multiple',
      timestamp: new Date(),
      details: {
        violationCount: count,
        threshold: this.alertThreshold,
        timeWindow: this.resetInterval
      }
    });

    console.error(`Critical: IP ${ip} has exceeded rate limits ${count} times in the last hour`);
  }

  getViolations(): Map<string, number> {
    return new Map(this.violations);
  }

  isAbuser(ip: string): boolean {
    return (this.violations.get(ip) || 0) >= this.alertThreshold;
  }
}

export const rateLimitMonitor = new RateLimitMonitor();

/**
 * Enhanced rate limit middleware with monitoring
 */
export function enhancedRateLimit(options: Partial<RateLimitConfig> = {}) {
  const limiter = createRateLimit(options);
  
  return (req: Request, res: Response, next: Function) => {
    // Check if IP is a known abuser
    const ip = req.ip || 'unknown';
    if (rateLimitMonitor.isAbuser(ip)) {
      securityEventLogger.logEvent({
        type: 'blocked_abuser_request',
        severity: 'high',
        ip,
        userAgent: req.headers['user-agent'] || 'unknown',
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date()
      });

      return res.status(429).json({
        success: false,
        message: 'Access temporarily restricted due to abuse',
        code: 'RATE_LIMIT_ABUSER'
      });
    }

    // Apply rate limiting
    limiter(req, res, (error?: any) => {
      if (error) {
        rateLimitMonitor.recordViolation(ip);
      }
      next(error);
    });
  };
}