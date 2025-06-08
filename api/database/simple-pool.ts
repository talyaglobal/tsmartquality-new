import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';

// Simple pool instance that tries Supabase first, then local PostgreSQL
let pool: Pool | null = null;

async function createPool(): Promise<Pool> {
  if (pool) {
    return pool;
  }

  // Try Supabase first
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      console.log('Attempting Supabase connection...');
      
      // Test Supabase client
      const supabase = createClient(
        process.env.SUPABASE_URL, 
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: { autoRefreshToken: false, persistSession: false }
        }
      );

      // Create connection string for PostgreSQL pool
      let connectionString = process.env.SUPABASE_DB_URL;
      
      if (!connectionString) {
        const projectRef = process.env.SUPABASE_URL.split('//')[1].split('.')[0];
        const password = process.env.SUPABASE_DB_PASSWORD || 'your_password_here';
        connectionString = `postgresql://postgres.${projectRef}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
      }

      pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      // Test connection
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();

      console.log('✅ Connected to Supabase successfully');
      return pool;
    } catch (error: any) {
      console.warn('⚠️ Supabase connection failed:', error.message);
      if (pool) {
        await pool.end();
        pool = null;
      }
    }
  }

  // Fallback to local PostgreSQL
  try {
    console.log('Attempting local PostgreSQL connection...');
    
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'tsmartqualitydev',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();

    console.log('✅ Connected to local PostgreSQL successfully');
    return pool;
  } catch (error: any) {
    console.error('❌ Local PostgreSQL connection failed:', error.message);
    if (pool) {
      await pool.end();
      pool = null;
    }
    throw new Error('All database connection attempts failed');
  }
}

// Initialize pool immediately
const poolPromise = createPool().catch(error => {
  console.error('Database initialization failed:', error.message);
  return null;
});

export default poolPromise;