import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;
let supabasePool: Pool | null = null;

export function initializeSupabase() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('Supabase credentials not found, falling back to local PostgreSQL');
    return null;
  }

  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create a PostgreSQL pool using Supabase connection string
    const connectionString = process.env.SUPABASE_DB_URL || 
      `postgresql://postgres.${supabaseUrl.split('//')[1].split('.')[0]}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;
    
    supabasePool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    console.log('Supabase client and PostgreSQL pool initialized successfully');
    return { supabase, pool: supabasePool };
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    return null;
  }
}

export function getSupabase() {
  return supabase;
}

export function getSupabasePool() {
  return supabasePool;
}

export default { initializeSupabase, getSupabase, getSupabasePool };