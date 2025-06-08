const { Pool } = require('pg');

// Database configuration for Vercel deployment
const config = {
  // Use Vercel Postgres or other cloud database
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  
  // Connection pool settings for serverless
  max: 1, // Serverless functions should use minimal connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
let pool;

const getPool = () => {
  if (!pool) {
    pool = new Pool(config);
    
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  return pool;
};

// Helper function to execute queries
const query = async (text, params) => {
  const client = getPool();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Initialize database tables (for serverless deployment)
const initializeTables = async () => {
  try {
    const client = getPool();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        surname VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        companyId INTEGER DEFAULT 1001,
        role VARCHAR(20) DEFAULT 'user',
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) NOT NULL,
        name VARCHAR(200) NOT NULL,
        sellerId INTEGER,
        brandId INTEGER,
        companyId INTEGER NOT NULL,
        description TEXT,
        weight DECIMAL(10,2),
        volume DECIMAL(10,2),
        criticalStockAmount INTEGER NOT NULL,
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by VARCHAR(36),
        updated_at TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE,
        UNIQUE(code, companyId)
      )
    `);
    
    // Create product_history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_history (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        productId VARCHAR(36) NOT NULL,
        fieldChanged VARCHAR(100) NOT NULL,
        oldValue TEXT,
        newValue TEXT,
        changedByUserId VARCHAR(36) NOT NULL,
        changeDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create companies table
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default company
    await client.query(`
      INSERT INTO companies (id, name) 
      VALUES (1001, 'TalYa Smart') 
      ON CONFLICT (id) DO NOTHING
    `);
    
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
    // Don't throw error to prevent deployment failure
  }
};

module.exports = {
  query,
  getPool,
  initializeTables
};