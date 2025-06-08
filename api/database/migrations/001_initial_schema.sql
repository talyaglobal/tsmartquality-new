-- Migration: 001_initial_schema
-- Description: Create initial database schema with all tables
-- Created: 2025-06-08
-- Dependencies: None

-- Create migration tracking table first
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INTEGER,
    checksum VARCHAR(64),
    success BOOLEAN DEFAULT true
);

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Execute the main schema
-- (Content from schema.sql will be included here during migration)

-- Record this migration
INSERT INTO schema_migrations (version, name, description, checksum) 
VALUES ('001', 'initial_schema', 'Create initial database schema with all tables', 
        encode(digest('001_initial_schema', 'sha256'), 'hex'))
ON CONFLICT (version) DO NOTHING;