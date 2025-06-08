import Joi from 'joi';

// Environment-specific configuration schema
export const configSchema = Joi.object({
  // Application Configuration
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'staging', 'production')
    .default('development'),
  
  PORT: Joi.number()
    .port()
    .default(3000),
  
  API_VERSION: Joi.string()
    .default('v1'),
  
  API_PREFIX: Joi.string()
    .default('/api'),

  // Database Configuration
  DB_HOST: Joi.string()
    .hostname()
    .required(),
  
  DB_PORT: Joi.number()
    .port()
    .default(5432),
  
  DB_NAME: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  
  DB_USER: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  
  DB_PASSWORD: Joi.string()
    .min(8)
    .required(),
  
  DB_SSL: Joi.boolean()
    .default(false),
  
  DB_CONNECTION_TIMEOUT: Joi.number()
    .min(1000)
    .max(60000)
    .default(30000),
  
  DB_MAX_CONNECTIONS: Joi.number()
    .min(1)
    .max(100)
    .default(20),

  // JWT Configuration
  JWT_SECRET: Joi.string()
    .min(32)
    .required(),
  
  JWT_REFRESH_SECRET: Joi.string()
    .min(32)
    .required(),
  
  JWT_EXPIRES_IN: Joi.string()
    .pattern(/^(\d+[smhd]|never)$/)
    .default('15m'),
  
  JWT_REFRESH_EXPIRES_IN: Joi.string()
    .pattern(/^(\d+[smhd]|never)$/)
    .default('7d'),

  // Security Configuration
  ENCRYPTION_KEY: Joi.string()
    .length(64)
    .pattern(/^[a-fA-F0-9]+$/)
    .required(),
  
  SESSION_SECRET: Joi.string()
    .min(32)
    .required(),
  
  BCRYPT_ROUNDS: Joi.number()
    .min(8)
    .max(15)
    .default(12),

  // CORS Configuration
  CORS_ORIGIN: Joi.alternatives()
    .try(
      Joi.string().uri(),
      Joi.array().items(Joi.string().uri()),
      Joi.string().valid('*'),
      Joi.boolean()
    )
    .default('*'),
  
  CORS_CREDENTIALS: Joi.boolean()
    .default(true),

  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: Joi.number()
    .min(1000)
    .max(3600000)
    .default(900000), // 15 minutes
  
  RATE_LIMIT_MAX_REQUESTS: Joi.number()
    .min(1)
    .max(10000)
    .default(100),
  
  RATE_LIMIT_SKIP_SUCCESSFUL: Joi.boolean()
    .default(false),

  // Request Configuration
  REQUEST_SIZE_LIMIT: Joi.string()
    .pattern(/^\d+[kmg]?b$/i)
    .default('10mb'),
  
  REQUEST_TIMEOUT: Joi.number()
    .min(1000)
    .max(300000)
    .default(30000),

  // File Upload Configuration
  UPLOAD_MAX_SIZE: Joi.number()
    .min(1024)
    .max(104857600) // 100MB
    .default(10485760), // 10MB
  
  UPLOAD_ALLOWED_TYPES: Joi.string()
    .default('image/jpeg,image/png,image/webp,application/pdf'),
  
  UPLOAD_DIR: Joi.string()
    .default('./uploads'),

  // Logging Configuration
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'verbose', 'debug', 'silly')
    .default('info'),
  
  LOG_FORMAT: Joi.string()
    .valid('json', 'simple', 'combined')
    .default('json'),
  
  LOG_FILE_ENABLED: Joi.boolean()
    .default(false),
  
  LOG_FILE_PATH: Joi.string()
    .default('./logs'),

  // Monitoring Configuration
  HEALTH_CHECK_INTERVAL: Joi.number()
    .min(1000)
    .max(300000)
    .default(30000),
  
  METRICS_ENABLED: Joi.boolean()
    .default(false),
  
  METRICS_PREFIX: Joi.string()
    .default('tsmartquality'),

  // Email Configuration (Optional)
  EMAIL_ENABLED: Joi.boolean()
    .default(false),
  
  EMAIL_HOST: Joi.string()
    .hostname()
    .when('EMAIL_ENABLED', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
  
  EMAIL_PORT: Joi.number()
    .port()
    .default(587),
  
  EMAIL_USER: Joi.string()
    .email()
    .when('EMAIL_ENABLED', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
  
  EMAIL_PASSWORD: Joi.string()
    .when('EMAIL_ENABLED', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    }),

  // Redis Configuration (Optional)
  REDIS_ENABLED: Joi.boolean()
    .default(false),
  
  REDIS_URL: Joi.string()
    .uri()
    .when('REDIS_ENABLED', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
  
  REDIS_PASSWORD: Joi.string()
    .when('REDIS_ENABLED', {
      is: true,
      then: Joi.optional(),
      otherwise: Joi.optional()
    }),

  // External Service Configuration
  EXTERNAL_API_TIMEOUT: Joi.number()
    .min(1000)
    .max(60000)
    .default(10000),
  
  EXTERNAL_API_RETRIES: Joi.number()
    .min(0)
    .max(5)
    .default(3),

  // Feature Flags
  FEATURE_MFA_ENABLED: Joi.boolean()
    .default(true),
  
  FEATURE_AUDIT_LOGGING: Joi.boolean()
    .default(true),
  
  FEATURE_RATE_LIMITING: Joi.boolean()
    .default(true),
  
  FEATURE_REQUEST_LOGGING: Joi.boolean()
    .default(true)
});

// Validation function
export function validateConfig(config: Record<string, any>) {
  const { error, value } = configSchema.validate(config, {
    allowUnknown: true,
    stripUnknown: true,
    abortEarly: false
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    
    throw new ConfigurationError('Configuration validation failed', errors);
  }

  return value;
}

// Custom error class for configuration errors
export class ConfigurationError extends Error {
  public readonly errors: Array<{
    field: string;
    message: string;
    value?: any;
  }>;

  constructor(message: string, errors: Array<{ field: string; message: string; value?: any }>) {
    super(message);
    this.name = 'ConfigurationError';
    this.errors = errors;
  }
}

// Environment-specific overrides
export const environmentDefaults = {
  development: {
    LOG_LEVEL: 'debug',
    CORS_ORIGIN: '*',
    RATE_LIMIT_MAX_REQUESTS: 1000,
    DB_SSL: false
  },
  test: {
    LOG_LEVEL: 'error',
    CORS_ORIGIN: 'http://localhost:3000',
    RATE_LIMIT_MAX_REQUESTS: 10000,
    DB_SSL: false,
    JWT_EXPIRES_IN: '1h'
  },
  staging: {
    LOG_LEVEL: 'info',
    CORS_ORIGIN: ['https://staging.tsmartquality.com'],
    RATE_LIMIT_MAX_REQUESTS: 500,
    DB_SSL: true,
    LOG_FILE_ENABLED: true
  },
  production: {
    LOG_LEVEL: 'warn',
    CORS_ORIGIN: ['https://tsmartquality.com', 'https://www.tsmartquality.com'],
    RATE_LIMIT_MAX_REQUESTS: 100,
    DB_SSL: true,
    LOG_FILE_ENABLED: true,
    METRICS_ENABLED: true
  }
};

// Required environment variables by environment
export const requiredByEnvironment = {
  development: ['DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'ENCRYPTION_KEY', 'SESSION_SECRET'],
  test: ['DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'ENCRYPTION_KEY', 'SESSION_SECRET'],
  staging: ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'ENCRYPTION_KEY', 'SESSION_SECRET'],
  production: ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'ENCRYPTION_KEY', 'SESSION_SECRET']
};