-- Warehouse Locations table
CREATE TABLE IF NOT EXISTS warehouse_locations (
  id SERIAL PRIMARY KEY,
  warehouse_id INTEGER REFERENCES warehouses(id),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  floor_level INTEGER,
  aisle VARCHAR(50),
  section VARCHAR(50),
  capacity DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_warehouse_locations
BEFORE UPDATE ON warehouse_locations
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Warehouse Shelves table
CREATE TABLE IF NOT EXISTS warehouse_shelves (
  id SERIAL PRIMARY KEY,
  location_id INTEGER REFERENCES warehouse_locations(id),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  shelf_row INTEGER,
  shelf_column INTEGER,
  capacity DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_warehouse_shelves
BEFORE UPDATE ON warehouse_shelves
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Warehouse Inventory table
CREATE TABLE IF NOT EXISTS warehouse_inventory (
  id SERIAL PRIMARY KEY,
  warehouse_id INTEGER REFERENCES warehouses(id),
  location_id INTEGER REFERENCES warehouse_locations(id),
  shelf_id INTEGER REFERENCES warehouse_shelves(id),
  product_id INTEGER REFERENCES products(id),
  raw_material_id INTEGER REFERENCES raw_materials(id),
  semi_product_id INTEGER REFERENCES semi_products(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),
  lot_number VARCHAR(100),
  batch_number VARCHAR(100),
  expiry_date TIMESTAMP WITH TIME ZONE,
  production_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'available', -- available, reserved, damaged, expired
  company_id INTEGER REFERENCES companies(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_warehouse_inventory
BEFORE UPDATE ON warehouse_inventory
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Warehouse Movement History table
CREATE TABLE IF NOT EXISTS warehouse_movements (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  raw_material_id INTEGER REFERENCES raw_materials(id),
  semi_product_id INTEGER REFERENCES semi_products(id),
  from_warehouse_id INTEGER REFERENCES warehouses(id),
  to_warehouse_id INTEGER REFERENCES warehouses(id),
  from_location_id INTEGER REFERENCES warehouse_locations(id),
  to_location_id INTEGER REFERENCES warehouse_locations(id),
  from_shelf_id INTEGER REFERENCES warehouse_shelves(id),
  to_shelf_id INTEGER REFERENCES warehouse_shelves(id),
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),
  movement_type VARCHAR(50) NOT NULL, -- in, out, transfer, adjustment
  lot_number VARCHAR(100),
  batch_number VARCHAR(100),
  reference_number VARCHAR(100),
  notes TEXT,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_warehouse_movements
BEFORE UPDATE ON warehouse_movements
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_warehouse_locations_warehouse_id ON warehouse_locations(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_shelves_location_id ON warehouse_shelves(location_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_warehouse_id ON warehouse_inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_location_id ON warehouse_inventory(location_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_shelf_id ON warehouse_inventory(shelf_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_product_id ON warehouse_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_raw_material_id ON warehouse_inventory(raw_material_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_semi_product_id ON warehouse_inventory(semi_product_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_movements_product_id ON warehouse_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_movements_from_warehouse_id ON warehouse_movements(from_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_movements_to_warehouse_id ON warehouse_movements(to_warehouse_id);