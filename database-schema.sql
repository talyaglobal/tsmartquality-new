-- TSmart Quality Database Schema
-- Project: tsmartquality-new
-- Team: tsmart
-- User: info@tsmart.ai

-- Base table setup for common fields
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

CREATE TRIGGER set_timestamp_companies
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Users table (extended from Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name VARCHAR(255),
  company_id INTEGER REFERENCES companies(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_brands
BEFORE UPDATE ON brands
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Product Groups table
CREATE TABLE IF NOT EXISTS product_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_product_groups
BEFORE UPDATE ON product_groups
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Product Types table
CREATE TABLE IF NOT EXISTS product_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_product_types
BEFORE UPDATE ON product_types
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Color Types table
CREATE TABLE IF NOT EXISTS color_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  hex_code VARCHAR(7),
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_color_types
BEFORE UPDATE ON color_types
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Cutting Types table
CREATE TABLE IF NOT EXISTS cutting_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_cutting_types
BEFORE UPDATE ON cutting_types
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Storage Conditions table
CREATE TABLE IF NOT EXISTS storage_conditions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  min_temperature DECIMAL(5,2),
  max_temperature DECIMAL(5,2),
  min_humidity DECIMAL(5,2),
  max_humidity DECIMAL(5,2),
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_storage_conditions
BEFORE UPDATE ON storage_conditions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Quality Types table
CREATE TABLE IF NOT EXISTS quality_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_quality_types
BEFORE UPDATE ON quality_types
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_sellers
BEFORE UPDATE ON sellers
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Physical properties
  weight DECIMAL(10,2),
  volume DECIMAL(10,2),
  density DECIMAL(10,2),
  width DECIMAL(10,2),
  length DECIMAL(10,2),
  height DECIMAL(10,2),
  
  -- Inventory
  critical_stock_amount DECIMAL(10,2),
  shelflife_limit INTEGER,
  max_stack INTEGER,
  
  -- Tracking flags
  stock_tracking BOOLEAN DEFAULT FALSE,
  bbd_tracking BOOLEAN DEFAULT FALSE,
  lot_tracking BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  is_setted_product BOOLEAN DEFAULT FALSE,
  
  -- Foreign keys
  seller_id INTEGER REFERENCES sellers(id),
  product_group_id INTEGER REFERENCES product_groups(id),
  brand_id INTEGER REFERENCES brands(id),
  product_type_id INTEGER REFERENCES product_types(id),
  storage_condition_id INTEGER REFERENCES storage_conditions(id),
  color_type_id INTEGER REFERENCES color_types(id),
  cutting_type_id INTEGER REFERENCES cutting_types(id),
  quality_type_id INTEGER REFERENCES quality_types(id),
  
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_products
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Product History table
CREATE TABLE IF NOT EXISTS product_history (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  change_description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_product_history
BEFORE UPDATE ON product_history
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  category VARCHAR(50), -- cash-cow, star, problem-child, dog
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  strategic BOOLEAN DEFAULT FALSE,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  last_order TIMESTAMP WITH TIME ZONE,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_customers
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Product to Customer mapping table
CREATE TABLE IF NOT EXISTS product_to_customers (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  customer_id INTEGER REFERENCES customers(id),
  custom_product_code VARCHAR(100),
  custom_product_name VARCHAR(255),
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(product_id, customer_id)
);

CREATE TRIGGER set_timestamp_product_to_customers
BEFORE UPDATE ON product_to_customers
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id SERIAL PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_path VARCHAR(255) NOT NULL,
  product_id INTEGER REFERENCES products(id),
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_photos
BEFORE UPDATE ON photos
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Countries table
CREATE TABLE IF NOT EXISTS countries (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10),
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_countries
BEFORE UPDATE ON countries
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  address TEXT,
  country_id INTEGER REFERENCES countries(id),
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_warehouses
BEFORE UPDATE ON warehouses
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Packaging table
CREATE TABLE IF NOT EXISTS packagings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  width DECIMAL(10,2),
  length DECIMAL(10,2),
  height DECIMAL(10,2),
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_packagings
BEFORE UPDATE ON packagings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Raw Material Groups table
CREATE TABLE IF NOT EXISTS raw_material_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_raw_material_groups
BEFORE UPDATE ON raw_material_groups
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Raw Materials table
CREATE TABLE IF NOT EXISTS raw_materials (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  raw_material_group_id INTEGER REFERENCES raw_material_groups(id),
  critical_stock_amount DECIMAL(10,2),
  stock_tracking BOOLEAN DEFAULT FALSE,
  bbd_tracking BOOLEAN DEFAULT FALSE,
  lot_tracking BOOLEAN DEFAULT FALSE,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_raw_materials
BEFORE UPDATE ON raw_materials
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Semi Product Groups table
CREATE TABLE IF NOT EXISTS semi_product_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_semi_product_groups
BEFORE UPDATE ON semi_product_groups
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Semi Products table
CREATE TABLE IF NOT EXISTS semi_products (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  semi_product_group_id INTEGER REFERENCES semi_product_groups(id),
  critical_stock_amount DECIMAL(10,2),
  stock_tracking BOOLEAN DEFAULT FALSE,
  bbd_tracking BOOLEAN DEFAULT FALSE,
  lot_tracking BOOLEAN DEFAULT FALSE,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_semi_products
BEFORE UPDATE ON semi_products
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  product_id INTEGER REFERENCES products(id),
  semi_product_id INTEGER REFERENCES semi_products(id),
  total_quantity DECIMAL(10,2),
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_recipes
BEFORE UPDATE ON recipes
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Recipe Details table
CREATE TABLE IF NOT EXISTS recipe_details (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER REFERENCES recipes(id),
  raw_material_id INTEGER REFERENCES raw_materials(id),
  semi_product_id INTEGER REFERENCES semi_products(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),
  sequence INTEGER,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_recipe_details
BEFORE UPDATE ON recipe_details
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Specifications table
CREATE TABLE IF NOT EXISTS specs (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  product_id INTEGER REFERENCES products(id),
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_specs
BEFORE UPDATE ON specs
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Specification Details table
CREATE TABLE IF NOT EXISTS spec_details (
  id SERIAL PRIMARY KEY,
  spec_id INTEGER REFERENCES specs(id),
  parameter_name VARCHAR(255) NOT NULL,
  min_value DECIMAL(10,2),
  max_value DECIMAL(10,2),
  target_value DECIMAL(10,2),
  unit VARCHAR(20),
  is_mandatory BOOLEAN DEFAULT FALSE,
  sequence INTEGER,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_spec_details
BEFORE UPDATE ON spec_details
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_roles
BEFORE UPDATE ON roles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_groups
BEFORE UPDATE ON groups
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Group in Roles table
CREATE TABLE IF NOT EXISTS group_in_roles (
  id SERIAL PRIMARY KEY,
  group_id INTEGER REFERENCES groups(id),
  role_id INTEGER REFERENCES roles(id),
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_group_in_roles
BEFORE UPDATE ON group_in_roles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- User in Groups table
CREATE TABLE IF NOT EXISTS user_in_groups (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  group_id INTEGER REFERENCES groups(id),
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER set_timestamp_user_in_groups
BEFORE UPDATE ON user_in_groups
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Localizations table
CREATE TABLE IF NOT EXISTS localizations (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL,
  value_tr TEXT,
  value_en TEXT,
  value_es TEXT,
  value_fr TEXT,
  value_it TEXT,
  value_ru TEXT,
  value_de TEXT,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_localizations
BEFORE UPDATE ON localizations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ERP Settings table
CREATE TABLE IF NOT EXISTS erp_settings (
  id SERIAL PRIMARY KEY,
  system_name VARCHAR(255) NOT NULL,
  connection_string TEXT,
  username VARCHAR(255),
  password VARCHAR(255),
  db1_name VARCHAR(255),
  db2_name VARCHAR(255),
  db3_name VARCHAR(255),
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_erp_settings
BEFORE UPDATE ON erp_settings
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();