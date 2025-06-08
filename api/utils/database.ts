import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { config } from '../config/config';

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password
});

// Database initialization function
export const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    // Create tables
    await createTables();
    
    // Run migrations if any
    await runMigrations();
    
    console.log('Database initialization complete');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
};

// Create database tables
const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        sku VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        category VARCHAR(50),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // Quality checks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS quality_checks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        inspector_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
        check_date TIMESTAMPTZ NOT NULL,
        status VARCHAR(20) NOT NULL,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    await client.query('COMMIT');
    console.log('Tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Run database migrations
const runMigrations = async () => {
  const migrationsDir = path.join(__dirname, '../migrations');
  
  // Check if migrations directory exists
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found');
    return;
  }
  
  // Get all migration files
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  if (files.length === 0) {
    console.log('No migration files found');
    return;
  }
  
  const client = await pool.connect();
  
  try {
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // Get applied migrations
    const { rows } = await client.query('SELECT name FROM migrations');
    const appliedMigrations = rows.map(row => row.name);
    
    // Apply new migrations
    for (const file of files) {
      if (!appliedMigrations.includes(file)) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        await client.query('BEGIN');
        
        try {
          await client.query(sql);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`Migration applied: ${file}`);
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
      }
    }
  } finally {
    client.release();
  }
};

export default pool;