-- Add roles to users table if not already added
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
    END IF;
END $$;

-- Create admin user if no users exist
INSERT INTO users (name, email, password, role)
SELECT 'Admin', 'admin@tsmartquality.com', '$2b$10$JKbeSJPdYBV6t9j3qJMSyOKvVvv44xGfNNOfNoAZcEZwO.FyQvCaC', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_quality_checks_product_id ON quality_checks(product_id);
CREATE INDEX IF NOT EXISTS idx_quality_checks_inspector_id ON quality_checks(inspector_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);