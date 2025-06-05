-- Production Planning Schema
-- This schema defines the tables needed for production planning functionality

-- Production Plans table
CREATE TABLE IF NOT EXISTS production_plans (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft', -- draft, active, completed, cancelled
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  notes TEXT,
  company_id INTEGER REFERENCES companies(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_production_plans
BEFORE UPDATE ON production_plans
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Production Orders table
CREATE TABLE IF NOT EXISTS production_orders (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  plan_id INTEGER REFERENCES production_plans(id),
  product_id INTEGER REFERENCES products(id),
  semi_product_id INTEGER REFERENCES semi_products(id),
  recipe_id INTEGER REFERENCES recipes(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  progress INTEGER DEFAULT 0, -- 0-100 percentage of completion
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  notes TEXT,
  company_id INTEGER REFERENCES companies(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_production_orders
BEFORE UPDATE ON production_orders
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Production Stages table
CREATE TABLE IF NOT EXISTS production_stages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sequence INTEGER NOT NULL,
  estimated_duration INTEGER, -- in minutes
  company_id INTEGER REFERENCES companies(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_production_stages
BEFORE UPDATE ON production_stages
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Production Order Stages table (linking orders and stages)
CREATE TABLE IF NOT EXISTS production_order_stages (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES production_orders(id),
  stage_id INTEGER REFERENCES production_stages(id),
  sequence INTEGER NOT NULL,
  planned_start_date TIMESTAMP WITH TIME ZONE,
  planned_end_date TIMESTAMP WITH TIME ZONE,
  actual_start_date TIMESTAMP WITH TIME ZONE,
  actual_end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, skipped
  notes TEXT,
  company_id INTEGER REFERENCES companies(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_production_order_stages
BEFORE UPDATE ON production_order_stages
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Production Resources table
CREATE TABLE IF NOT EXISTS production_resources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- machine, equipment, human, etc.
  capacity DECIMAL(10,2),
  unit VARCHAR(20),
  cost_per_hour DECIMAL(10,2),
  location_id INTEGER REFERENCES warehouse_locations(id),
  available BOOLEAN DEFAULT TRUE,
  company_id INTEGER REFERENCES companies(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_production_resources
BEFORE UPDATE ON production_resources
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Production Order Resources table (linking orders and resources)
CREATE TABLE IF NOT EXISTS production_order_resources (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES production_orders(id),
  stage_id INTEGER REFERENCES production_stages(id),
  resource_id INTEGER REFERENCES production_resources(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),
  planned_start_date TIMESTAMP WITH TIME ZONE,
  planned_end_date TIMESTAMP WITH TIME ZONE,
  actual_start_date TIMESTAMP WITH TIME ZONE,
  actual_end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'allocated', -- allocated, in_use, released
  notes TEXT,
  company_id INTEGER REFERENCES companies(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_production_order_resources
BEFORE UPDATE ON production_order_resources
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Production Order Materials table (tracking material requirements)
CREATE TABLE IF NOT EXISTS production_order_materials (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES production_orders(id),
  stage_id INTEGER REFERENCES production_stages(id),
  raw_material_id INTEGER REFERENCES raw_materials(id),
  semi_product_id INTEGER REFERENCES semi_products(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),
  status VARCHAR(50) DEFAULT 'required', -- required, allocated, consumed
  notes TEXT,
  company_id INTEGER REFERENCES companies(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_production_order_materials
BEFORE UPDATE ON production_order_materials
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Production Outputs table (tracking produced items)
CREATE TABLE IF NOT EXISTS production_outputs (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES production_orders(id),
  stage_id INTEGER REFERENCES production_stages(id),
  product_id INTEGER REFERENCES products(id),
  semi_product_id INTEGER REFERENCES semi_products(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),
  lot_number VARCHAR(100),
  batch_number VARCHAR(100),
  quality_status VARCHAR(50) DEFAULT 'pending_inspection', -- pending_inspection, passed, failed, rework
  warehouse_id INTEGER REFERENCES warehouses(id),
  location_id INTEGER REFERENCES warehouse_locations(id),
  shelf_id INTEGER REFERENCES warehouse_shelves(id),
  notes TEXT,
  company_id INTEGER REFERENCES companies(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_production_outputs
BEFORE UPDATE ON production_outputs
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_production_plans_company_id ON production_plans(company_id);
CREATE INDEX IF NOT EXISTS idx_production_plans_status ON production_plans(status);
CREATE INDEX IF NOT EXISTS idx_production_plans_dates ON production_plans(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_production_orders_plan_id ON production_orders(plan_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_product_id ON production_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_semi_product_id ON production_orders(semi_product_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_company_id ON production_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_status ON production_orders(status);
CREATE INDEX IF NOT EXISTS idx_production_orders_dates ON production_orders(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_production_stages_company_id ON production_stages(company_id);
CREATE INDEX IF NOT EXISTS idx_production_order_stages_order_id ON production_order_stages(order_id);
CREATE INDEX IF NOT EXISTS idx_production_order_stages_stage_id ON production_order_stages(stage_id);
CREATE INDEX IF NOT EXISTS idx_production_order_stages_status ON production_order_stages(status);

CREATE INDEX IF NOT EXISTS idx_production_resources_company_id ON production_resources(company_id);
CREATE INDEX IF NOT EXISTS idx_production_resources_type ON production_resources(type);

CREATE INDEX IF NOT EXISTS idx_production_order_resources_order_id ON production_order_resources(order_id);
CREATE INDEX IF NOT EXISTS idx_production_order_resources_resource_id ON production_order_resources(resource_id);
CREATE INDEX IF NOT EXISTS idx_production_order_resources_status ON production_order_resources(status);

CREATE INDEX IF NOT EXISTS idx_production_order_materials_order_id ON production_order_materials(order_id);
CREATE INDEX IF NOT EXISTS idx_production_order_materials_raw_material_id ON production_order_materials(raw_material_id);
CREATE INDEX IF NOT EXISTS idx_production_order_materials_semi_product_id ON production_order_materials(semi_product_id);
CREATE INDEX IF NOT EXISTS idx_production_order_materials_status ON production_order_materials(status);

CREATE INDEX IF NOT EXISTS idx_production_outputs_order_id ON production_outputs(order_id);
CREATE INDEX IF NOT EXISTS idx_production_outputs_product_id ON production_outputs(product_id);
CREATE INDEX IF NOT EXISTS idx_production_outputs_semi_product_id ON production_outputs(semi_product_id);
CREATE INDEX IF NOT EXISTS idx_production_outputs_quality_status ON production_outputs(quality_status);