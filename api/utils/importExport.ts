import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import { config } from '../config/config';

// Create a database connection pool
const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password
});

// Constants
const EXPORT_DIR = path.join(__dirname, '../../exports');
const IMPORT_DIR = path.join(__dirname, '../../imports');

// Ensure directories exist
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

if (!fs.existsSync(IMPORT_DIR)) {
  fs.mkdirSync(IMPORT_DIR, { recursive: true });
}

/**
 * Export products to CSV file
 * @param {string} outputFileName - Name of the output file (without .csv extension)
 * @param {object} filters - Optional filters for the query
 * @returns {Promise<string>} - Path to the exported file
 */
export async function exportProductsToCSV(outputFileName: string, filters: any = {}): Promise<string> {
  const client = await pool.connect();
  try {
    console.log('Starting product export...');
    
    // Build query with filters
    let query = `
      SELECT 
        p.stock_code,
        p.name,
        pt.code AS product_type_code,
        b.name AS brand_name,
        qt.name AS quality_type_name,
        p.description,
        p.weight,
        p.volume,
        p.critical_stock_amount,
        p.shelflife_limit,
        p.stock_tracking,
        p.bbd_tracking,
        p.lot_tracking
      FROM 
        products p
      JOIN 
        product_types pt ON p.product_type_id = pt.id
      JOIN 
        brands b ON p.brand_id = b.id
      JOIN 
        quality_types qt ON p.quality_type_id = qt.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Apply filters if provided
    if (filters.productType) {
      query += ` AND pt.code = $${paramIndex}`;
      queryParams.push(filters.productType);
      paramIndex++;
    }
    
    if (filters.brand) {
      query += ` AND b.name = $${paramIndex}`;
      queryParams.push(filters.brand);
      paramIndex++;
    }
    
    if (filters.qualityType) {
      query += ` AND qt.name = $${paramIndex}`;
      queryParams.push(filters.qualityType);
      paramIndex++;
    }
    
    query += ` ORDER BY p.stock_code`;
    
    // Execute query
    const { rows } = await client.query(query, queryParams);
    
    console.log(`Found ${rows.length} products to export.`);
    
    // Generate timestamp for the file name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${outputFileName}_${timestamp}.csv`;
    const filePath = path.join(EXPORT_DIR, fileName);
    
    // Define CSV writer
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'stock_code', title: 'Stock Code' },
        { id: 'name', title: 'Product Name' },
        { id: 'product_type_code', title: 'Product Type' },
        { id: 'brand_name', title: 'Brand' },
        { id: 'quality_type_name', title: 'Quality Type' },
        { id: 'description', title: 'Description' },
        { id: 'weight', title: 'Weight' },
        { id: 'volume', title: 'Volume' },
        { id: 'critical_stock_amount', title: 'Critical Stock Amount' },
        { id: 'shelflife_limit', title: 'Shelf Life (days)' },
        { id: 'stock_tracking', title: 'Stock Tracking' },
        { id: 'bbd_tracking', title: 'BBD Tracking' },
        { id: 'lot_tracking', title: 'Lot Tracking' }
      ]
    });
    
    // Write to CSV
    await csvWriter.writeRecords(rows);
    
    console.log(`Exported ${rows.length} products to ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Error exporting products:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Import products from CSV file
 * @param {string} filePath - Path to the CSV file
 * @param {boolean} updateExisting - Whether to update existing products
 * @returns {Promise<object>} - Import results
 */
export async function importProductsFromCSV(filePath: string, updateExisting: boolean = false): Promise<any> {
  const client = await pool.connect();
  try {
    console.log(`Starting product import from ${filePath}...`);
    
    // Parse CSV file
    const products = await parseCSV(filePath);
    console.log(`Found ${products.length} products in CSV file.`);
    
    // Start transaction
    await client.query('BEGIN');
    
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      errorMessages: []
    };
    
    // Process each product
    for (const product of products) {
      try {
        // Get IDs for foreign keys
        let productTypeId, brandId, qualityTypeId;
        
        // Get product type ID
        const productTypeResult = await client.query(
          'SELECT id FROM product_types WHERE code = $1',
          [product.product_type_code]
        );
        
        if (productTypeResult.rows.length === 0) {
          // Create new product type if it doesn't exist
          const newProductType = await client.query(
            'INSERT INTO product_types (name, code) VALUES ($1, $2) RETURNING id',
            [product.product_type_code, product.product_type_code]
          );
          productTypeId = newProductType.rows[0].id;
        } else {
          productTypeId = productTypeResult.rows[0].id;
        }
        
        // Get brand ID
        const brandResult = await client.query(
          'SELECT id FROM brands WHERE name = $1',
          [product.brand_name]
        );
        
        if (brandResult.rows.length === 0) {
          // Create new brand if it doesn't exist
          const newBrand = await client.query(
            'INSERT INTO brands (name) VALUES ($1) RETURNING id',
            [product.brand_name]
          );
          brandId = newBrand.rows[0].id;
        } else {
          brandId = brandResult.rows[0].id;
        }
        
        // Get quality type ID
        const qualityTypeResult = await client.query(
          'SELECT id FROM quality_types WHERE name = $1',
          [product.quality_type_name]
        );
        
        if (qualityTypeResult.rows.length === 0) {
          // Default to 'Standard' quality if the specified one doesn't exist
          const defaultQualityType = await client.query(
            'SELECT id FROM quality_types WHERE name = $1',
            ['Standard']
          );
          
          if (defaultQualityType.rows.length === 0) {
            // Create a standard quality type if it doesn't exist
            const newQualityType = await client.query(
              'INSERT INTO quality_types (name, grade) VALUES ($1, $2) RETURNING id',
              ['Standard', 'B']
            );
            qualityTypeId = newQualityType.rows[0].id;
          } else {
            qualityTypeId = defaultQualityType.rows[0].id;
          }
        } else {
          qualityTypeId = qualityTypeResult.rows[0].id;
        }
        
        // Check if product already exists
        const existingProduct = await client.query(
          'SELECT id FROM products WHERE stock_code = $1',
          [product.stock_code]
        );
        
        if (existingProduct.rows.length > 0) {
          // Product exists, update it if updateExisting is true
          if (updateExisting) {
            await client.query(
              `UPDATE products SET 
                name = $1,
                product_type_id = $2,
                brand_id = $3,
                quality_type_id = $4,
                description = $5,
                weight = $6,
                volume = $7,
                critical_stock_amount = $8,
                shelflife_limit = $9,
                stock_tracking = $10,
                bbd_tracking = $11,
                lot_tracking = $12,
                updated_at = CURRENT_TIMESTAMP
              WHERE stock_code = $13`,
              [
                product.name,
                productTypeId,
                brandId,
                qualityTypeId,
                product.description,
                parseFloat(product.weight) || null,
                parseFloat(product.volume) || null,
                parseInt(product.critical_stock_amount) || 0,
                parseInt(product.shelflife_limit) || 0,
                product.stock_tracking === 'true' || product.stock_tracking === true,
                product.bbd_tracking === 'true' || product.bbd_tracking === true,
                product.lot_tracking === 'true' || product.lot_tracking === true,
                product.stock_code
              ]
            );
            results.updated++;
          } else {
            results.skipped++;
          }
        } else {
          // Create new product
          const defaultImagePath = `/images/products/${product.stock_code.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
          
          await client.query(
            `INSERT INTO products (
              stock_code, name, product_type_id, brand_id, quality_type_id, 
              description, weight, volume, critical_stock_amount, shelflife_limit,
              stock_tracking, bbd_tracking, lot_tracking, image_path
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [
              product.stock_code,
              product.name,
              productTypeId,
              brandId,
              qualityTypeId,
              product.description,
              parseFloat(product.weight) || null,
              parseFloat(product.volume) || null,
              parseInt(product.critical_stock_amount) || 0,
              parseInt(product.shelflife_limit) || 0,
              product.stock_tracking === 'true' || product.stock_tracking === true,
              product.bbd_tracking === 'true' || product.bbd_tracking === true,
              product.lot_tracking === 'true' || product.lot_tracking === true,
              defaultImagePath
            ]
          );
          results.created++;
        }
      } catch (error) {
        console.error(`Error processing product ${product.stock_code}:`, error);
        results.errors++;
        results.errorMessages.push(`Error for ${product.stock_code}: ${error.message}`);
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log(`Import completed: ${results.created} created, ${results.updated} updated, ${results.skipped} skipped, ${results.errors} errors`);
    return results;
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error importing products:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Parse CSV file into array of objects
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array>} - Array of objects from CSV
 */
async function parseCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Map CSV headers to our property names
        const product = {
          stock_code: data['Stock Code'] || data.stock_code,
          name: data['Product Name'] || data.name,
          product_type_code: data['Product Type'] || data.product_type_code,
          brand_name: data['Brand'] || data.brand_name,
          quality_type_name: data['Quality Type'] || data.quality_type_name,
          description: data['Description'] || data.description,
          weight: data['Weight'] || data.weight,
          volume: data['Volume'] || data.volume,
          critical_stock_amount: data['Critical Stock Amount'] || data.critical_stock_amount,
          shelflife_limit: data['Shelf Life (days)'] || data.shelflife_limit,
          stock_tracking: data['Stock Tracking'] || data.stock_tracking,
          bbd_tracking: data['BBD Tracking'] || data.bbd_tracking,
          lot_tracking: data['Lot Tracking'] || data.lot_tracking
        };
        results.push(product);
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * Export quality checks to CSV file
 * @param {string} outputFileName - Name of the output file (without .csv extension)
 * @param {object} filters - Optional filters for the query
 * @returns {Promise<string>} - Path to the exported file
 */
export async function exportQualityChecksToCSV(outputFileName: string, filters: any = {}): Promise<string> {
  const client = await pool.connect();
  try {
    console.log('Starting quality checks export...');
    
    // Build query with filters
    let query = `
      SELECT 
        qc.id as check_id,
        p.stock_code,
        p.name as product_name,
        u.name as inspector_name,
        qc.check_date,
        qc.status,
        qc.notes,
        array_agg(DISTINCT qp.name || ': ' || pr.value || ' ' || qp.unit) as parameter_readings
      FROM 
        quality_checks qc
      JOIN 
        products p ON qc.product_id = p.id
      JOIN 
        users u ON qc.inspector_id = u.id
      LEFT JOIN 
        parameter_readings pr ON qc.id = pr.quality_check_id
      LEFT JOIN 
        quality_parameters qp ON pr.parameter_id = qp.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Apply filters if provided
    if (filters.productId) {
      query += ` AND p.id = $${paramIndex}`;
      queryParams.push(filters.productId);
      paramIndex++;
    }
    
    if (filters.status) {
      query += ` AND qc.status = $${paramIndex}`;
      queryParams.push(filters.status);
      paramIndex++;
    }
    
    if (filters.startDate) {
      query += ` AND qc.check_date >= $${paramIndex}`;
      queryParams.push(filters.startDate);
      paramIndex++;
    }
    
    if (filters.endDate) {
      query += ` AND qc.check_date <= $${paramIndex}`;
      queryParams.push(filters.endDate);
      paramIndex++;
    }
    
    query += ` GROUP BY qc.id, p.stock_code, p.name, u.name, qc.check_date, qc.status, qc.notes`;
    query += ` ORDER BY qc.check_date DESC`;
    
    // Execute query
    const { rows } = await client.query(query, queryParams);
    
    console.log(`Found ${rows.length} quality checks to export.`);
    
    // Generate timestamp for the file name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${outputFileName}_${timestamp}.csv`;
    const filePath = path.join(EXPORT_DIR, fileName);
    
    // Define CSV writer
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'check_id', title: 'Check ID' },
        { id: 'stock_code', title: 'Stock Code' },
        { id: 'product_name', title: 'Product Name' },
        { id: 'inspector_name', title: 'Inspector' },
        { id: 'check_date', title: 'Check Date' },
        { id: 'status', title: 'Status' },
        { id: 'notes', title: 'Notes' },
        { id: 'parameter_readings', title: 'Parameter Readings' }
      ]
    });
    
    // Write to CSV
    await csvWriter.writeRecords(rows);
    
    console.log(`Exported ${rows.length} quality checks to ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Error exporting quality checks:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Generate a template CSV file for product import
 * @param {string} outputFileName - Name of the output file (without .csv extension)
 * @returns {Promise<string>} - Path to the generated file
 */
export async function generateProductImportTemplate(outputFileName: string): Promise<string> {
  try {
    console.log('Generating product import template...');
    
    // Generate timestamp for the file name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${outputFileName}_${timestamp}.csv`;
    const filePath = path.join(EXPORT_DIR, fileName);
    
    // Define CSV writer with headers
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'stock_code', title: 'Stock Code' },
        { id: 'name', title: 'Product Name' },
        { id: 'product_type_code', title: 'Product Type' },
        { id: 'brand_name', title: 'Brand' },
        { id: 'quality_type_name', title: 'Quality Type' },
        { id: 'description', title: 'Description' },
        { id: 'weight', title: 'Weight' },
        { id: 'volume', title: 'Volume' },
        { id: 'critical_stock_amount', title: 'Critical Stock Amount' },
        { id: 'shelflife_limit', title: 'Shelf Life (days)' },
        { id: 'stock_tracking', title: 'Stock Tracking' },
        { id: 'bbd_tracking', title: 'BBD Tracking' },
        { id: 'lot_tracking', title: 'Lot Tracking' }
      ]
    });
    
    // Write a sample row
    await csvWriter.writeRecords([
      {
        stock_code: 'ABC123',
        name: 'Sample Product',
        product_type_code: 'RM',
        brand_name: 'TSmart',
        quality_type_name: 'Premium',
        description: 'This is a sample product description',
        weight: '10.5',
        volume: '',
        critical_stock_amount: '50',
        shelflife_limit: '365',
        stock_tracking: 'true',
        bbd_tracking: 'true',
        lot_tracking: 'true'
      }
    ]);
    
    console.log(`Generated product import template at ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Error generating product import template:', error);
    throw error;
  }
}

// Run the function if this script is executed directly with arguments
if (require.main === module) {
  const [command, ...args] = process.argv.slice(2);
  
  if (command === 'export-products') {
    const outputName = args[0] || 'products';
    exportProductsToCSV(outputName)
      .then((filePath) => {
        console.log(`Export completed to ${filePath}`);
        process.exit(0);
      })
      .catch((error) => {
        console.error('Export failed:', error);
        process.exit(1);
      });
  } else if (command === 'import-products') {
    const filePath = args[0];
    const updateExisting = args[1] === 'true';
    
    if (!filePath) {
      console.error('File path is required for import');
      process.exit(1);
    }
    
    importProductsFromCSV(filePath, updateExisting)
      .then((results) => {
        console.log('Import completed:', results);
        process.exit(0);
      })
      .catch((error) => {
        console.error('Import failed:', error);
        process.exit(1);
      });
  } else if (command === 'export-quality-checks') {
    const outputName = args[0] || 'quality_checks';
    exportQualityChecksToCSV(outputName)
      .then((filePath) => {
        console.log(`Export completed to ${filePath}`);
        process.exit(0);
      })
      .catch((error) => {
        console.error('Export failed:', error);
        process.exit(1);
      });
  } else if (command === 'generate-template') {
    const outputName = args[0] || 'product_import_template';
    generateProductImportTemplate(outputName)
      .then((filePath) => {
        console.log(`Template generated at ${filePath}`);
        process.exit(0);
      })
      .catch((error) => {
        console.error('Template generation failed:', error);
        process.exit(1);
      });
  } else {
    console.log('Available commands:');
    console.log('  export-products [output-name]');
    console.log('  import-products <file-path> [update-existing]');
    console.log('  export-quality-checks [output-name]');
    console.log('  generate-template [output-name]');
    process.exit(0);
  }
}