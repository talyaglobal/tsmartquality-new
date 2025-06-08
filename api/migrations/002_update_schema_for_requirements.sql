-- Update users table to match requirements
DO $$ 
BEGIN
    -- Add surname column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'surname') THEN
        ALTER TABLE users ADD COLUMN surname VARCHAR(100);
    END IF;
    
    -- Add companyId column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'companyId') THEN
        ALTER TABLE users ADD COLUMN companyId INTEGER;
    END IF;
    
    -- Add failed_login_attempts column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'failed_login_attempts') THEN
        ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
    END IF;
    
    -- Add locked_until column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'locked_until') THEN
        ALTER TABLE users ADD COLUMN locked_until TIMESTAMP;
    END IF;
END $$;

-- Update products table structure
DO $$
BEGIN
    -- Add code column if not exists (replacing sku)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'products' AND column_name = 'code') THEN
        ALTER TABLE products ADD COLUMN code VARCHAR(50);
    END IF;
    
    -- Add sellerId column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'products' AND column_name = 'sellerId') THEN
        ALTER TABLE products ADD COLUMN sellerId INTEGER;
    END IF;
    
    -- Add brandId column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'products' AND column_name = 'brandId') THEN
        ALTER TABLE products ADD COLUMN brandId INTEGER;
    END IF;
    
    -- Add companyId column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'products' AND column_name = 'companyId') THEN
        ALTER TABLE products ADD COLUMN companyId INTEGER;
    END IF;
    
    -- Add weight column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'products' AND column_name = 'weight') THEN
        ALTER TABLE products ADD COLUMN weight DECIMAL(10,2);
    END IF;
    
    -- Add volume column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'products' AND column_name = 'volume') THEN
        ALTER TABLE products ADD COLUMN volume DECIMAL(10,2);
    END IF;
    
    -- Add criticalStockAmount column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'products' AND column_name = 'criticalStockAmount') THEN
        ALTER TABLE products ADD COLUMN criticalStockAmount INTEGER;
    END IF;
    
    -- Add created_by column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'products' AND column_name = 'created_by') THEN
        ALTER TABLE products ADD COLUMN created_by VARCHAR(36);
    END IF;
    
    -- Add updated_at column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'products' AND column_name = 'updated_at') THEN
        ALTER TABLE products ADD COLUMN updated_at TIMESTAMP;
    END IF;
    
    -- Add updated_by column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'products' AND column_name = 'updated_by') THEN
        ALTER TABLE products ADD COLUMN updated_by VARCHAR(36);
    END IF;
    
    -- Add is_deleted column if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'products' AND column_name = 'is_deleted') THEN
        ALTER TABLE products ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create product_history table for audit trail
CREATE TABLE IF NOT EXISTS product_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    productId VARCHAR(36) NOT NULL,
    fieldChanged VARCHAR(100) NOT NULL,
    oldValue TEXT,
    newValue TEXT,
    changedByUserId VARCHAR(36) NOT NULL,
    changeDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create companies table if not exists (for reference)
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sellers table if not exists (for reference)
CREATE TABLE IF NOT EXISTS sellers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    companyId INTEGER REFERENCES companies(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create brands table if not exists (for reference)
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    companyId INTEGER REFERENCES companies(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default company if none exists
INSERT INTO companies (id, name)
SELECT 1001, 'TalYa Smart'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE id = 1001);

-- Insert default seller if none exists
INSERT INTO sellers (id, name, companyId)
SELECT 1, 'Default Seller', 1001
WHERE NOT EXISTS (SELECT 1 FROM sellers WHERE id = 1);

-- Insert default brand if none exists
INSERT INTO brands (id, name, companyId)
SELECT 2, 'Default Brand', 1001
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE id = 2);

-- Update existing users to have default company
UPDATE users SET companyId = 1001 WHERE companyId IS NULL;
UPDATE users SET surname = 'User' WHERE surname IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_company ON users(companyId);
CREATE INDEX IF NOT EXISTS idx_users_email_company ON users(email, companyId);
CREATE INDEX IF NOT EXISTS idx_products_company ON products(companyId);
CREATE INDEX IF NOT EXISTS idx_products_code_company ON products(code, companyId);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(sellerId);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brandId);
CREATE INDEX IF NOT EXISTS idx_products_not_deleted ON products(is_deleted) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_product_history_product ON product_history(productId);
CREATE INDEX IF NOT EXISTS idx_product_history_date ON product_history(changeDate);

-- Add unique constraints
DO $$
BEGIN
    -- Unique code per company for products
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_product_code_per_company') THEN
        ALTER TABLE products ADD CONSTRAINT unique_product_code_per_company UNIQUE (code, companyId);
    END IF;
EXCEPTION WHEN others THEN
    -- Constraint might already exist or conflict, ignore
    NULL;
END $$;