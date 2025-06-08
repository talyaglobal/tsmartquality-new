import { DatabaseConfig } from '../database/connection';

export interface EnvironmentConfig {
  database: DatabaseConfig;
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
  };
  monitoring: {
    enableQueryLogging: boolean;
    slowQueryThreshold: number;
    enablePerformanceMetrics: boolean;
  };
  features: {
    enableAuditLogging: boolean;
    enableMigrations: boolean;
    enableSampleData: boolean;
  };
}

/**
 * Parse connection string into database config
 */
function parseConnectionString(connectionString: string): Partial<DatabaseConfig> {
  try {
    const url = new URL(connectionString);
    
    return {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1), // Remove leading slash
      username: url.username,
      password: url.password,
      ssl: url.searchParams.get('sslmode') !== 'disable'
    };
  } catch (error) {
    throw new Error(`Invalid database connection string: ${error}`);
  }
}

/**
 * Validate database configuration
 */
function validateDatabaseConfig(config: DatabaseConfig): void {
  const required = ['host', 'port', 'database', 'username', 'password'];
  const missing = required.filter(field => !config[field as keyof DatabaseConfig]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required database configuration: ${missing.join(', ')}`);
  }

  if (config.port < 1 || config.port > 65535) {
    throw new Error('Database port must be between 1 and 65535');
  }

  if (config.max && (config.max < 1 || config.max > 100)) {
    throw new Error('Database max connections must be between 1 and 100');
  }

  if (config.connectionTimeoutMillis && config.connectionTimeoutMillis < 1000) {
    throw new Error('Connection timeout must be at least 1000ms');
  }
}

/**
 * Get database configuration for the current environment
 */
export function getDatabaseConfig(): EnvironmentConfig {
  const env = process.env.NODE_ENV || 'development';
  
  let databaseConfig: DatabaseConfig;

  // Primary: Use DATABASE_URL if available
  if (process.env.DATABASE_URL) {
    databaseConfig = {
      ...parseConnectionString(process.env.DATABASE_URL),
      // Connection pool settings
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000'),
      maxUses: parseInt(process.env.DB_MAX_USES || '7500'),
      allowExitOnIdle: process.env.DB_ALLOW_EXIT_ON_IDLE === 'true'
    } as DatabaseConfig;
  }
  // Fallback: Use individual environment variables
  else {
    databaseConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'tsmartquality',
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      
      // SSL configuration
      ssl: env === 'production' ? {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
      } : false,
      
      // Connection pool settings
      max: parseInt(process.env.DB_POOL_MAX || (env === 'production' ? '20' : '10')),
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000'),
      maxUses: parseInt(process.env.DB_MAX_USES || '7500'),
      allowExitOnIdle: process.env.DB_ALLOW_EXIT_ON_IDLE === 'true'
    };
  }

  // Validate configuration
  validateDatabaseConfig(databaseConfig);

  // Environment-specific configurations
  const configs: Record<string, EnvironmentConfig> = {
    development: {
      database: {
        ...databaseConfig,
        // Development-specific overrides
        max: Math.min(databaseConfig.max || 10, 10), // Limit connections in dev
        connectionTimeoutMillis: 5000, // Shorter timeout for dev
      },
      monitoring: {
        enableQueryLogging: true,
        slowQueryThreshold: 500, // 500ms threshold
        enablePerformanceMetrics: true
      },
      features: {
        enableAuditLogging: true,
        enableMigrations: true,
        enableSampleData: true
      }
    },

    test: {
      database: {
        ...databaseConfig,
        database: `${databaseConfig.database}_test`,
        max: 5, // Fewer connections for testing
        idleTimeoutMillis: 1000,
        connectionTimeoutMillis: 3000
      },
      monitoring: {
        enableQueryLogging: false, // Reduce noise in tests
        slowQueryThreshold: 1000,
        enablePerformanceMetrics: false
      },
      features: {
        enableAuditLogging: false, // Disable for faster tests
        enableMigrations: true,
        enableSampleData: false
      }
    },

    staging: {
      database: databaseConfig,
      monitoring: {
        enableQueryLogging: true,
        slowQueryThreshold: 1000, // 1s threshold
        enablePerformanceMetrics: true
      },
      features: {
        enableAuditLogging: true,
        enableMigrations: true,
        enableSampleData: false
      }
    },

    production: {
      database: {
        ...databaseConfig,
        // Production-specific optimizations
        max: Math.max(databaseConfig.max || 20, 20), // Ensure sufficient connections
        idleTimeoutMillis: 60000, // Longer idle timeout
        connectionTimeoutMillis: 15000, // Longer connection timeout
      },
      monitoring: {
        enableQueryLogging: process.env.ENABLE_QUERY_LOGGING === 'true',
        slowQueryThreshold: parseInt(process.env.SLOW_QUERY_THRESHOLD || '2000'),
        enablePerformanceMetrics: true
      },
      features: {
        enableAuditLogging: true,
        enableMigrations: process.env.ENABLE_AUTO_MIGRATIONS === 'true',
        enableSampleData: false
      }
    }
  };

  const config = configs[env];
  if (!config) {
    throw new Error(`Unknown environment: ${env}`);
  }

  // Add Redis configuration if available
  if (process.env.REDIS_URL) {
    try {
      const redisUrl = new URL(process.env.REDIS_URL);
      config.redis = {
        host: redisUrl.hostname,
        port: parseInt(redisUrl.port) || 6379,
        password: redisUrl.password || undefined,
        db: parseInt(redisUrl.pathname.slice(1)) || 0
      };
    } catch (error) {
      console.warn('Invalid Redis URL provided:', error);
    }
  }

  return config;
}

/**
 * Get connection string for external tools (migrations, etc.)
 */
export function getConnectionString(): string {
  const config = getDatabaseConfig().database;
  
  const protocol = 'postgresql';
  const auth = `${config.username}:${config.password}`;
  const host = `${config.host}:${config.port}`;
  const database = config.database;
  
  let connectionString = `${protocol}://${auth}@${host}/${database}`;
  
  // Add SSL parameter if enabled
  if (config.ssl) {
    connectionString += '?sslmode=require';
  }
  
  return connectionString;
}

/**
 * Create database URL for different environments
 */
export function createDatabaseUrl(
  host: string,
  port: number,
  database: string,
  username: string,
  password: string,
  ssl = false
): string {
  let url = `postgresql://${username}:${password}@${host}:${port}/${database}`;
  
  if (ssl) {
    url += '?sslmode=require';
  }
  
  return url;
}

/**
 * Validate environment variables for database configuration
 */
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for required environment variables
  if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
    errors.push('Either DATABASE_URL or DB_HOST must be provided');
  }
  
  if (!process.env.DATABASE_URL) {
    const required = ['DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const missing = required.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      errors.push(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
  
  // Check numeric values
  const numericVars = [
    'DB_PORT', 'DB_POOL_MAX', 'DB_POOL_MIN', 
    'DB_IDLE_TIMEOUT', 'DB_CONNECT_TIMEOUT'
  ];
  
  for (const varName of numericVars) {
    const value = process.env[varName];
    if (value && isNaN(parseInt(value))) {
      errors.push(`${varName} must be a valid number`);
    }
  }
  
  // Environment-specific validations
  const env = process.env.NODE_ENV;
  
  if (env === 'production') {
    if (!process.env.DATABASE_URL && !process.env.DB_SSL_REJECT_UNAUTHORIZED) {
      console.warn('Consider enabling SSL for production database connections');
    }
    
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters in production');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Print configuration summary (without sensitive data)
 */
export function printConfigSummary(): void {
  const config = getDatabaseConfig();
  const env = process.env.NODE_ENV || 'development';
  
  console.log('\n📊 Database Configuration Summary');
  console.log('================================');
  console.log(`Environment: ${env}`);
  console.log(`Host: ${config.database.host}`);
  console.log(`Port: ${config.database.port}`);
  console.log(`Database: ${config.database.database}`);
  console.log(`Username: ${config.database.username}`);
  console.log(`SSL: ${config.database.ssl ? 'enabled' : 'disabled'}`);
  console.log(`Pool Max: ${config.database.max}`);
  console.log(`Pool Min: ${config.database.min}`);
  console.log(`Query Logging: ${config.monitoring.enableQueryLogging ? 'enabled' : 'disabled'}`);
  console.log(`Slow Query Threshold: ${config.monitoring.slowQueryThreshold}ms`);
  console.log(`Auto Migrations: ${config.features.enableMigrations ? 'enabled' : 'disabled'}`);
  
  if (config.redis) {
    console.log(`Redis: ${config.redis.host}:${config.redis.port}`);
  }
  
  console.log('================================\n');
}