-- Migration script to add any missing columns or tables needed for the TSmart Quality Backend
-- This script is idempotent - it checks if columns/tables exist before adding them

-- Check if we need to add is_admin or is_company_admin to the users table
DO $$
BEGIN
    -- Check if is_admin column exists in users table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_admin'
    ) THEN
        -- Add is_admin column with default to false
        ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_admin column to users table';
    END IF;

    -- Check if is_company_admin column exists in users table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_company_admin'
    ) THEN
        -- Add is_company_admin column with default to false
        ALTER TABLE users ADD COLUMN is_company_admin BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_company_admin column to users table';
    END IF;

    -- Check if user_id index exists on user_in_groups
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'user_in_groups' AND indexname = 'idx_user_in_groups_user_id'
    ) THEN
        -- Add index for better performance
        CREATE INDEX idx_user_in_groups_user_id ON user_in_groups(user_id);
        RAISE NOTICE 'Added index on user_id to user_in_groups table';
    END IF;

    -- Check if group_id index exists on group_in_roles
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'group_in_roles' AND indexname = 'idx_group_in_roles_group_id'
    ) THEN
        -- Add index for better performance
        CREATE INDEX idx_group_in_roles_group_id ON group_in_roles(group_id);
        RAISE NOTICE 'Added index on group_id to group_in_roles table';
    END IF;

    -- Check if role_id index exists on group_in_roles
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'group_in_roles' AND indexname = 'idx_group_in_roles_role_id'
    ) THEN
        -- Add index for better performance
        CREATE INDEX idx_group_in_roles_role_id ON group_in_roles(role_id);
        RAISE NOTICE 'Added index on role_id to group_in_roles table';
    END IF;

    -- Check if product_id index exists on product_history
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'product_history' AND indexname = 'idx_product_history_product_id'
    ) THEN
        -- Add index for better performance
        CREATE INDEX idx_product_history_product_id ON product_history(product_id);
        RAISE NOTICE 'Added index on product_id to product_history table';
    END IF;

    -- Check if created_at index exists on product_history for time-based queries
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'product_history' AND indexname = 'idx_product_history_created_at'
    ) THEN
        -- Add index for better performance on time-based queries
        CREATE INDEX idx_product_history_created_at ON product_history(created_at);
        RAISE NOTICE 'Added index on created_at to product_history table';
    END IF;

    -- Check if combined index exists on product_to_customers
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'product_to_customers' AND indexname = 'idx_product_to_customers_product_customer'
    ) THEN
        -- Add index for better performance for queries involving both product and customer
        CREATE INDEX idx_product_to_customers_product_customer ON product_to_customers(product_id, customer_id);
        RAISE NOTICE 'Added combined index on product_id, customer_id to product_to_customers table';
    END IF;
END $$;

-- Add any other necessary migrations below

-- Set system admin flag for initial admin user
UPDATE users 
SET is_admin = TRUE 
WHERE email = 'info@tsmart.ai' 
AND is_admin IS NULL;

-- Create default roles if they don't exist
INSERT INTO roles (name, description, status) 
VALUES 
    ('admin', 'System administrator with full access', TRUE),
    ('company_admin', 'Company administrator with full access to company resources', TRUE),
    ('manager', 'Manager with access to create and modify resources', TRUE),
    ('user', 'Regular user with read access', TRUE)
ON CONFLICT (name) DO NOTHING;

RAISE NOTICE 'Migration completed successfully.';