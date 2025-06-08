import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { config } from '../config/config';

// Create a database connection pool
const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password
});

// Sample data for seeding the database
const USERS = [
  {
    name: 'Admin User',
    email: 'admin@tsmartquality.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Quality Inspector',
    email: 'inspector@tsmartquality.com',
    password: 'inspector123',
    role: 'inspector'
  },
  {
    name: 'Regular User',
    email: 'user@tsmartquality.com',
    password: 'user123',
    role: 'user'
  }
];

const PRODUCT_TYPES = [
  { name: 'Raw Material', code: 'RM' },
  { name: 'Semi-Finished', code: 'SF' },
  { name: 'Finished Product', code: 'FP' }
];

const BRANDS = [
  { name: 'TSmart', logo_url: 'https://example.com/tsmart-logo.png' },
  { name: 'Quality Plus', logo_url: 'https://example.com/qualityplus-logo.png' },
  { name: 'Premium Select', logo_url: 'https://example.com/premiumselect-logo.png' }
];

const QUALITY_TYPES = [
  { name: 'Premium', grade: 'A' },
  { name: 'Standard', grade: 'B' },
  { name: 'Economy', grade: 'C' },
  { name: 'Rejected', grade: 'F' }
];

const QUALITY_PARAMETERS = [
  { name: 'Moisture Content', unit: '%', min_value: 0, max_value: 15, target_value: 10 },
  { name: 'pH Level', unit: 'pH', min_value: 5.5, max_value: 7.5, target_value: 6.5 },
  { name: 'Temperature', unit: '°C', min_value: 2, max_value: 8, target_value: 4 },
  { name: 'Weight Variance', unit: '%', min_value: -2, max_value: 2, target_value: 0 },
  { name: 'Color Index', unit: 'CI', min_value: 80, max_value: 100, target_value: 95 },
  { name: 'Protein Content', unit: '%', min_value: 10, max_value: 18, target_value: 14 },
  { name: 'Sweetness Level', unit: 'Brix', min_value: 8, max_value: 16, target_value: 12 }
];

const PRODUCTS = [
  {
    stock_code: 'RM001',
    name: 'Organic Wheat Flour',
    product_type_code: 'RM',
    brand_name: 'TSmart',
    quality_type_name: 'Premium',
    description: 'High-quality organic wheat flour for premium products',
    weight: 25.0,
    critical_stock_amount: 100,
    shelflife_limit: 180,
    stock_tracking: true,
    bbd_tracking: true,
    lot_tracking: true
  },
  {
    stock_code: 'SF001',
    name: 'Bread Dough',
    product_type_code: 'SF',
    brand_name: 'Quality Plus',
    quality_type_name: 'Standard',
    description: 'Pre-mixed bread dough ready for baking',
    weight: 5.0,
    critical_stock_amount: 50,
    shelflife_limit: 2,
    stock_tracking: true,
    bbd_tracking: true,
    lot_tracking: true
  },
  {
    stock_code: 'FP001',
    name: 'Artisan Sourdough Bread',
    product_type_code: 'FP',
    brand_name: 'Premium Select',
    quality_type_name: 'Premium',
    description: 'Freshly baked artisan sourdough bread',
    weight: 0.8,
    critical_stock_amount: 20,
    shelflife_limit: 5,
    stock_tracking: true,
    bbd_tracking: true,
    lot_tracking: true
  },
  {
    stock_code: 'RM002',
    name: 'Purified Water',
    product_type_code: 'RM',
    brand_name: 'TSmart',
    quality_type_name: 'Standard',
    description: 'Purified water for food production',
    volume: 1000.0,
    critical_stock_amount: 500,
    shelflife_limit: 365,
    stock_tracking: true,
    bbd_tracking: false,
    lot_tracking: true
  },
  {
    stock_code: 'FP002',
    name: 'Whole Grain Bread',
    product_type_code: 'FP',
    brand_name: 'Quality Plus',
    quality_type_name: 'Standard',
    description: 'Nutritious whole grain bread',
    weight: 0.7,
    critical_stock_amount: 25,
    shelflife_limit: 7,
    stock_tracking: true,
    bbd_tracking: true,
    lot_tracking: true
  },
  {
    stock_code: 'RM003',
    name: 'Sugar',
    product_type_code: 'RM',
    brand_name: 'TSmart',
    quality_type_name: 'Standard',
    description: 'Refined white sugar for baking',
    weight: 50.0,
    critical_stock_amount: 200,
    shelflife_limit: 730,
    stock_tracking: true,
    bbd_tracking: true,
    lot_tracking: true
  },
  {
    stock_code: 'RM004',
    name: 'Milk',
    product_type_code: 'RM',
    brand_name: 'Quality Plus',
    quality_type_name: 'Premium',
    description: 'Fresh whole milk',
    volume: 10.0,
    critical_stock_amount: 50,
    shelflife_limit: 10,
    stock_tracking: true,
    bbd_tracking: true,
    lot_tracking: true
  },
  {
    stock_code: 'SF002',
    name: 'Cake Batter',
    product_type_code: 'SF',
    brand_name: 'Premium Select',
    quality_type_name: 'Premium',
    description: 'Prepared cake batter ready for baking',
    weight: 2.0,
    critical_stock_amount: 30,
    shelflife_limit: 1,
    stock_tracking: true,
    bbd_tracking: true,
    lot_tracking: true
  },
  {
    stock_code: 'FP003',
    name: 'Chocolate Chip Cookies',
    product_type_code: 'FP',
    brand_name: 'TSmart',
    quality_type_name: 'Premium',
    description: 'Fresh baked chocolate chip cookies',
    weight: 0.25,
    critical_stock_amount: 40,
    shelflife_limit: 14,
    stock_tracking: true,
    bbd_tracking: true,
    lot_tracking: true
  },
  {
    stock_code: 'FP004',
    name: 'Fruit Juice',
    product_type_code: 'FP',
    brand_name: 'Quality Plus',
    quality_type_name: 'Standard',
    description: 'Mixed fruit juice drink',
    volume: 1.0,
    critical_stock_amount: 100,
    shelflife_limit: 30,
    stock_tracking: true,
    bbd_tracking: true,
    lot_tracking: true
  },
  {
    stock_code: 'RM005',
    name: 'Cocoa Powder',
    product_type_code: 'RM',
    brand_name: 'Premium Select',
    quality_type_name: 'Premium',
    description: 'Pure cocoa powder for baking',
    weight: 5.0,
    critical_stock_amount: 25,
    shelflife_limit: 365,
    stock_tracking: true,
    bbd_tracking: true,
    lot_tracking: true
  },
  {
    stock_code: 'SF003',
    name: 'Pizza Dough',
    product_type_code: 'SF',
    brand_name: 'TSmart',
    quality_type_name: 'Standard',
    description: 'Ready-to-use pizza dough',
    weight: 1.0,
    critical_stock_amount: 35,
    shelflife_limit: 3,
    stock_tracking: true,
    bbd_tracking: true,
    lot_tracking: true
  },
  {
    stock_code: 'FP005',
    name: 'Carrot Cake',
    product_type_code: 'FP',
    brand_name: 'Premium Select',
    quality_type_name: 'Premium',
    description: 'Moist carrot cake with cream cheese frosting',
    weight: 1.2,
    critical_stock_amount: 15,
    shelflife_limit: 5,
    stock_tracking: true,
    bbd_tracking: true,
    lot_tracking: true
  }
];

