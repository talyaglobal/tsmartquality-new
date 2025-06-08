import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { Logger } from '../startup';

interface DatabaseOptions {
  useSupabase?: boolean;
  fallbackToLocal?: boolean;
}

export class DatabaseManager {
  private pool: Pool | null = null;
  private supabase: any = null;
  private isSupabaseConnected = false;

  async connect(options: DatabaseOptions = { useSupabase: true, fallbackToLocal: true }): Promise<Pool> {
    // Try Supabase first if enabled
    if (options.useSupabase && this.hasSupabaseConfig()) {
      try {
        const supabaseConnection = await this.connectToSupabase();
        if (supabaseConnection) {
          Logger.info('Connected to Supabase successfully');
          return supabaseConnection;
        }
      } catch (error: any) {
        Logger.warn('Supabase connection failed, will try fallback', { error: error.message });
      }
    }

    // Fallback to local PostgreSQL
    if (options.fallbackToLocal) {
      try {
        const localConnection = await this.connectToLocal();
        Logger.info('Connected to local PostgreSQL successfully');
        return localConnection;
      } catch (error: any) {
        Logger.error('Local PostgreSQL connection failed', { error: error.message });
        throw new Error('All database connection attempts failed');
      }
    }

    throw new Error('No database connection method available');
  }

  private hasSupabaseConfig(): boolean {
    return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  }

  private async connectToSupabase(): Promise<Pool> {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    // Initialize Supabase client
    this.supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Test the connection
    const { data, error } = await this.supabase.from('_health_check').select('*').limit(1);
    if (error && !error.message.includes('relation "_health_check" does not exist')) {
      throw error;
    }

    // Create PostgreSQL pool for direct SQL operations
    let connectionString = process.env.SUPABASE_DB_URL;
    
    if (!connectionString) {
      // Construct connection string from Supabase URL
      const projectRef = supabaseUrl.split('//')[1].split('.')[0];
      const password = process.env.SUPABASE_DB_PASSWORD || 'your_password_here';
      connectionString = `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
    }

    this.pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Test the pool connection
    const client = await this.pool.connect();
    await client.query('SELECT 1');
    client.release();

    this.isSupabaseConnected = true;
    return this.pool;
  }

  private async connectToLocal(): Promise<Pool> {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'tsmartqualitydev',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Test the connection
    const client = await this.pool.connect();
    await client.query('SELECT 1');
    client.release();

    return this.pool;
  }

  getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.pool;
  }

  getSupabase() {
    return this.supabase;
  }

  isUsingSupabase(): boolean {
    return this.isSupabaseConnected;
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    this.supabase = null;
    this.isSupabaseConnected = false;
  }
}

// Global instance
export const databaseManager = new DatabaseManager();