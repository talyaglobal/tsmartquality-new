/**
 * Database migration script for TSmart Quality backend
 * 
 * Usage:
 * 1. Make sure your .env file is configured with Supabase credentials
 * 2. Run with: node scripts/run-migration.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('Starting database migration...');
    
    // Read the SQL migration file
    const migrationSql = fs.readFileSync(
      path.join(__dirname, 'add-missing-columns.sql'),
      'utf8'
    );

    // Execute the SQL against Supabase
    const { error } = await supabase.rpc('pgclient', {
      query: migrationSql
    });

    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration();