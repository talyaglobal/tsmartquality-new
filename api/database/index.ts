import { DatabaseConnection } from './connection';
import { DatabaseInitializer } from './initializer';
import { getDatabaseConfig, validateEnvironment, printConfigSummary } from '../config/database.config';
import { Logger } from '../startup';

// Global database instance
let dbInstance: DatabaseConnection | null = null;
let initializerInstance: DatabaseInitializer | null = null;

/**
 * Initialize database connection and run setup
 */
export async function initializeDatabase(): Promise<DatabaseConnection> {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    // Validate environment configuration
    const validation = validateEnvironment();
    if (!validation.valid) {
      throw new Error(`Database configuration errors: ${validation.errors.join(', ')}`);
    }

    // Get configuration for current environment
    const config = getDatabaseConfig();
    
    // Print configuration summary in development
    if (process.env.NODE_ENV === 'development') {
      printConfigSummary();
    }

    // Create database connection
    dbInstance = new DatabaseConnection(config.database, Logger);
    initializerInstance = new DatabaseInitializer(dbInstance, Logger);

    // Initialize connection
    await dbInstance.initialize();

    // Run migrations if enabled
    if (config.features.enableMigrations) {
      Logger.info('Running database migrations...');
      await dbInstance.migrate();
    }

    // Check if database needs initialization
    const isInitialized = await initializerInstance.isInitialized();
    
    if (!isInitialized) {
      Logger.info('Database not initialized, running initialization...');
      
      const initResult = await initializerInstance.initialize({
        runMigrations: false, // Already run above
        createSampleData: config.features.enableSampleData
      });

      if (!initResult.success) {
        throw new Error(`Database initialization failed: ${initResult.errors.join(', ')}`);
      }
    }

    Logger.info('Database initialization completed successfully');
    return dbInstance;

  } catch (error: any) {
    Logger.error('Database initialization failed', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Get database instance (must call initializeDatabase first)
 */
export function getDatabase(): DatabaseConnection {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return dbInstance;
}

/**
 * Get database initializer instance
 */
export function getDatabaseInitializer(): DatabaseInitializer {
  if (!initializerInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return initializerInstance;
}

/**
 * Health check for database
 */
export async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
  poolStats?: any;
  migrationStatus?: any;
}> {
  try {
    if (!dbInstance) {
      return {
        status: 'unhealthy',
        error: 'Database not initialized'
      };
    }

    const health = await dbInstance.checkHealth();
    const migrationStatus = await dbInstance.getMigrationStatus();

    return {
      status: health.isHealthy ? 'healthy' : 'unhealthy',
      latency: health.latencyMs,
      error: health.error,
      poolStats: health.poolStats,
      migrationStatus: {
        available: migrationStatus.available.length,
        executed: migrationStatus.executed.length,
        pending: migrationStatus.pending.length
      }
    };

  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

/**
 * Get database performance metrics
 */
export async function getDatabaseMetrics(): Promise<{
  queryStats: any;
  connectionStats: any;
  recentQueries: any[];
}> {
  if (!dbInstance) {
    throw new Error('Database not initialized');
  }

  const health = await dbInstance.checkHealth();
  const queryStats = dbInstance.getQueryStats();
  const recentQueries = dbInstance.getQueryMetrics().slice(-10); // Last 10 queries

  return {
    queryStats,
    connectionStats: health.poolStats,
    recentQueries
  };
}

/**
 * Execute raw query (for advanced usage)
 */
export async function executeQuery(query: string, params?: any[]): Promise<any> {
  const db = getDatabase();
  return db.query(query, params);
}

/**
 * Execute transaction
 */
export async function executeTransaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const db = getDatabase();
  return db.transaction(callback);
}

/**
 * Close database connections
 */
export async function closeDatabaseConnections(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
    initializerInstance = null;
    Logger.info('Database connections closed');
  }
}

/**
 * Reset database (dangerous - only for development/testing)
 */
export async function resetDatabase(confirmationCode: string): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Database reset is not allowed in production');
  }

  if (!initializerInstance) {
    throw new Error('Database not initialized');
  }

  await initializerInstance.reset(confirmationCode);
  
  // Reinitialize after reset
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
    initializerInstance = null;
  }
  
  await initializeDatabase();
}

// Re-export main classes for direct usage
export { DatabaseConnection } from './connection';
export { DatabaseInitializer } from './initializer';
export { DatabaseMigrator } from './migrator';
export { getDatabaseConfig } from '../config/database.config';

// Re-export types
export type { DatabaseConfig } from './connection';
export type { InitializationOptions, InitializationResult } from './initializer';
export type { Migration, MigrationResult } from './migrator';