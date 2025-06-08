import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { config } from '../config/config-manager';

export interface SecurityOptions {
  contentSecurityPolicy?: boolean;
  crossOriginEmbedderPolicy?: boolean;
  crossOriginOpenerPolicy?: boolean;
  crossOriginResourcePolicy?: boolean;
  dnsPrefetchControl?: boolean;
  frameguard?: boolean;
  hidePoweredBy?: boolean;
  hsts?: boolean;
  ieNoOpen?: boolean;
  noSniff?: boolean;
  originAgentCluster?: boolean;
  permittedCrossDomainPolicies?: boolean;
  referrerPolicy?: boolean;
  xssFilter?: boolean;
}

/**
 * Comprehensive security headers middleware using Helmet
 */
export function securityHeaders(options: SecurityOptions = {}) {
  const isProduction = config.nodeEnv === 'production';
  
  return helmet({
    // Content Security Policy
    contentSecurityPolicy: options.contentSecurityPolicy !== false ? {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
        connectSrc: ["'self'", "https:", "wss:"],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"],
        childSrc: ["'self'"],
        frameSrc: ["'self'"],
        workerSrc: ["'self'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: isProduction ? [] : null,
        blockAllMixedContent: isProduction ? [] : null
      }
    } : false,

    // Cross-Origin Embedder Policy
    crossOriginEmbedderPolicy: options.crossOriginEmbedderPolicy !== false ? {
      policy: "require-corp"
    } : false,

    // Cross-Origin Opener Policy
    crossOriginOpenerPolicy: options.crossOriginOpenerPolicy !== false ? {
      policy: "same-origin"
    } : false,

    // Cross-Origin Resource Policy
    crossOriginResourcePolicy: options.crossOriginResourcePolicy !== false ? {
      policy: "cross-origin"
    } : false,

    // DNS Prefetch Control
    dnsPrefetchControl: options.dnsPrefetchControl !== false ? {
      allow: false
    } : false,

    // Frame Options
    frameguard: options.frameguard !== false ? {
      action: 'deny'
    } : false,

    // Hide X-Powered-By header
    hidePoweredBy: options.hidePoweredBy !== false,

    // HTTP Strict Transport Security
    hsts: options.hsts !== false && isProduction ? {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    } : false,

    // IE No Open
    ieNoOpen: options.ieNoOpen !== false,

    // X-Content-Type-Options
    noSniff: options.noSniff !== false,

    // Origin Agent Cluster
    originAgentCluster: options.originAgentCluster !== false,

    // Permitted Cross-Domain Policies
    permittedCrossDomainPolicies: options.permittedCrossDomainPolicies !== false ? {
      permittedPolicies: "none"
    } : false,

    // Referrer Policy
    referrerPolicy: options.referrerPolicy !== false ? {
      policy: ["no-referrer", "strict-origin-when-cross-origin"]
    } : false,

    // XSS Filter
    xssFilter: options.xssFilter !== false
  });
}

/**
 * Request compression middleware
 */
export function compressionMiddleware() {
  return compression({
    level: 6,
    threshold: 1024, // Only compress responses > 1KB
    filter: (req: Request, res: Response) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  });
}

/**
 * Request timeout middleware
 */
export function requestTimeout(timeout: number = config.request.timeout) {
  return (req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: 'Request timeout',
          code: 'REQUEST_TIMEOUT'
        });
      }
    }, timeout);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
}

/**
 * Request size limiting middleware
 */
export function requestSizeLimit() {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSize = parseInt(config.request.sizeLimit.replace(/[^\d]/g, '')) * 1024 * 1024; // Convert to bytes

    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        message: 'Request entity too large',
        code: 'REQUEST_TOO_LARGE',
        maxSize: config.request.sizeLimit
      });
    }

    next();
  };
}

/**
 * Remove sensitive headers from responses
 */
export function sanitizeResponseHeaders() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Remove sensitive headers
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');
    
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    if (config.nodeEnv === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    next();
  };
}

/**
 * Security monitoring middleware
 */
