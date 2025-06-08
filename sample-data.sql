-- TSmart Quality Management System Database Schema
-- This file sets up the complete database schema for the application

-- Drop existing tables if they exist
DROP TABLE IF EXISTS parameter_readings CASCADE;
DROP TABLE IF EXISTS quality_checks CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS quality_parameters CASCADE;
DROP TABLE IF EXISTS quality_types CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS product_types CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'admin', 'inspector', 'user'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Product Types table
CREATE TABLE product_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Brands table
CREATE TABLE brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  logo_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Quality Types table
CREATE TABLE quality_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  grade VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  stock_code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  product_type_id INTEGER REFERENCES product_types(id),
  brand_id INTEGER REFERENCES brands(id),
  quality_type_id INTEGER REFERENCES quality_types(id),
  description TEXT,
  weight DECIMAL(10, 2),
  volume DECIMAL(10, 2),
  critical_stock_amount INTEGER,
  shelflife_limit INTEGER, -- in days
  stock_tracking BOOLEAN DEFAULT TRUE,
  bbd_tracking BOOLEAN DEFAULT TRUE,
  lot_tracking BOOLEAN DEFAULT TRUE,
  image_path VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Inventory table
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  lot_number VARCHAR(50),
  production_date TIMESTAMP WITH TIME ZONE,
  best_before_date TIMESTAMP WITH TIME ZONE,
  quantity DECIMAL(10, 2) NOT NULL,
  location VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_product_lot UNIQUE (product_id, lot_number)
);

