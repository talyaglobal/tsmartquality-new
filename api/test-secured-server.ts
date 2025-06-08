import express, { Request, Response } from 'express';
import { config } from './config/config-manager';

// Import our security middleware
import {
  securityHeaders,
  compressionMiddleware,
  requestTimeout,
  requestSizeLimit,
  corsConfiguration
} from './middleware/security.middleware';

import {
  globalRateLimit
} from './middleware/rate-limiting.middleware';

import {
  sanitizeInputs,
  detectSQLInjection
} from './middleware/validation.middleware';

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security headers
app.use(securityHeaders({
  contentSecurityPolicy: config.nodeEnv === 'production',
  hsts: config.nodeEnv === 'production'
}));

// CORS configuration
app.use(corsConfiguration());

// Response compression
app.use(compressionMiddleware());

// Request timeout
app.use(requestTimeout(config.request.timeout));

// Request size limiting
app.use(requestSizeLimit());

// Rate limiting
if (config.features.rateLimiting) {
  app.use(globalRateLimit);
}

// Input sanitization
app.use(sanitizeInputs({
  logViolations: true
}));

// Injection attack detection
app.use(detectSQLInjection());

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

// Test endpoints
app.get('/ping', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: config.apiVersion 
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: config.apiVersion,
    uptime: process.uptime()
  });
});

app.get('/health/detailed', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: config.apiVersion,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks: {
      server: true,
      security: true
    }
  });
});

app.get('/security/status', (req: Request, res: Response) => {
  res.json({
    security: {
      rateLimiting: config.features.rateLimiting,
      headers: true,
      inputValidation: true
    },
    features: {
      rateLimiting: config.features.rateLimiting,
      auditLogging: config.features.auditLogging,
      requestLogging: config.features.requestLogging
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/metrics', (req: Request, res: Response) => {
  if (!config.monitoring.metricsEnabled) {
    return res.status(404).json({
      success: false,
      message: 'Metrics endpoint disabled'
    });
  }

  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Test API endpoint
app.post('/api/test', (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    data: req.body,
    sanitized: true
  });
});

app.get('/api/users', (req: Request, res: Response) => {
  const { search } = req.query;
  res.json({ 
    success: true, 
    query: search,
    users: []
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err.message);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Secured test server running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Rate limiting: ${config.features.rateLimiting ? 'enabled' : 'disabled'}`);
  console.log(`Security headers: enabled`);
  console.log(`Input validation: enabled`);
});