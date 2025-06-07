<<<<<<< Updated upstream
-- TSmart Quality Sample Data Generation
-- Project: tsmartquality-new
-- Team: tsmart
-- User: info@tsmart.ai

-- This script inserts 100 sample records into each table

-- Insert fake data into companies
INSERT INTO companies (name, code, status)
SELECT 
  'Company ' || i,
  'COMP' || LPAD(i::TEXT, 3, '0'),
  TRUE
FROM generate_series(1, 100) AS i;

-- Get the admin user ID from Supabase auth
DO $$
DECLARE 
  admin_id UUID;
BEGIN
  -- Get the admin user ID if it exists
  SELECT id INTO admin_id FROM auth.users WHERE email = 'info@tsmart.ai' LIMIT 1;
  
  IF admin_id IS NULL THEN
    -- If no admin user exists, use a placeholder UUID (you'll need to replace this later)
    admin_id := '00000000-0000-0000-0000-000000000000'::UUID;
  END IF;

  -- Insert fake user data for the admin user
  INSERT INTO users (id, full_name, company_id, is_active)
  VALUES (admin_id, 'TSmart Admin', 1, TRUE)
  ON CONFLICT (id) DO NOTHING;

  -- Insert into brands
  FOR i IN 1..100 LOOP
    INSERT INTO brands (name, company_id, status, created_by)
    VALUES ('Brand ' || i, (i % 100) + 1, TRUE, admin_id);
  END LOOP;
  
  -- Insert into product_groups
  FOR i IN 1..100 LOOP
    INSERT INTO product_groups (name, description, company_id, status, created_by)
    VALUES (
      'Product Group ' || i,
      'Description for product group ' || i,
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into product_types
  FOR i IN 1..100 LOOP
    INSERT INTO product_types (name, description, company_id, status, created_by)
    VALUES (
      'Product Type ' || i,
      'Description for product type ' || i,
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into color_types
  FOR i IN 1..100 LOOP
    INSERT INTO color_types (name, hex_code, company_id, status, created_by)
    VALUES (
      'Color ' || i,
      '#' || LPAD(TO_HEX((i * 2) % 255), 2, '0') || LPAD(TO_HEX((i * 3) % 255), 2, '0') || LPAD(TO_HEX((i * 5) % 255), 2, '0'),
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into cutting_types
  FOR i IN 1..100 LOOP
    INSERT INTO cutting_types (name, description, company_id, status, created_by)
    VALUES (
      'Cutting Type ' || i,
      'Description for cutting type ' || i,
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into storage_conditions
  FOR i IN 1..100 LOOP
    INSERT INTO storage_conditions (
      name, 
      description, 
      min_temperature, 
      max_temperature, 
      min_humidity, 
      max_humidity, 
      company_id, 
      status, 
      created_by
    )
    VALUES (
      'Storage Condition ' || i,
      'Description for storage condition ' || i,
      (RANDOM() * 10)::DECIMAL(5,2),
      (RANDOM() * 30 + 10)::DECIMAL(5,2),
      (RANDOM() * 40)::DECIMAL(5,2),
      (RANDOM() * 40 + 40)::DECIMAL(5,2),
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into quality_types
  FOR i IN 1..100 LOOP
    INSERT INTO quality_types (name, description, company_id, status, created_by)
    VALUES (
      'Quality Type ' || i,
      'Description for quality type ' || i,
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into sellers
  FOR i IN 1..100 LOOP
    INSERT INTO sellers (
      name, 
      code, 
      contact_person, 
      email, 
      phone, 
      address, 
      company_id, 
      status, 
      created_by
    )
    VALUES (
      'Seller ' || i,
      'SLR' || LPAD(i::TEXT, 3, '0'),
      'Contact Person ' || i,
      'seller' || i || '@example.com',
      '+1-555-' || LPAD(i::TEXT, 3, '0') || '-' || LPAD((i * 7)::TEXT, 4, '0'),
      'Address for seller ' || i,
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into countries
  FOR i IN 1..100 LOOP
    INSERT INTO countries (name, code, company_id, status, created_by)
    VALUES (
      'Country ' || i,
      'C' || LPAD(i::TEXT, 2, '0'),
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into warehouses
  FOR i IN 1..100 LOOP
    INSERT INTO warehouses (
      name, 
      code, 
      address, 
      country_id, 
      company_id, 
      status, 
      created_by
    )
    VALUES (
      'Warehouse ' || i,
      'WH' || LPAD(i::TEXT, 3, '0'),
      'Address for warehouse ' || i,
      (i % 100) + 1,
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into packagings
  FOR i IN 1..100 LOOP
    INSERT INTO packagings (
      name, 
      description, 
      width, 
      length, 
      height, 
      company_id, 
      status, 
      created_by
    )
    VALUES (
      'Packaging ' || i,
      'Description for packaging ' || i,
      (RANDOM() * 50 + 10)::DECIMAL(10,2),
      (RANDOM() * 50 + 10)::DECIMAL(10,2),
      (RANDOM() * 50 + 10)::DECIMAL(10,2),
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into raw_material_groups
  FOR i IN 1..100 LOOP
    INSERT INTO raw_material_groups (name, description, company_id, status, created_by)
    VALUES (
      'Raw Material Group ' || i,
      'Description for raw material group ' || i,
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into raw_materials
  FOR i IN 1..100 LOOP
    INSERT INTO raw_materials (
      code, 
      name, 
      description, 
      raw_material_group_id, 
      critical_stock_amount, 
      stock_tracking, 
      bbd_tracking, 
      lot_tracking, 
      company_id, 
      status, 
      created_by
    )
    VALUES (
      'RM' || LPAD(i::TEXT, 3, '0'),
      'Raw Material ' || i,
      'Description for raw material ' || i,
      (i % 100) + 1,
      (RANDOM() * 1000)::DECIMAL(10,2),
      i % 2 = 0,
      i % 3 = 0,
      i % 4 = 0,
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into semi_product_groups
  FOR i IN 1..100 LOOP
    INSERT INTO semi_product_groups (name, description, company_id, status, created_by)
    VALUES (
      'Semi Product Group ' || i,
      'Description for semi product group ' || i,
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into semi_products
  FOR i IN 1..100 LOOP
    INSERT INTO semi_products (
      code, 
      name, 
      description, 
      semi_product_group_id, 
      critical_stock_amount, 
      stock_tracking, 
      bbd_tracking, 
      lot_tracking, 
      company_id, 
      status, 
      created_by
    )
    VALUES (
      'SP' || LPAD(i::TEXT, 3, '0'),
      'Semi Product ' || i,
      'Description for semi product ' || i,
      (i % 100) + 1,
      (RANDOM() * 500)::DECIMAL(10,2),
      i % 2 = 0,
      i % 3 = 0,
      i % 4 = 0,
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into products
  FOR i IN 1..100 LOOP
    INSERT INTO products (
      code, 
      name, 
      description, 
      weight, 
      volume, 
      density, 
      width, 
      length, 
      height, 
      critical_stock_amount, 
      shelflife_limit, 
      max_stack, 
      stock_tracking, 
      bbd_tracking, 
      lot_tracking, 
      is_blocked, 
      is_setted_product, 
      seller_id, 
      product_group_id, 
      brand_id, 
      product_type_id, 
      storage_condition_id, 
      color_type_id, 
      cutting_type_id, 
      quality_type_id, 
      company_id, 
      status, 
      created_by
    )
    VALUES (
      'P' || LPAD(i::TEXT, 3, '0'),
      'Product ' || i,
      'Description for product ' || i,
      (RANDOM() * 10 + 0.5)::DECIMAL(10,2),
      (RANDOM() * 5 + 0.2)::DECIMAL(10,2),
      (RANDOM() * 2 + 0.8)::DECIMAL(10,2),
      (RANDOM() * 30 + 5)::DECIMAL(10,2),
      (RANDOM() * 30 + 5)::DECIMAL(10,2),
      (RANDOM() * 30 + 5)::DECIMAL(10,2),
      (RANDOM() * 200 + 10)::DECIMAL(10,2),
      (RANDOM() * 365 + 30)::INTEGER,
      (RANDOM() * 10 + 1)::INTEGER,
      i % 2 = 0,
      i % 3 = 0,
      i % 4 = 0,
      i % 20 = 0,
      i % 5 = 0,
      (i % 100) + 1,
      (i % 100) + 1,
      (i % 100) + 1,
      (i % 100) + 1,
      (i % 100) + 1,
      (i % 100) + 1,
      (i % 100) + 1,
      (i % 100) + 1,
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into product_history
  FOR i IN 1..100 LOOP
    INSERT INTO product_history (
      product_id, 
      change_description, 
      old_value, 
      new_value, 
      company_id, 
      status, 
      created_by
    )
    VALUES (
      (i % 100) + 1,
      'Changed ' || (CASE WHEN i % 5 = 0 THEN 'name' WHEN i % 5 = 1 THEN 'price' WHEN i % 5 = 2 THEN 'weight' WHEN i % 5 = 3 THEN 'dimensions' ELSE 'status' END),
      'Old value ' || i,
      'New value ' || i,
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into customers
  FOR i IN 1..100 LOOP
    INSERT INTO customers (
      name, 
      code, 
      category, 
      rating, 
      strategic, 
      contact_person, 
      email, 
      phone, 
      address, 
      last_order, 
      company_id, 
      status, 
      created_by
    )
    VALUES (
      'Customer ' || i,
      'CUST' || LPAD(i::TEXT, 3, '0'),
      (CASE WHEN i % 4 = 0 THEN 'cash-cow' WHEN i % 4 = 1 THEN 'star' WHEN i % 4 = 2 THEN 'problem-child' ELSE 'dog' END),
      (i % 5) + 1,
      i % 10 = 0,
      'Contact Person ' || i,
      'customer' || i || '@example.com',
      '+1-555-' || LPAD(i::TEXT, 3, '0') || '-' || LPAD((i * 3)::TEXT, 4, '0'),
      'Address for customer ' || i,
      NOW() - (i % 365) * INTERVAL '1 day',
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into product_to_customers
  FOR i IN 1..100 LOOP
    INSERT INTO product_to_customers (
      product_id, 
      customer_id, 
      custom_product_code, 
      custom_product_name, 
      company_id, 
      status, 
      created_by
    )
    VALUES (
      (i % 100) + 1,
      (i % 100) + 1,
      'CUST-P' || LPAD(i::TEXT, 3, '0'),
      'Custom Product Name ' || i,
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into photos
  FOR i IN 1..100 LOOP
    INSERT INTO photos (
      file_name, 
      file_type, 
      file_path, 
      product_id, 
      company_id, 
      status, 
      created_by
    )
    VALUES (
      'photo_' || i || '.jpg',
      'image/jpeg',
      '/uploads/photos/photo_' || i || '.jpg',
      (i % 100) + 1,
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into recipes
  FOR i IN 1..100 LOOP
    INSERT INTO recipes (
      code, 
      name, 
      description, 
      product_id, 
      semi_product_id, 
      total_quantity, 
      company_id, 
      status, 
      created_by
    )
    VALUES (
      'R' || LPAD(i::TEXT, 3, '0'),
      'Recipe ' || i,
      'Description for recipe ' || i,
      CASE WHEN i % 2 = 0 THEN (i % 100) + 1 ELSE NULL END,
      CASE WHEN i % 2 = 1 THEN (i % 100) + 1 ELSE NULL END,
      (RANDOM() * 100 + 1)::DECIMAL(10,2),
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into recipe_details
  FOR i IN 1..100 LOOP
    INSERT INTO recipe_details (
      recipe_id, 
      raw_material_id, 
      semi_product_id, 
      quantity, 
      unit, 
      sequence, 
      company_id, 
      status, 
      created_by
    )
    VALUES (
      (i % 100) + 1,
      CASE WHEN i % 2 = 0 THEN (i % 100) + 1 ELSE NULL END,
      CASE WHEN i % 2 = 1 THEN (i % 100) + 1 ELSE NULL END,
      (RANDOM() * 10 + 0.1)::DECIMAL(10,2),
      (CASE WHEN i % 4 = 0 THEN 'kg' WHEN i % 4 = 1 THEN 'g' WHEN i % 4 = 2 THEN 'l' ELSE 'ml' END),
      i,
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into specs
  FOR i IN 1..100 LOOP
    INSERT INTO specs (
      code, 
      name, 
      description, 
      product_id, 
      company_id, 
      status, 
      created_by
    )
    VALUES (
      'SPEC' || LPAD(i::TEXT, 3, '0'),
      'Spec ' || i,
      'Description for spec ' || i,
      (i % 100) + 1,
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into spec_details
  FOR i IN 1..100 LOOP
    INSERT INTO spec_details (
      spec_id, 
      parameter_name, 
      min_value, 
      max_value, 
      target_value, 
      unit, 
      is_mandatory, 
      sequence, 
      company_id, 
      status, 
      created_by
    )
    VALUES (
      (i % 100) + 1,
      'Parameter ' || i,
      (RANDOM() * 10)::DECIMAL(10,2),
      (RANDOM() * 10 + 10)::DECIMAL(10,2),
      (RANDOM() * 10 + 5)::DECIMAL(10,2),
      (CASE WHEN i % 5 = 0 THEN 'kg' WHEN i % 5 = 1 THEN 'g' WHEN i % 5 = 2 THEN 'l' WHEN i % 5 = 3 THEN 'ml' ELSE 'cm' END),
      i % 3 = 0,
      i,
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into roles
  FOR i IN 1..100 LOOP
    INSERT INTO roles (
      name, 
      description, 
      company_id, 
      status
    )
    VALUES (
      'Role ' || i,
      'Description for role ' || i,
      (i % 100) + 1,
      TRUE
    );
  END LOOP;
  
  -- Insert into groups
  FOR i IN 1..100 LOOP
    INSERT INTO groups (
      name, 
      description, 
      company_id, 
      status
    )
    VALUES (
      'Group ' || i,
      'Description for group ' || i,
      (i % 100) + 1,
      TRUE
    );
  END LOOP;
  
  -- Insert into group_in_roles
  FOR i IN 1..100 LOOP
    INSERT INTO group_in_roles (
      group_id, 
      role_id, 
      company_id, 
      status
    )
    VALUES (
      (i % 100) + 1,
      (i % 100) + 1,
      (i % 100) + 1,
      TRUE
    );
  END LOOP;
  
  -- Insert into user_in_groups
  INSERT INTO user_in_groups (
    user_id, 
    group_id, 
    company_id, 
    status
  )
  VALUES (
    admin_id,
    1,
    1,
    TRUE
  );
  
  -- Insert into localizations
  FOR i IN 1..100 LOOP
    INSERT INTO localizations (
      key, 
      value_tr, 
      value_en, 
      value_es, 
      value_fr, 
      value_it, 
      value_ru, 
      value_de, 
      company_id, 
      status, 
      created_by
    )
    VALUES (
      'key.' || i,
      'Turkish value ' || i,
      'English value ' || i,
      'Spanish value ' || i,
      'French value ' || i,
      'Italian value ' || i,
      'Russian value ' || i,
      'German value ' || i,
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
  -- Insert into erp_settings
  FOR i IN 1..100 LOOP
    INSERT INTO erp_settings (
      system_name, 
      connection_string, 
      username, 
      password, 
      db1_name, 
      db2_name, 
      db3_name, 
      company_id, 
      status, 
      created_by
    )
    VALUES (
      'ERP System ' || i,
      'Server=server' || i || '.example.com;Database=db' || i || ';User Id=user' || i || ';Password=****;',
      'user' || i,
      '********', -- placeholder for password, would be properly hashed in a real system
      'database1_' || i,
      CASE WHEN i % 2 = 0 THEN 'database2_' || i ELSE NULL END,
      CASE WHEN i % 3 = 0 THEN 'database3_' || i ELSE NULL END,
      (i % 100) + 1,
      TRUE,
      admin_id
    );
  END LOOP;
  
END $$;
=======

>>>>>>> Stashed changes