export function securityMonitoring() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Log suspicious request patterns
    const suspiciousPatterns = [
      /\.\.\//g, // Directory traversal
      /<script/gi, // XSS attempts
      /union.*select/gi, // SQL injection attempts
      /eval\(/gi, // Code injection attempts
      /javascript:/gi, // JavaScript protocol
      /vbscript:/gi, // VBScript protocol
      /onload=/gi, // Event handler injection
      /onerror=/gi // Error handler injection
    ];

    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers.referer || '';
    const origin = req.headers.origin || '';
    const url = req.url;
    const query = JSON.stringify(req.query);
    const body = JSON.stringify(req.body);

    const allContent = `${url} ${query} ${body} ${userAgent} ${referer} ${origin}`;

    const suspiciousActivity = suspiciousPatterns.some(pattern => pattern.test(allContent));

    if (suspiciousActivity) {
      console.warn('Suspicious request detected:', {
        ip: req.ip,
        userAgent,
        url,
        method: req.method,
        timestamp: new Date().toISOString(),
        headers: req.headers
      });

      // In production, you might want to block the request
      if (config.nodeEnv === 'production') {
        return res.status(400).json({
          success: false,
          message: 'Invalid request',
          code: 'SUSPICIOUS_REQUEST'
        });
      }
    }

    next();
  };
}

/**
 * IP filtering middleware
 */
export function ipFiltering(options: {
  whitelist?: string[];
  blacklist?: string[];
} = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.connection.remoteAddress || '';

    // Check blacklist first
    if (options.blacklist && options.blacklist.includes(clientIp)) {
      console.warn('Blocked IP attempted access:', { ip: clientIp, timestamp: new Date().toISOString() });
      return res.status(403).json({
        success: false,
        message: 'Access forbidden',
        code: 'IP_BLOCKED'
      });
    }

    // Check whitelist if configured
    if (options.whitelist && options.whitelist.length > 0) {
      if (!options.whitelist.includes(clientIp)) {
        console.warn('Non-whitelisted IP attempted access:', { ip: clientIp, timestamp: new Date().toISOString() });
        return res.status(403).json({
          success: false,
          message: 'Access forbidden',
          code: 'IP_NOT_WHITELISTED'
        });
      }
    }

    next();
  };
}

/**
 * CORS configuration
 */
export function corsConfiguration() {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    const allowedOrigins = config.cors.origin;

    // Handle CORS origin
    if (allowedOrigins === '*') {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (allowedOrigins === true) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (Array.isArray(allowedOrigins)) {
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
    } else if (typeof allowedOrigins === 'string' && origin === allowedOrigins) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // Set other CORS headers
    if (config.cors.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    next();
  };
}

/**
 * HTTP Parameter Pollution protection
 */
export function hppProtection() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Protect against HPP attacks by ensuring query parameters are not arrays
    // unless specifically allowed
    const allowedArrayParams = ['tags', 'categories', 'ids'];

    for (const [key, value] of Object.entries(req.query)) {
      if (Array.isArray(value) && !allowedArrayParams.includes(key)) {
        req.query[key] = value[value.length - 1]; // Take the last value
      }
    }

    next();
  };
}

/**
 * Request ID middleware for tracing
 */
export function requestId() {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.headers['x-request-id'] as string || 
                     `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);

    next();
  };
}

/**
 * Security event logger
 */
export interface SecurityEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  userAgent: string;
  url: string;
  method: string;
  timestamp: Date;
  details?: any;
}

class SecurityEventLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000;

  logEvent(event: SecurityEvent) {
    this.events.push(event);
    
    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log high and critical severity events
    if (event.severity === 'high' || event.severity === 'critical') {
      console.error('Security Event:', event);
    }
  }

  getEvents(limit: number = 100): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  getEventsByType(type: string, limit: number = 100): SecurityEvent[] {
    return this.events.filter(e => e.type === type).slice(-limit);
  }

  getEventsBySeverity(severity: SecurityEvent['severity'], limit: number = 100): SecurityEvent[] {
    return this.events.filter(e => e.severity === severity).slice(-limit);
  }
}

export const securityEventLogger = new SecurityEventLogger();