-- Create Quality Parameters table
CREATE TABLE quality_parameters (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  unit VARCHAR(20) NOT NULL,
  min_value DECIMAL(10, 2),
  max_value DECIMAL(10, 2),
  target_value DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Quality Checks table
CREATE TABLE quality_checks (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  inspector_id INTEGER REFERENCES users(id),
  check_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL, -- 'pending', 'passed', 'failed'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Parameter Readings table
CREATE TABLE parameter_readings (
  id SERIAL PRIMARY KEY,
  quality_check_id INTEGER REFERENCES quality_checks(id),
  parameter_id INTEGER REFERENCES quality_parameters(id),
  value DECIMAL(10, 2) NOT NULL,
  is_within_spec BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_check_parameter UNIQUE (quality_check_id, parameter_id)
);

-- Create indexes for better performance
CREATE INDEX idx_products_stock_code ON products(stock_code);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_lot_number ON inventory(lot_number);
CREATE INDEX idx_inventory_best_before_date ON inventory(best_before_date);
CREATE INDEX idx_quality_checks_product_id ON quality_checks(product_id);
CREATE INDEX idx_quality_checks_inspector_id ON quality_checks(inspector_id);
CREATE INDEX idx_quality_checks_status ON quality_checks(status);
CREATE INDEX idx_parameter_readings_quality_check_id ON parameter_readings(quality_check_id);
CREATE INDEX idx_parameter_readings_parameter_id ON parameter_readings(parameter_id);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_product_types_timestamp BEFORE UPDATE ON product_types FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_brands_timestamp BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_quality_types_timestamp BEFORE UPDATE ON quality_types FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_products_timestamp BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_inventory_timestamp BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_quality_parameters_timestamp BEFORE UPDATE ON quality_parameters FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_quality_checks_timestamp BEFORE UPDATE ON quality_checks FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER update_parameter_readings_timestamp BEFORE UPDATE ON parameter_readings FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Create views for common queries
CREATE OR REPLACE VIEW vw_product_details AS
SELECT 
  p.id, 
  p.stock_code, 
  p.name, 
  pt.name AS product_type, 
  pt.code AS product_type_code,
  b.name AS brand,
  qt.name AS quality_type,
  qt.grade AS quality_grade,
  p.description,
  p.weight,
  p.volume,
  p.critical_stock_amount,
  p.shelflife_limit,
  p.stock_tracking,
  p.bbd_tracking,
  p.lot_tracking,
  p.image_path
FROM 
  products p
JOIN 
  product_types pt ON p.product_type_id = pt.id
JOIN 
  brands b ON p.brand_id = b.id
JOIN 
  quality_types qt ON p.quality_type_id = qt.id;

CREATE OR REPLACE VIEW vw_inventory_details AS
SELECT 
  i.id,
  p.stock_code,
  p.name AS product_name,
  i.lot_number,
  i.production_date,
  i.best_before_date,
  i.quantity,
  i.location,
  (i.best_before_date < CURRENT_TIMESTAMP) AS is_expired,
  (i.best_before_date - CURRENT_TIMESTAMP) AS days_until_expiry
FROM 
  inventory i
JOIN 
  products p ON i.product_id = p.id;

CREATE OR REPLACE VIEW vw_quality_check_details AS
SELECT 
  qc.id,
  p.stock_code,
  p.name AS product_name,
  u.name AS inspector_name,
  qc.check_date,
  qc.status,
  qc.notes,
  COUNT(pr.id) AS parameter_count,
  SUM(CASE WHEN pr.is_within_spec THEN 1 ELSE 0 END) AS parameters_within_spec
FROM 
  quality_checks qc
JOIN 
  products p ON qc.product_id = p.id
JOIN 
  users u ON qc.inspector_id = u.id
LEFT JOIN 
  parameter_readings pr ON qc.id = pr.quality_check_id
GROUP BY 
  qc.id, p.stock_code, p.name, u.name, qc.check_date, qc.status, qc.notes;

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_product_inventory(product_id_param INTEGER)
RETURNS TABLE (
  lot_number VARCHAR(50),
  production_date TIMESTAMP WITH TIME ZONE,
  best_before_date TIMESTAMP WITH TIME ZONE,
  quantity DECIMAL(10, 2),
  location VARCHAR(100),
  is_expired BOOLEAN,
  days_until_expiry INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.lot_number,
    i.production_date,
    i.best_before_date,
    i.quantity,
    i.location,
    (i.best_before_date < CURRENT_TIMESTAMP) AS is_expired,
    (i.best_before_date - CURRENT_TIMESTAMP) AS days_until_expiry
  FROM 
    inventory i
  WHERE 
    i.product_id = product_id_param
  ORDER BY 
    i.best_before_date ASC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_product_quality_history(product_id_param INTEGER)
RETURNS TABLE (
  check_id INTEGER,
  check_date TIMESTAMP WITH TIME ZONE,
  inspector_name VARCHAR(100),
  status VARCHAR(20),
  parameter_count INTEGER,
  pass_rate DECIMAL(5, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qc.id AS check_id,
    qc.check_date,
    u.name AS inspector_name,
    qc.status,
    COUNT(pr.id)::INTEGER AS parameter_count,
    (SUM(CASE WHEN pr.is_within_spec THEN 1 ELSE 0 END)::DECIMAL / COUNT(pr.id)::DECIMAL * 100)::DECIMAL(5,2) AS pass_rate
  FROM 
    quality_checks qc
  JOIN 
    users u ON qc.inspector_id = u.id
  LEFT JOIN 
    parameter_readings pr ON qc.id = pr.quality_check_id
  WHERE 
    qc.product_id = product_id_param
  GROUP BY 
    qc.id, qc.check_date, u.name, qc.status
  ORDER BY 
    qc.check_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Ensure the schema and functions have appropriate privileges
-- (Usually handled by your API application's database user)

-- Comment on database objects for documentation
COMMENT ON TABLE users IS 'Stores user information including roles for authentication and authorization';
COMMENT ON TABLE product_types IS 'Categorizes products into types (raw materials, semi-finished, finished products, etc.)';
COMMENT ON TABLE brands IS 'Represents different brands or manufacturers';
COMMENT ON TABLE quality_types IS 'Defines quality grades or classifications for products';
COMMENT ON TABLE products IS 'Central product catalog with all product details';
COMMENT ON TABLE inventory IS 'Tracks inventory levels, lot numbers, and expiration dates';
COMMENT ON TABLE quality_parameters IS 'Defines measurable quality parameters with acceptable ranges';
COMMENT ON TABLE quality_checks IS 'Records quality inspection events';
COMMENT ON TABLE parameter_readings IS 'Stores individual parameter measurements from quality checks';