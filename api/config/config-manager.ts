import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import CryptoJS from 'crypto-js';
import { validateConfig, environmentDefaults, requiredByEnvironment, ConfigurationError } from './schema';

export interface AppConfig {
  // Application
  nodeEnv: string;
  port: number;
  apiVersion: string;
  apiPrefix: string;

  // Database
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    ssl: boolean;
    connectionTimeout: number;
    maxConnections: number;
  };

  // JWT
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };

  // Security
  security: {
    encryptionKey: string;
    sessionSecret: string;
    bcryptRounds: number;
  };

  // CORS
  cors: {
    origin: string | string[] | boolean;
    credentials: boolean;
  };

  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    skipSuccessful: boolean;
  };

  // Request Configuration
  request: {
    sizeLimit: string;
    timeout: number;
  };

  // File Upload
  upload: {
    maxSize: number;
    allowedTypes: string[];
    directory: string;
  };

  // Logging
  logging: {
    level: string;
    format: string;
    fileEnabled: boolean;
    filePath: string;
  };

  // Monitoring
  monitoring: {
    healthCheckInterval: number;
    metricsEnabled: boolean;
    metricsPrefix: string;
  };

  // Email (Optional)
  email?: {
    enabled: boolean;
    host?: string;
    port?: number;
    user?: string;
    password?: string;
  };

  // Redis (Optional)
  redis?: {
    enabled: boolean;
    url?: string;
    password?: string;
  };

  // External Services
  external: {
    apiTimeout: number;
    apiRetries: number;
  };

  // Feature Flags
  features: {
    mfaEnabled: boolean;
    auditLogging: boolean;
    rateLimiting: boolean;
    requestLogging: boolean;
  };
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config!: AppConfig;
  private encryptionKey!: string;
  private isLoaded = false;

  private constructor() {
    this.loadConfiguration();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfiguration(): void {
    try {
      // Load environment files
      this.loadEnvironmentFiles();

      // Get base configuration from environment
      const rawConfig = this.getRawConfiguration();

      // Apply environment-specific defaults
      const configWithDefaults = this.applyEnvironmentDefaults(rawConfig);

      // Validate configuration
      const validatedConfig = validateConfig(configWithDefaults);

      // Transform to application config
      this.config = this.transformToAppConfig(validatedConfig);

      // Store encryption key
      this.encryptionKey = validatedConfig.ENCRYPTION_KEY;

      // Validate required secrets
      this.validateRequiredSecrets();

      this.isLoaded = true;
      
      console.log(`Configuration loaded successfully for ${this.config.nodeEnv} environment`);
    } catch (error) {
      if (error instanceof ConfigurationError) {
        console.error('Configuration validation failed:');
        error.errors.forEach(err => {
          console.error(`  - ${err.field}: ${err.message}`);
        });
      } else {
        console.error('Failed to load configuration:', error);
      }
      process.exit(1);
    }
  }

  private loadEnvironmentFiles(): void {
    const environment = process.env.NODE_ENV || 'development';
    const rootDir = process.cwd();

    // Load environment files in order of priority (last loaded takes precedence)
    const envFiles = [
      '.env',
      `.env.${environment}`,
      '.env.local',
      `.env.${environment}.local`
    ];

    envFiles.forEach(file => {
      const filePath = path.join(rootDir, file);
      if (fs.existsSync(filePath)) {
        dotenv.config({ path: filePath });
        console.log(`Loaded environment file: ${file}`);
      }
    });
  }

  private getRawConfiguration(): Record<string, any> {
    return {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      API_VERSION: process.env.API_VERSION,
      API_PREFIX: process.env.API_PREFIX,
      
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_SSL: process.env.DB_SSL,
      DB_CONNECTION_TIMEOUT: process.env.DB_CONNECTION_TIMEOUT,
      DB_MAX_CONNECTIONS: process.env.DB_MAX_CONNECTIONS,
      
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
      JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
      
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
      SESSION_SECRET: process.env.SESSION_SECRET,
      BCRYPT_ROUNDS: process.env.BCRYPT_ROUNDS,
      
      CORS_ORIGIN: process.env.CORS_ORIGIN,
      CORS_CREDENTIALS: process.env.CORS_CREDENTIALS,
      
      RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
      RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
      RATE_LIMIT_SKIP_SUCCESSFUL: process.env.RATE_LIMIT_SKIP_SUCCESSFUL,
      
      REQUEST_SIZE_LIMIT: process.env.REQUEST_SIZE_LIMIT,
      REQUEST_TIMEOUT: process.env.REQUEST_TIMEOUT,
      
      UPLOAD_MAX_SIZE: process.env.UPLOAD_MAX_SIZE,
      UPLOAD_ALLOWED_TYPES: process.env.UPLOAD_ALLOWED_TYPES,
      UPLOAD_DIR: process.env.UPLOAD_DIR,
      
      LOG_LEVEL: process.env.LOG_LEVEL,
      LOG_FORMAT: process.env.LOG_FORMAT,
      LOG_FILE_ENABLED: process.env.LOG_FILE_ENABLED,
      LOG_FILE_PATH: process.env.LOG_FILE_PATH,
      
      HEALTH_CHECK_INTERVAL: process.env.HEALTH_CHECK_INTERVAL,
      METRICS_ENABLED: process.env.METRICS_ENABLED,
      METRICS_PREFIX: process.env.METRICS_PREFIX,
      
      EMAIL_ENABLED: process.env.EMAIL_ENABLED,
      EMAIL_HOST: process.env.EMAIL_HOST,
      EMAIL_PORT: process.env.EMAIL_PORT,
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
      
      REDIS_ENABLED: process.env.REDIS_ENABLED,
      REDIS_URL: process.env.REDIS_URL,
      REDIS_PASSWORD: process.env.REDIS_PASSWORD,
      
      EXTERNAL_API_TIMEOUT: process.env.EXTERNAL_API_TIMEOUT,
      EXTERNAL_API_RETRIES: process.env.EXTERNAL_API_RETRIES,
      
      FEATURE_MFA_ENABLED: process.env.FEATURE_MFA_ENABLED,
      FEATURE_AUDIT_LOGGING: process.env.FEATURE_AUDIT_LOGGING,
      FEATURE_RATE_LIMITING: process.env.FEATURE_RATE_LIMITING,
      FEATURE_REQUEST_LOGGING: process.env.FEATURE_REQUEST_LOGGING
    };
  }

  private applyEnvironmentDefaults(config: Record<string, any>): Record<string, any> {
    const environment = config.NODE_ENV || 'development';
    const defaults = environmentDefaults[environment as keyof typeof environmentDefaults] || {};
    
    return { ...config, ...defaults };
  }

  private transformToAppConfig(validatedConfig: Record<string, any>): AppConfig {
    return {
      nodeEnv: validatedConfig.NODE_ENV,
      port: validatedConfig.PORT,
      apiVersion: validatedConfig.API_VERSION,
      apiPrefix: validatedConfig.API_PREFIX,

      database: {
        host: validatedConfig.DB_HOST,
        port: validatedConfig.DB_PORT,
        name: validatedConfig.DB_NAME,
        user: validatedConfig.DB_USER,
        password: validatedConfig.DB_PASSWORD,
        ssl: validatedConfig.DB_SSL,
        connectionTimeout: validatedConfig.DB_CONNECTION_TIMEOUT,
        maxConnections: validatedConfig.DB_MAX_CONNECTIONS
      },

      jwt: {
        secret: validatedConfig.JWT_SECRET,
        refreshSecret: validatedConfig.JWT_REFRESH_SECRET,
        expiresIn: validatedConfig.JWT_EXPIRES_IN,
        refreshExpiresIn: validatedConfig.JWT_REFRESH_EXPIRES_IN
      },

      security: {
        encryptionKey: validatedConfig.ENCRYPTION_KEY,
        sessionSecret: validatedConfig.SESSION_SECRET,
        bcryptRounds: validatedConfig.BCRYPT_ROUNDS
      },

      cors: {
        origin: this.parseCorsOrigin(validatedConfig.CORS_ORIGIN),
        credentials: validatedConfig.CORS_CREDENTIALS
      },

      rateLimit: {
        windowMs: validatedConfig.RATE_LIMIT_WINDOW_MS,
        maxRequests: validatedConfig.RATE_LIMIT_MAX_REQUESTS,
        skipSuccessful: validatedConfig.RATE_LIMIT_SKIP_SUCCESSFUL
      },

      request: {
        sizeLimit: validatedConfig.REQUEST_SIZE_LIMIT,
        timeout: validatedConfig.REQUEST_TIMEOUT
      },

      upload: {
        maxSize: validatedConfig.UPLOAD_MAX_SIZE,
        allowedTypes: validatedConfig.UPLOAD_ALLOWED_TYPES.split(','),
        directory: validatedConfig.UPLOAD_DIR
      },

      logging: {
        level: validatedConfig.LOG_LEVEL,
        format: validatedConfig.LOG_FORMAT,
        fileEnabled: validatedConfig.LOG_FILE_ENABLED,
        filePath: validatedConfig.LOG_FILE_PATH
      },

      monitoring: {
        healthCheckInterval: validatedConfig.HEALTH_CHECK_INTERVAL,
        metricsEnabled: validatedConfig.METRICS_ENABLED,
        metricsPrefix: validatedConfig.METRICS_PREFIX
      },

      email: validatedConfig.EMAIL_ENABLED ? {
        enabled: validatedConfig.EMAIL_ENABLED,
        host: validatedConfig.EMAIL_HOST,
        port: validatedConfig.EMAIL_PORT,
        user: validatedConfig.EMAIL_USER,
        password: validatedConfig.EMAIL_PASSWORD
      } : undefined,

      redis: validatedConfig.REDIS_ENABLED ? {
        enabled: validatedConfig.REDIS_ENABLED,
        url: validatedConfig.REDIS_URL,
        password: validatedConfig.REDIS_PASSWORD
      } : undefined,

      external: {
        apiTimeout: validatedConfig.EXTERNAL_API_TIMEOUT,
        apiRetries: validatedConfig.EXTERNAL_API_RETRIES
      },

      features: {
        mfaEnabled: validatedConfig.FEATURE_MFA_ENABLED,
        auditLogging: validatedConfig.FEATURE_AUDIT_LOGGING,
        rateLimiting: validatedConfig.FEATURE_RATE_LIMITING,
        requestLogging: validatedConfig.FEATURE_REQUEST_LOGGING
      }
    };
  }

  private parseCorsOrigin(origin: string): string | string[] | boolean {
    if (origin === 'true') return true;
    if (origin === 'false') return false;
    if (origin === '*') return '*';
    
    // Try to parse as JSON array
    try {
      const parsed = JSON.parse(origin);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Not JSON, treat as single string
    }
    
    // Split by comma if contains comma
    if (origin.includes(',')) {
      return origin.split(',').map(o => o.trim());
    }
    
    return origin;
  }

  private validateRequiredSecrets(): void {
    const environment = this.config.nodeEnv;
    const requiredVars = requiredByEnvironment[environment as keyof typeof requiredByEnvironment] || [];
    
    const missing: string[] = [];
    
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    });

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables for ${environment}: ${missing.join(', ')}`);
    }

    // Validate secret strength
    this.validateSecretStrength();
  }

  private validateSecretStrength(): void {
    const secrets = [
      { name: 'JWT_SECRET', value: this.config.jwt.secret },
      { name: 'JWT_REFRESH_SECRET', value: this.config.jwt.refreshSecret },
      { name: 'ENCRYPTION_KEY', value: this.config.security.encryptionKey },
      { name: 'SESSION_SECRET', value: this.config.security.sessionSecret }
    ];

    const weakSecrets: string[] = [];

    secrets.forEach(secret => {
      if (this.isWeakSecret(secret.value)) {
        weakSecrets.push(secret.name);
      }
    });

    if (weakSecrets.length > 0 && this.config.nodeEnv === 'production') {
      throw new Error(`Weak secrets detected in production: ${weakSecrets.join(', ')}`);
    }
  }

  private isWeakSecret(secret: string): boolean {
    // Check for common weak patterns
    const weakPatterns = [
      /^(test|secret|password|key|default)/i,
      /^(.)\1{10,}$/, // Repeated characters
      /^(123|abc|qwe)/i
    ];

    return weakPatterns.some(pattern => pattern.test(secret)) || secret.length < 16;
  }

  // Public methods
  getConfig(): AppConfig {
    if (!this.isLoaded) {
      throw new Error('Configuration not loaded');
    }
    return this.config;
  }

  get(key: string): any {
    return this.getNestedValue(this.config, key);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Encryption utilities
  encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.encryptionKey).toString();
  }

  decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  // Configuration utilities
  isDevelopment(): boolean {
    return this.config.nodeEnv === 'development';
  }

  isProduction(): boolean {
    return this.config.nodeEnv === 'production';
  }

  isTest(): boolean {
    return this.config.nodeEnv === 'test';
  }

  // Health check
  validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      // Test database configuration
      if (!this.config.database.host) errors.push('Database host not configured');
      if (!this.config.database.name) errors.push('Database name not configured');

      // Test JWT configuration
      if (this.config.jwt.secret.length < 32) errors.push('JWT secret too short');
      if (this.config.jwt.refreshSecret.length < 32) errors.push('JWT refresh secret too short');

      // Test encryption configuration
      if (this.config.security.encryptionKey.length !== 64) errors.push('Encryption key must be 64 characters');

      return { valid: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Configuration validation error: ${error}`);
      return { valid: false, errors };
    }
  }
}

// Singleton instance
export const configManager = ConfigManager.getInstance();
export const config = configManager.getConfig();