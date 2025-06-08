import { Pool, PoolClient, PoolConfig } from 'pg';
import { DatabaseMigrator } from './migrator';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean | object;
  connectionTimeoutMillis?: number;
  idleTimeoutMillis?: number;
  max?: number;
  min?: number;
  maxUses?: number;
  allowExitOnIdle?: boolean;
}

export interface ConnectionHealth {
  isHealthy: boolean;
  latencyMs?: number;
  error?: string;
  poolStats?: {
    totalCount: number;
    idleCount: number;
    waitingCount: number;
  };
}

export interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

export class DatabaseConnection {
  private pool: Pool | null = null;
  private config: DatabaseConfig;
  private isInitialized = false;
  private connectionRetries = 0;
  private maxRetries = 5;
  private retryDelay = 1000; // ms
  private queryMetrics: QueryMetrics[] = [];
  private maxMetricsHistory = 1000;
  private logger: any;

  constructor(config: DatabaseConfig, logger?: any) {
    this.config = config;
    this.logger = logger || console;
  }

  /**
   * Initialize database connection with retry logic
   */
  async initialize(): Promise<void> {
    if (this.isInitialized && this.pool) {
      return;
    }

    const poolConfig: PoolConfig = {
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.username,
      password: this.config.password,
      
      // Connection pool settings
      max: this.config.max || 20,
      min: this.config.min || 2,
      idleTimeoutMillis: this.config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: this.config.connectionTimeoutMillis || 10000,
      maxUses: this.config.maxUses || 7500,
      allowExitOnIdle: this.config.allowExitOnIdle || false,

      // SSL configuration
      ssl: this.config.ssl || (process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false),

      // Application name for connection tracking
      application_name: 'tsmartquality_api',
    };

    try {
      this.pool = new Pool(poolConfig);
      
      // Set up event handlers
      this.setupEventHandlers();
      
      // Test connection
      await this.testConnection();
      
      this.isInitialized = true;
      this.connectionRetries = 0;
      
      this.logger.info('Database connection initialized successfully', {
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        poolMax: poolConfig.max,
        poolMin: poolConfig.min
      });

    } catch (error: any) {
      this.logger.error('Failed to initialize database connection', {
        error: error.message,
        host: this.config.host,
        port: this.config.port,
        retryAttempt: this.connectionRetries
      });
      
      if (this.connectionRetries < this.maxRetries) {
        this.connectionRetries++;
        this.logger.info(`Retrying database connection in ${this.retryDelay}ms (attempt ${this.connectionRetries}/${this.maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        this.retryDelay *= 2; // Exponential backoff
        
        return this.initialize();
      }
      
      throw new Error(`Failed to connect to database after ${this.maxRetries} attempts: ${error.message}`);
    }
  }

  /**
   * Set up pool event handlers for monitoring
   */
  private setupEventHandlers(): void {
    if (!this.pool) return;

    this.pool.on('connect', (client: PoolClient) => {
      this.logger.debug('New database client connected', {
        totalCount: this.pool?.totalCount,
        idleCount: this.pool?.idleCount
      });
    });

    this.pool.on('acquire', (client: PoolClient) => {
      this.logger.debug('Database client acquired from pool');
    });

    this.pool.on('remove', (client: PoolClient) => {
      this.logger.debug('Database client removed from pool');
    });

    this.pool.on('error', (error: Error, client: PoolClient) => {
      this.logger.error('Database pool error', {
        error: error.message,
        stack: error.stack
      });
    });

    // Monitor pool health
    setInterval(() => {
      this.logPoolStats();
    }, 60000); // Every minute
  }

  /**
   * Test database connection
   */
  private async testConnection(): Promise<void> {
    if (!this.pool) {
      throw new Error('Pool not initialized');
    }

    const client = await this.pool.connect();
    try {
      const startTime = Date.now();
      await client.query('SELECT 1 as test');
      const latency = Date.now() - startTime;
      
      this.logger.debug('Database connection test successful', { latencyMs: latency });
    } finally {
      client.release();
    }
  }

  /**
   * Execute query with metrics tracking
   */
  async query(text: string, params?: any[]): Promise<any> {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    const startTime = Date.now();
    const timestamp = new Date();
    
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - startTime;
      
      // Record metrics
      this.recordQueryMetric({
        query: this.sanitizeQuery(text),
        duration,
        timestamp,
        success: true
      });

      // Log slow queries
      if (duration > 1000) {
        this.logger.warn('Slow query detected', {
          query: this.sanitizeQuery(text),
          duration,
          params: params ? '[REDACTED]' : undefined
        });
      }

      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      // Record failed query
      this.recordQueryMetric({
        query: this.sanitizeQuery(text),
        duration,
        timestamp,
        success: false,
        error: error.message
      });

      this.logger.error('Database query failed', {
        query: this.sanitizeQuery(text),
        error: error.message,
        duration
      });

      throw error;
    }
  }

  /**
   * Get a client from the pool for transactions
   */
  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    return this.pool.connect();
  }

  /**
   * Execute transaction
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check database health
   */
  async checkHealth(): Promise<ConnectionHealth> {
    try {
      if (!this.pool) {
        return {
          isHealthy: false,
          error: 'Database not initialized'
        };
      }

      const startTime = Date.now();
      const client = await this.pool.connect();
      
      try {
        await client.query('SELECT 1');
        const latencyMs = Date.now() - startTime;
        
        return {
          isHealthy: true,
          latencyMs,
          poolStats: {
            totalCount: this.pool.totalCount,
            idleCount: this.pool.idleCount,
            waitingCount: this.pool.waitingCount
          }
        };
      } finally {
        client.release();
      }
    } catch (error: any) {
      return {
        isHealthy: false,
        error: error.message
      };
    }
  }

  /**
   * Run database migrations
   */
  async migrate(): Promise<any> {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    const migrator = new DatabaseMigrator(this.pool);
    return await migrator.migrate();
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<any> {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    const migrator = new DatabaseMigrator(this.pool);
    return migrator.getStatus();
  }

  /**
   * Get query metrics
   */
  getQueryMetrics(): QueryMetrics[] {
    return [...this.queryMetrics];
  }

  /**
   * Get query performance statistics
   */
  getQueryStats(): {
    totalQueries: number;
    successfulQueries: number;
    failedQueries: number;
    averageDuration: number;
    slowQueries: number;
  } {
    const total = this.queryMetrics.length;
    const successful = this.queryMetrics.filter(m => m.success).length;
    const failed = total - successful;
    const avgDuration = total > 0 
      ? this.queryMetrics.reduce((sum, m) => sum + m.duration, 0) / total 
      : 0;
    const slowQueries = this.queryMetrics.filter(m => m.duration > 1000).length;

    return {
      totalQueries: total,
      successfulQueries: successful,
      failedQueries: failed,
      averageDuration: Math.round(avgDuration),
      slowQueries
    };
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isInitialized = false;
      this.logger.info('Database connection closed');
    }
  }

  /**
   * Record query metrics
   */
  private recordQueryMetric(metric: QueryMetrics): void {
    this.queryMetrics.push(metric);
    
    // Keep only recent metrics to prevent memory leaks
    if (this.queryMetrics.length > this.maxMetricsHistory) {
      this.queryMetrics = this.queryMetrics.slice(-this.maxMetricsHistory);
    }
  }

  /**
   * Sanitize query for logging (remove sensitive data)
   */
  private sanitizeQuery(query: string): string {
    // Remove potential sensitive values
    return query
      .replace(/\$\d+/g, '?') // Replace parameterized values
      .replace(/VALUES\s*\([^)]+\)/gi, 'VALUES (?)') // Replace VALUES clauses
      .substring(0, 200); // Limit length
  }

  /**
   * Log pool statistics
   */
  private logPoolStats(): void {
    if (this.pool) {
      this.logger.debug('Database pool statistics', {
        totalCount: this.pool.totalCount,
        idleCount: this.pool.idleCount,
        waitingCount: this.pool.waitingCount
      });
    }
  }

  /**
   * Get pool instance (for advanced usage)
   */
  getPool(): Pool | null {
    return this.pool;
  }
}