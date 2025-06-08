import { createCanvas } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';
import { config } from '../config/config';

// Create a database connection pool
const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password
});

// Directory where images will be saved
const IMAGE_DIR = path.join(__dirname, '../../frontend/public/images/products');

// Ensure the directory exists
if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

// Color palettes for different product types
const COLOR_PALETTES = {
  RM: ['#E3D2B5', '#D0AA7B', '#C79A54', '#9C7442'], // Raw materials (earth tones)
  SF: ['#F9D949', '#FCEED1', '#D8B4E2', '#BDBDBD'], // Semi-finished (processing colors)
  FP: ['#38B6FF', '#5271FF', '#8C52FF', '#CB6CE6']  // Finished products (bright colors)
};

// Different shapes for different product types
const SHAPES = {
  RM: drawRawMaterial,
  SF: drawSemiFinished,
  FP: drawFinishedProduct
};

// Function to generate a product image
function generateProductImage(stockCode: string, productType: string, productName: string): string {
  // Create a canvas with dimensions 400x400
  const canvas = createCanvas(400, 400);
  const ctx = canvas.getContext('2d');

  // Fill background with white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 400, 400);

  // Get color palette based on product type
  const palette = COLOR_PALETTES[productType] || COLOR_PALETTES.FP;
  
  // Draw product shape based on product type
  const drawFunction = SHAPES[productType] || drawFinishedProduct;
  drawFunction(ctx, palette);

  // Add product code and name
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(stockCode, 200, 350);
  
  ctx.font = '18px Arial';
  // Truncate product name if too long
  const displayName = productName.length > 25 
    ? productName.substring(0, 22) + '...' 
    : productName;
  ctx.fillText(displayName, 200, 380);

  // Save the image
  const filename = `${stockCode.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
  const filePath = path.join(IMAGE_DIR, filename);
  const out = fs.createWriteStream(filePath);
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  
  return `/images/products/${filename}`;
}

// Draw function for raw materials
function drawRawMaterial(ctx: any, palette: string[]) {
  // Draw a series of irregular shapes to represent raw materials
  ctx.fillStyle = palette[0];
  ctx.beginPath();
  ctx.arc(150, 150, 100, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = palette[1];
  ctx.beginPath();
  ctx.arc(250, 180, 80, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = palette[2];
  ctx.beginPath();
  ctx.arc(180, 220, 70, 0, Math.PI * 2);
  ctx.fill();
  
  // Add some texture
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
    const x = Math.random() * 300 + 50;
    const y = Math.random() * 200 + 50;
    const size = Math.random() * 15 + 5;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Draw function for semi-finished products
function drawSemiFinished(ctx: any, palette: string[]) {
  // Draw a rectangle with some processing indicators
  ctx.fillStyle = palette[0];
  ctx.fillRect(100, 100, 200, 200);
  
  // Add processing lines
  ctx.strokeStyle = palette[1];
  ctx.lineWidth = 8;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(100, 120 + i * 40);
    ctx.lineTo(300, 120 + i * 40);
    ctx.stroke();
  }
  
  // Add processing dots
  ctx.fillStyle = palette[2];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      ctx.beginPath();
      ctx.arc(125 + i * 50, 125 + j * 50, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Draw function for finished products
function drawFinishedProduct(ctx: any, palette: string[]) {
  // Draw a polished product shape
  ctx.fillStyle = palette[0];
  roundRect(ctx, 100, 100, 200, 200, 20);
  
  // Add some highlights
  ctx.fillStyle = palette[1];
  roundRect(ctx, 120, 120, 160, 160, 15);
  
  // Add a product icon in the center
  ctx.fillStyle = palette[2];
  ctx.beginPath();
  ctx.arc(200, 200, 50, 0, Math.PI * 2);
  ctx.fill();
  
  // Add a highlight
  ctx.fillStyle = palette[3];
  ctx.beginPath();
  ctx.arc(180, 180, 15, 0, Math.PI * 2);
  ctx.fill();
}

// Helper function for drawing rounded rectangles
function roundRect(ctx: any, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

// Function to generate images for all products
async function generateAllProductImages() {
  try {
    console.log('Starting product image generation...');
    
    // Query all products
    const { rows } = await pool.query(`
      SELECT p.stock_code, p.name, pt.code as product_type_code
      FROM products p
      JOIN product_types pt ON p.product_type_id = pt.id
    `);
    
    console.log(`Found ${rows.length} products to generate images for.`);
    
    // Generate an image for each product
    const imageUpdates = [];
    for (const product of rows) {
      const imagePath = generateProductImage(
        product.stock_code,
        product.product_type_code,
        product.name
      );
      
      console.log(`Generated image for ${product.stock_code}: ${imagePath}`);
      
      // Add to updates array
      imageUpdates.push({
        stock_code: product.stock_code,
        image_path: imagePath
      });
    }
    
    // Update the database with image paths
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const update of imageUpdates) {
        await client.query(
          `UPDATE products SET image_path = $1 WHERE stock_code = $2`,
          [update.image_path, update.stock_code]
        );
      }
      
      await client.query('COMMIT');
      console.log(`Updated ${imageUpdates.length} products with image paths in the database.`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating image paths in database:', error);
      throw error;
    } finally {
      client.release();
    }
    
    console.log('Product image generation completed successfully.');
  } catch (error) {
    console.error('Error generating product images:', error);
    throw error;
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  generateAllProductImages()
    .then(() => {
      console.log('Image generation process finished.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Image generation process failed:', error);
      process.exit(1);
    });
}

export default generateAllProductImages;