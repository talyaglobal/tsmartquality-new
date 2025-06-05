-- Warehouse Locations table
CREATE TABLE IF NOT EXISTS warehouse_locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  warehouse_id INTEGER REFERENCES warehouses(id),
  zone_code VARCHAR(50),
  floor_level INTEGER,
  is_pickup_point BOOLEAN DEFAULT FALSE,
  is_receiving_point BOOLEAN DEFAULT FALSE,
  capacity_volume DECIMAL(10,2),
  capacity_weight DECIMAL(10,2),
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
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  description TEXT,
  warehouse_id INTEGER REFERENCES warehouses(id),
  location_id INTEGER REFERENCES warehouse_locations(id),
  shelf_level INTEGER,
  shelf_position VARCHAR(50),
  capacity_volume DECIMAL(10,2),
  capacity_weight DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  is_blocked BOOLEAN DEFAULT FALSE,
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

-- Warehouse Inventory table (to track products in warehouses)
CREATE TABLE IF NOT EXISTS warehouse_inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  warehouse_id INTEGER REFERENCES warehouses(id),
  location_id INTEGER REFERENCES warehouse_locations(id),
  shelf_id INTEGER REFERENCES warehouse_shelves(id),
  quantity DECIMAL(10,2) DEFAULT 0,
  reserved_quantity DECIMAL(10,2) DEFAULT 0,
  available_quantity DECIMAL(10,2) DEFAULT 0, -- Computed: quantity - reserved_quantity
  lot_number VARCHAR(100),
  batch_number VARCHAR(100),
  expiry_date TIMESTAMP WITH TIME ZONE,
  production_date TIMESTAMP WITH TIME ZONE,
  company_id INTEGER REFERENCES companies(id),
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE TRIGGER set_timestamp_warehouse_inventory
BEFORE UPDATE ON warehouse_inventory
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();