// Function to seed the database
async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    console.log('Starting database seeding...');
    
    // Insert product types
    console.log('Seeding product types...');
    for (const productType of PRODUCT_TYPES) {
      await client.query(
        'INSERT INTO product_types (name, code) VALUES ($1, $2) ON CONFLICT (code) DO NOTHING',
        [productType.name, productType.code]
      );
    }
    
    // Insert brands
    console.log('Seeding brands...');
    for (const brand of BRANDS) {
      await client.query(
        'INSERT INTO brands (name, logo_url) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [brand.name, brand.logo_url]
      );
    }
    
    // Insert quality types
    console.log('Seeding quality types...');
    for (const qualityType of QUALITY_TYPES) {
      await client.query(
        'INSERT INTO quality_types (name, grade) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [qualityType.name, qualityType.grade]
      );
    }
    
    // Insert quality parameters
    console.log('Seeding quality parameters...');
    for (const parameter of QUALITY_PARAMETERS) {
      await client.query(
        `INSERT INTO quality_parameters (
          name, unit, min_value, max_value, target_value
        ) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (name) DO NOTHING`,
        [
          parameter.name,
          parameter.unit,
          parameter.min_value,
          parameter.max_value,
          parameter.target_value
        ]
      );
    }
    
    // Insert users with hashed passwords
    console.log('Seeding users...');
    for (const user of USERS) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await client.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
        [user.name, user.email, hashedPassword, user.role]
      );
    }
    
    // Insert products
    console.log('Seeding products...');
    for (const product of PRODUCTS) {
      // Get IDs for foreign keys
      const { rows: productTypeRows } = await client.query(
        'SELECT id FROM product_types WHERE code = $1',
        [product.product_type_code]
      );
      
      const { rows: brandRows } = await client.query(
        'SELECT id FROM brands WHERE name = $1',
        [product.brand_name]
      );
      
      const { rows: qualityTypeRows } = await client.query(
        'SELECT id FROM quality_types WHERE name = $1',
        [product.quality_type_name]
      );
      
      if (productTypeRows.length > 0 && brandRows.length > 0 && qualityTypeRows.length > 0) {
        // Generate default image path based on product type
        const defaultImagePath = `/images/products/${product.stock_code.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        
        await client.query(
          `INSERT INTO products (
            stock_code, name, product_type_id, brand_id, quality_type_id, description,
            weight, volume, critical_stock_amount, shelflife_limit,
            stock_tracking, bbd_tracking, lot_tracking, image_path
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (stock_code) DO NOTHING`,
          [
            product.stock_code,
            product.name,
            productTypeRows[0].id,
            brandRows[0].id,
            qualityTypeRows[0].id,
            product.description,
            product.weight || null,
            product.volume || null,
            product.critical_stock_amount,
            product.shelflife_limit,
            product.stock_tracking,
            product.bbd_tracking,
            product.lot_tracking,
            defaultImagePath
          ]
        );
      }
    }
    
    // Create inventory records
    console.log('Seeding inventory records...');
    // Get all products
    const { rows: productsForInventory } = await client.query('SELECT id, stock_code FROM products');
    
    // Create inventory records for each product
    for (const product of productsForInventory) {
      // Generate 1-3 inventory batches per product
      const numBatches = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numBatches; i++) {
        // Generate random lot number
        const lotNumber = `LOT-${product.stock_code}-${Math.floor(Math.random() * 10000)}`;
        
        // Generate random dates
        const daysAgo = Math.floor(Math.random() * 60); // Production date within last 60 days
        const productionDate = new Date();
        productionDate.setDate(productionDate.getDate() - daysAgo);
        
        // Best before date is 30-365 days after production date
        const bbdDays = Math.floor(Math.random() * 335) + 30;
        const bestBeforeDate = new Date(productionDate);
        bestBeforeDate.setDate(bestBeforeDate.getDate() + bbdDays);
        
        // Random quantity between 10 and 1000
        const quantity = Math.floor(Math.random() * 990) + 10;
        
        await client.query(
          `INSERT INTO inventory (
            product_id, lot_number, production_date, best_before_date, quantity, location
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            product.id,
            lotNumber,
            productionDate.toISOString(),
            bestBeforeDate.toISOString(),
            quantity,
            ['Warehouse A', 'Warehouse B', 'Production Floor', 'Cold Storage'][Math.floor(Math.random() * 4)]
          ]
        );
      }
    }
    
    // Create some quality checks
    console.log('Seeding quality checks...');
    // Get a user for the inspector
    const { rows: inspectorRows } = await client.query(
      "SELECT id FROM users WHERE role = 'inspector' LIMIT 1"
    );
    
    if (inspectorRows.length > 0) {
      const inspectorId = inspectorRows[0].id;
      
      // Get all products
      const { rows: productRows } = await client.query('SELECT id FROM products');
      
      // Get all quality parameters
      const { rows: parameterRows } = await client.query('SELECT id, name FROM quality_parameters');
      
      // For each product, create a few quality checks
      for (const product of productRows) {
        const statuses = ['passed', 'failed', 'pending'];
        
        // Create 1-3 quality checks per product
        const numChecks = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < numChecks; i++) {
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const daysAgo = Math.floor(Math.random() * 30); // Random date in the last 30 days
          const checkDate = new Date();
          checkDate.setDate(checkDate.getDate() - daysAgo);
          
          // Insert quality check
          const { rows: checkRows } = await client.query(
            `INSERT INTO quality_checks (
              product_id, inspector_id, check_date, status, notes
            ) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [
              product.id,
              inspectorId,
              checkDate.toISOString(),
              status,
              `Quality check for product. Status: ${status}.`
            ]
          );
          
          // If we have a check ID and parameters, create parameter readings
          if (checkRows.length > 0 && parameterRows.length > 0) {
            const checkId = checkRows[0].id;
            
            // Add 2-5 parameter readings per check
            const numParams = Math.min(Math.floor(Math.random() * 4) + 2, parameterRows.length);
            const shuffledParams = [...parameterRows].sort(() => 0.5 - Math.random());
            
            for (let p = 0; p < numParams; p++) {
              const parameter = shuffledParams[p];
              
              // Get parameter details to create realistic values
              const { rows: paramDetails } = await client.query(
                'SELECT min_value, max_value, target_value FROM quality_parameters WHERE id = $1',
                [parameter.id]
              );
              
              if (paramDetails.length > 0) {
                const { min_value, max_value, target_value } = paramDetails[0];
                
                // Generate a value - mostly within range, but sometimes outside for failed checks
                let value;
                if (status === 'failed' && Math.random() < 0.7) {
                  // For failed checks, 70% chance to be outside valid range
                  const belowMin = Math.random() < 0.5;
                  value = belowMin 
                    ? min_value - (Math.random() * (min_value * 0.2)) 
                    : max_value + (Math.random() * (max_value * 0.2));
                } else {
                  // Normal value within range
                  value = min_value + Math.random() * (max_value - min_value);
                }
                
                // Insert parameter reading
                await client.query(
                  `INSERT INTO parameter_readings (
                    quality_check_id, parameter_id, value, is_within_spec
                  ) VALUES ($1, $2, $3, $4)`,
                  [
                    checkId,
                    parameter.id,
                    value.toFixed(2),
                    value >= min_value && value <= max_value
                  ]
                );
              }
            }
          }
        }
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Database seeding completed successfully.');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

// Run the seeding function if this script is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding process finished.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding process failed:', error);
      process.exit(1);
    });
}

export default seedDatabase;