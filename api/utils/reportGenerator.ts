import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as PDFDocument from 'pdfkit';
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
const REPORTS_DIR = path.join(__dirname, '../../reports');

// Ensure directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

/**
 * Report types
 */
export enum ReportType {
  PRODUCT_QUALITY_SUMMARY = 'product_quality_summary',
  QUALITY_CHECK_DETAILS = 'quality_check_details',
  INVENTORY_STATUS = 'inventory_status',
  EXPIRATION_ALERT = 'expiration_alert'
}

/**
 * Generate a quality report
 * @param {ReportType} reportType - Type of report to generate
 * @param {object} params - Parameters for the report
 * @returns {Promise<string>} - Path to the generated PDF file
 */
export async function generateReport(reportType: ReportType, params: any = {}): Promise<string> {
  console.log(`Generating ${reportType} report...`);
  
  // Generate timestamp for the file name
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${reportType}_${timestamp}.pdf`;
  const filePath = path.join(REPORTS_DIR, fileName);
  
  // Create a new PDF document
  const doc = new PDFDocument({
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    size: 'A4'
  });
  
  // Pipe output to file
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);
  
  // Add report header
  addReportHeader(doc, reportType);
  
  // Generate the specific report based on type
  switch (reportType) {
    case ReportType.PRODUCT_QUALITY_SUMMARY:
      await generateProductQualitySummary(doc, params);
      break;
    case ReportType.QUALITY_CHECK_DETAILS:
      await generateQualityCheckDetails(doc, params);
      break;
    case ReportType.INVENTORY_STATUS:
      await generateInventoryStatus(doc, params);
      break;
    case ReportType.EXPIRATION_ALERT:
      await generateExpirationAlert(doc, params);
      break;
    default:
      throw new Error(`Unknown report type: ${reportType}`);
  }
  
  // Add report footer
  addReportFooter(doc);
  
  // Finalize the PDF
  doc.end();
  
  // Return a promise that resolves when the file is written
  return new Promise((resolve, reject) => {
    stream.on('finish', () => {
      console.log(`Report generated: ${filePath}`);
      resolve(filePath);
    });
    stream.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Add a standard header to the report
 * @param {PDFDocument} doc - PDF document
 * @param {ReportType} reportType - Type of report
 */
function addReportHeader(doc: PDFKit.PDFDocument, reportType: ReportType): void {
  // Add logo (placeholder - would be replaced with actual logo)
  // doc.image('path/to/logo.png', 50, 45, { width: 50 });
  
  // Add title
  doc.fontSize(24)
     .fillColor('#003366')
     .text('TSmart Quality Management', { align: 'center' });
  
  doc.moveDown(0.5);
  
  // Add report type
  let reportTitle = '';
  switch (reportType) {
    case ReportType.PRODUCT_QUALITY_SUMMARY:
      reportTitle = 'Product Quality Summary Report';
      break;
    case ReportType.QUALITY_CHECK_DETAILS:
      reportTitle = 'Quality Check Details Report';
      break;
    case ReportType.INVENTORY_STATUS:
      reportTitle = 'Inventory Status Report';
      break;
    case ReportType.EXPIRATION_ALERT:
      reportTitle = 'Expiration Alert Report';
      break;
  }
  
  doc.fontSize(18)
     .fillColor('#333333')
     .text(reportTitle, { align: 'center' });
  
  doc.moveDown(0.5);
  
  // Add date
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  doc.fontSize(12)
     .fillColor('#666666')
     .text(`Generated on: ${today}`, { align: 'center' });
  
  doc.moveDown(1);
  
  // Add a horizontal line
  doc.moveTo(50, doc.y)
     .lineTo(doc.page.width - 50, doc.y)
     .strokeColor('#CCCCCC')
     .stroke();
  
  doc.moveDown(1);
}

/**
 * Add a standard footer to the report
 * @param {PDFDocument} doc - PDF document
 */
function addReportFooter(doc: PDFKit.PDFDocument): void {
  const pageCount = doc.bufferedPageRange().count;
  
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    
    // Save the current position
    const originalY = doc.y;
    
    // Move to the bottom of the page
    doc.moveTo(50, doc.page.height - 50)
       .lineTo(doc.page.width - 50, doc.page.height - 50)
       .strokeColor('#CCCCCC')
       .stroke();
    
    doc.fontSize(10)
       .fillColor('#666666')
       .text(
         'TSmart Quality Management System', 
         50, 
         doc.page.height - 40, 
         { align: 'left', width: doc.page.width - 100 }
       );
    
    doc.fontSize(10)
       .fillColor('#666666')
       .text(
         `Page ${i + 1} of ${pageCount}`, 
         50, 
         doc.page.height - 40, 
         { align: 'right', width: doc.page.width - 100 }
       );
    
    // Restore the original position
    doc.y = originalY;
  }
}

/**
 * Generate a product quality summary report
 * @param {PDFDocument} doc - PDF document
 * @param {object} params - Report parameters
 */
async function generateProductQualitySummary(doc: PDFKit.PDFDocument, params: any): Promise<void> {
  const client = await pool.connect();
  
  try {
    // Get product details
    let productQuery = `
      SELECT 
        p.id,
        p.stock_code,
        p.name,
        pt.name AS product_type,
        b.name AS brand,
        qt.name AS quality_type
      FROM 
        products p
      JOIN 
        product_types pt ON p.product_type_id = pt.id
      JOIN 
        brands b ON p.brand_id = b.id
      JOIN 
        quality_types qt ON p.quality_type_id = qt.id
    `;
    
    const queryParams = [];
    
    if (params.productId) {
      productQuery += ' WHERE p.id = $1';
      queryParams.push(params.productId);
    } else if (params.productTypeId) {
      productQuery += ' WHERE p.product_type_id = $1';
      queryParams.push(params.productTypeId);
    }
    
    productQuery += ' ORDER BY p.name';
    
    const { rows: products } = await client.query(productQuery, queryParams);
    
    if (products.length === 0) {
      doc.fontSize(14)
         .fillColor('#FF0000')
         .text('No products found with the specified criteria.', { align: 'center' });
      return;
    }
    
    // Add report description
    doc.fontSize(12)
       .fillColor('#333333')
       .text('This report provides a summary of quality check results for products.', { align: 'left' });
    
    doc.moveDown(1);
    
    // Add date range if provided
    if (params.startDate && params.endDate) {
      const startDate = new Date(params.startDate).toLocaleDateString('en-US');
      const endDate = new Date(params.endDate).toLocaleDateString('en-US');
      
      doc.fontSize(12)
         .fillColor('#333333')
         .text(`Period: ${startDate} to ${endDate}`, { align: 'left' });
      
      doc.moveDown(1);
    }
    
    // Process each product
    for (const product of products) {
      // Get quality check summary for this product
      let query = `
        SELECT 
          COUNT(*) AS total_checks,
          SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) AS passed_checks,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_checks,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_checks
        FROM 
          quality_checks
        WHERE 
          product_id = $1
      `;
      
      const queryParams = [product.id];
      
      if (params.startDate) {
        query += ' AND check_date >= $2';
        queryParams.push(params.startDate);
      }
      
      if (params.endDate) {
        query += ` AND check_date <= $${queryParams.length + 1}`;
        queryParams.push(params.endDate);
      }
      
      const { rows: summaryRows } = await client.query(query, queryParams);
      const summary = summaryRows[0];
      
      // Get parameter summary
      const paramQuery = `
        SELECT 
          qp.name AS parameter_name,
          qp.unit,
          COUNT(*) AS total_readings,
          SUM(CASE WHEN pr.is_within_spec THEN 1 ELSE 0 END) AS within_spec,
          AVG(pr.value) AS average_value,
          MIN(pr.value) AS min_value,
          MAX(pr.value) AS max_value
        FROM 
          quality_checks qc
        JOIN 
          parameter_readings pr ON qc.id = pr.quality_check_id
        JOIN 
          quality_parameters qp ON pr.parameter_id = qp.id
        WHERE 
          qc.product_id = $1
        GROUP BY 
          qp.name, qp.unit
      `;
      
      const { rows: parameters } = await client.query(paramQuery, [product.id]);
      
      // Add product header
      doc.fontSize(16)
         .fillColor('#003366')
         .text(`${product.stock_code} - ${product.name}`, { align: 'left' });
      
      doc.moveDown(0.5);
      
      // Add product details
      doc.fontSize(12)
         .fillColor('#666666')
         .text(`Type: ${product.product_type} | Brand: ${product.brand} | Quality: ${product.quality_type}`, { align: 'left' });
      
      doc.moveDown(0.5);
      
      // Add quality check summary
      const totalChecks = parseInt(summary.total_checks) || 0;
      const passedChecks = parseInt(summary.passed_checks) || 0;
      const failedChecks = parseInt(summary.failed_checks) || 0;
      const pendingChecks = parseInt(summary.pending_checks) || 0;
      
      const passRate = totalChecks > 0 ? ((passedChecks / totalChecks) * 100).toFixed(1) : '0.0';
      
      doc.fontSize(14)
         .fillColor('#333333')
         .text('Quality Check Summary:', { align: 'left' });
      
      doc.moveDown(0.5);
      
      // Create a table for the summary
      const summaryTable = {
        headers: ['Total Checks', 'Passed', 'Failed', 'Pending', 'Pass Rate'],
        rows: [[
          totalChecks.toString(),
          passedChecks.toString(),
          failedChecks.toString(),
          pendingChecks.toString(),
          `${passRate}%`
        ]]
      };
      
      drawTable(doc, summaryTable);
      
      doc.moveDown(1);
      
      // Add parameter summary if there are parameters
      if (parameters.length > 0) {
        doc.fontSize(14)
           .fillColor('#333333')
           .text('Parameter Summary:', { align: 'left' });
        
        doc.moveDown(0.5);
        
        // Create a table for parameters
        const paramTable = {
          headers: ['Parameter', 'Unit', 'Readings', 'Within Spec', 'Average', 'Min', 'Max'],
          rows: parameters.map(param => [
            param.parameter_name,
            param.unit,
            param.total_readings.toString(),
            `${((param.within_spec / param.total_readings) * 100).toFixed(1)}%`,
            param.average_value.toFixed(2),
            param.min_value.toFixed(2),
            param.max_value.toFixed(2)
          ])
        };
        
        drawTable(doc, paramTable);
      } else {
        doc.fontSize(12)
           .fillColor('#666666')
           .text('No parameter readings found for this product.', { align: 'left' });
      }
      
      // Add a separator
      doc.moveDown(1);
      doc.moveTo(50, doc.y)
         .lineTo(doc.page.width - 50, doc.y)
         .strokeColor('#CCCCCC')
         .stroke();
      doc.moveDown(1);
      
      // Add a page break if this is not the last product and we're close to the bottom
      if (product !== products[products.length - 1] && doc.y > doc.page.height - 200) {
        doc.addPage();
      }
    }
    
  } finally {
    client.release();
  }
}

/**
 * Generate a quality check details report
 * @param {PDFDocument} doc - PDF document
 * @param {object} params - Report parameters
 */
async function generateQualityCheckDetails(doc: PDFKit.PDFDocument, params: any): Promise<void> {
  const client = await pool.connect();
  
  try {
    // Validate parameters
    if (!params.checkId) {
      doc.fontSize(14)
         .fillColor('#FF0000')
         .text('Error: Quality check ID is required for this report.', { align: 'center' });
      return;
    }
    
    // Get quality check details
    const checkQuery = `
      SELECT 
        qc.id,
        qc.check_date,
        qc.status,
        qc.notes,
        p.stock_code,
        p.name AS product_name,
        u.name AS inspector_name
      FROM 
        quality_checks qc
      JOIN 
        products p ON qc.product_id = p.id
      JOIN 
        users u ON qc.inspector_id = u.id
      WHERE 
        qc.id = $1
    `;
    
    const { rows: checks } = await client.query(checkQuery, [params.checkId]);
    
    if (checks.length === 0) {
      doc.fontSize(14)
         .fillColor('#FF0000')
         .text('No quality check found with the specified ID.', { align: 'center' });
      return;
    }
    
    const check = checks[0];
    
    // Get parameter readings
    const readingsQuery = `
      SELECT 
        qp.name AS parameter_name,
        qp.unit,
        pr.value,
        pr.is_within_spec,
        qp.min_value,
        qp.max_value,
        qp.target_value
      FROM 
        parameter_readings pr
      JOIN 
        quality_parameters qp ON pr.parameter_id = qp.id
      WHERE 
        pr.quality_check_id = $1
      ORDER BY 
        qp.name
    `;
    
    const { rows: readings } = await client.query(readingsQuery, [params.checkId]);
    
    // Add report content
    doc.fontSize(16)
       .fillColor('#003366')
       .text(`Quality Check #${check.id}`, { align: 'left' });
    
    doc.moveDown(0.5);
    
    // Add check details
    const checkDate = new Date(check.check_date).toLocaleString('en-US');
    
    doc.fontSize(12)
       .fillColor('#333333')
       .text(`Product: ${check.stock_code} - ${check.product_name}`, { align: 'left' });
    
    doc.fontSize(12)
       .fillColor('#333333')
       .text(`Inspector: ${check.inspector_name}`, { align: 'left' });
    
    doc.fontSize(12)
       .fillColor('#333333')
       .text(`Date: ${checkDate}`, { align: 'left' });
    
    doc.fontSize(12)
       .fillColor('#333333')
       .text(`Status: ${check.status.toUpperCase()}`, { align: 'left' });
    
    if (check.notes) {
      doc.fontSize(12)
         .fillColor('#333333')
         .text(`Notes: ${check.notes}`, { align: 'left' });
    }
    
    doc.moveDown(1);
    
    // Add parameter readings
    if (readings.length > 0) {
      doc.fontSize(14)
         .fillColor('#003366')
         .text('Parameter Readings:', { align: 'left' });
      
      doc.moveDown(0.5);
      
      // Create a table for the readings
      const readingsTable = {
        headers: ['Parameter', 'Value', 'Unit', 'Target', 'Min-Max', 'Status'],
        rows: readings.map(reading => [
          reading.parameter_name,
          reading.value.toString(),
          reading.unit,
          reading.target_value.toString(),
          `${reading.min_value} - ${reading.max_value}`,
          reading.is_within_spec ? 'PASS' : 'FAIL'
        ])
      };
      
      drawTable(doc, readingsTable);
      
      // Add a visual representation of the results
      doc.moveDown(1);
      doc.fontSize(14)
         .fillColor('#003366')
         .text('Visual Summary:', { align: 'left' });
      
      doc.moveDown(0.5);
      
      // Draw a horizontal bar for each parameter
      for (const reading of readings) {
        const paramName = reading.parameter_name;
        const value = parseFloat(reading.value);
        const min = parseFloat(reading.min_value);
        const max = parseFloat(reading.max_value);
        const target = parseFloat(reading.target_value);
        
        // Draw parameter name
        doc.fontSize(10)
           .fillColor('#333333')
           .text(`${paramName} (${reading.unit}):`, { align: 'left', continued: true })
           .fillColor(reading.is_within_spec ? '#008800' : '#CC0000')
           .text(` ${value.toFixed(2)}`, { align: 'left' });
        
        // Draw bar background
        const barX = 100;
        const barY = doc.y + 5;
        const barWidth = 300;
        const barHeight = 15;
        
        doc.rect(barX, barY, barWidth, barHeight)
           .fillAndStroke('#F0F0F0', '#CCCCCC');
        
        // Calculate the range and position
        const range = max - min;
        const normalizedWidth = Math.max(0, Math.min(1, (value - min) / range)) * barWidth;
        
        // Draw the value bar
        doc.rect(barX, barY, normalizedWidth, barHeight)
           .fill(reading.is_within_spec ? '#88CC88' : '#CC8888');
        
        // Draw min, max, and target markers
        doc.fontSize(8)
           .fillColor('#666666')
           .text(`${min.toFixed(1)}`, barX, barY + barHeight + 2, { align: 'left', width: 50 })
           .text(`${max.toFixed(1)}`, barX + barWidth - 50, barY + barHeight + 2, { align: 'right', width: 50 });
        
        // Draw target marker
        const targetX = barX + ((target - min) / range) * barWidth;
        doc.moveTo(targetX, barY - 3)
           .lineTo(targetX, barY + barHeight + 3)
           .strokeColor('#333333')
           .stroke();
        
        doc.moveDown(1.5);
      }
    } else {
      doc.fontSize(12)
         .fillColor('#666666')
         .text('No parameter readings found for this quality check.', { align: 'left' });
    }
    
  } finally {
    client.release();
  }
}

/**
 * Generate an inventory status report
 * @param {PDFDocument} doc - PDF document
 * @param {object} params - Report parameters
 */
async function generateInventoryStatus(doc: PDFKit.PDFDocument, params: any): Promise<void> {
  const client = await pool.connect();
  
  try {
    // Build query with filters
    let query = `
      SELECT 
        p.stock_code,
        p.name,
        pt.name AS product_type,
        SUM(i.quantity) AS total_quantity,
        MIN(i.best_before_date) AS earliest_expiry,
        COUNT(i.id) AS batch_count
      FROM 
        products p
      JOIN 
        product_types pt ON p.product_type_id = pt.id
      LEFT JOIN 
        inventory i ON p.id = i.product_id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Apply filters if provided
    if (params.productType) {
      query += ` AND pt.code = $${paramIndex}`;
      queryParams.push(params.productType);
      paramIndex++;
    }
    
    if (params.lowStock) {
      query += ` AND p.critical_stock_amount > (SELECT COALESCE(SUM(quantity), 0) FROM inventory WHERE product_id = p.id)`;
    }
    
    query += ` GROUP BY p.id, p.stock_code, p.name, pt.name`;
    query += ` ORDER BY p.name`;
    
    // Execute query
    const { rows: products } = await client.query(query, queryParams);
    
    if (products.length === 0) {
      doc.fontSize(14)
         .fillColor('#FF0000')
         .text('No products found with the specified criteria.', { align: 'center' });
      return;
    }
    
    // Add report description
    doc.fontSize(12)
       .fillColor('#333333')
       .text('This report provides a summary of inventory status for products.', { align: 'left' });
    
    doc.moveDown(1);
    
    // Create a table for the inventory summary
    const inventoryTable = {
      headers: ['Stock Code', 'Product Name', 'Type', 'Total Quantity', 'Batches', 'Earliest Expiry'],
      rows: products.map(product => [
        product.stock_code,
        product.name,
        product.product_type,
        (product.total_quantity || '0').toString(),
        product.batch_count.toString(),
        product.earliest_expiry ? new Date(product.earliest_expiry).toLocaleDateString('en-US') : 'N/A'
      ])
    };
    
    drawTable(doc, inventoryTable);
    
    doc.moveDown(1);
    
    // Add summary statistics
    const totalProducts = products.length;
    const productsWithInventory = products.filter(p => p.total_quantity > 0).length;
    const totalInventory = products.reduce((sum, p) => sum + (parseFloat(p.total_quantity) || 0), 0);
    
    doc.fontSize(14)
       .fillColor('#003366')
       .text('Inventory Summary:', { align: 'left' });
    
    doc.moveDown(0.5);
    
    doc.fontSize(12)
       .fillColor('#333333')
       .text(`Total Products: ${totalProducts}`, { align: 'left' });
    
    doc.fontSize(12)
       .fillColor('#333333')
       .text(`Products with Inventory: ${productsWithInventory}`, { align: 'left' });
    
    doc.fontSize(12)
       .fillColor('#333333')
       .text(`Total Inventory Quantity: ${totalInventory.toFixed(2)}`, { align: 'left' });
    
  } finally {
    client.release();
  }
}

/**
 * Generate an expiration alert report
 * @param {PDFDocument} doc - PDF document
 * @param {object} params - Report parameters
 */
async function generateExpirationAlert(doc: PDFKit.PDFDocument, params: any): Promise<void> {
  const client = await pool.connect();
  
  try {
    // Default to 30 days if not specified
    const daysThreshold = params.daysThreshold || 30;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysThreshold);
    
    // Build query for products nearing expiration
    const query = `
      SELECT 
        p.stock_code,
        p.name,
        i.lot_number,
        i.production_date,
        i.best_before_date,
        i.quantity,
        i.location,
        (i.best_before_date - CURRENT_TIMESTAMP) AS days_until_expiry
      FROM 
        inventory i
      JOIN 
        products p ON i.product_id = p.id
      WHERE 
        i.best_before_date <= $1
        AND i.best_before_date >= CURRENT_TIMESTAMP
      ORDER BY 
        i.best_before_date ASC
    `;
    
    // Execute query
    const { rows: expiringItems } = await client.query(query, [targetDate.toISOString()]);
    
    if (expiringItems.length === 0) {
      doc.fontSize(14)
         .fillColor('#008800')
         .text(`No products expiring within the next ${daysThreshold} days.`, { align: 'center' });
      return;
    }
    
    // Add report description
    doc.fontSize(12)
       .fillColor('#333333')
       .text(`This report lists inventory items that will expire within the next ${daysThreshold} days.`, { align: 'left' });
    
    doc.moveDown(1);
    
    // Create a table for the expiring items
    const expiryTable = {
      headers: ['Stock Code', 'Product Name', 'Lot Number', 'Quantity', 'Expiry Date', 'Days Left', 'Location'],
      rows: expiringItems.map(item => {
        const expiryDate = new Date(item.best_before_date).toLocaleDateString('en-US');
        const daysLeft = Math.ceil(item.days_until_expiry / (1000 * 60 * 60 * 24));
        
        return [
          item.stock_code,
          item.name,
          item.lot_number,
          item.quantity.toString(),
          expiryDate,
          daysLeft.toString(),
          item.location || 'N/A'
        ];
      })
    };
    
    drawTable(doc, expiryTable);
    
    doc.moveDown(1);
    
    // Add summary statistics
    const totalItems = expiringItems.length;
    const totalQuantity = expiringItems.reduce((sum, item) => sum + parseFloat(item.quantity), 0);
    
    const itemsByTimeframe = {
      immediate: expiringItems.filter(item => {
        const daysLeft = Math.ceil(item.days_until_expiry / (1000 * 60 * 60 * 24));
        return daysLeft <= 7;
      }).length,
      soon: expiringItems.filter(item => {
        const daysLeft = Math.ceil(item.days_until_expiry / (1000 * 60 * 60 * 24));
        return daysLeft > 7 && daysLeft <= 14;
      }).length,
      upcoming: expiringItems.filter(item => {
        const daysLeft = Math.ceil(item.days_until_expiry / (1000 * 60 * 60 * 24));
        return daysLeft > 14;
      }).length
    };
    
    doc.fontSize(14)
       .fillColor('#003366')
       .text('Expiration Summary:', { align: 'left' });
    
    doc.moveDown(0.5);
    
    doc.fontSize(12)
       .fillColor('#333333')
       .text(`Total Expiring Items: ${totalItems}`, { align: 'left' });
    
    doc.fontSize(12)
       .fillColor('#333333')
       .text(`Total Quantity: ${totalQuantity.toFixed(2)}`, { align: 'left' });
    
    doc.fontSize(12)
       .fillColor('#CC0000')
       .text(`Expiring within 7 days: ${itemsByTimeframe.immediate}`, { align: 'left' });
    
    doc.fontSize(12)
       .fillColor('#FF6600')
       .text(`Expiring in 8-14 days: ${itemsByTimeframe.soon}`, { align: 'left' });
    
    doc.fontSize(12)
       .fillColor('#FFCC00')
       .text(`Expiring in 15-${daysThreshold} days: ${itemsByTimeframe.upcoming}`, { align: 'left' });
    
  } finally {
    client.release();
  }
}

/**
 * Draw a table in the PDF document
 * @param {PDFDocument} doc - PDF document
 * @param {object} table - Table definition with headers and rows
 */
function drawTable(doc: PDFKit.PDFDocument, table: { headers: string[], rows: string[][] }): void {
  const { headers, rows } = table;
  
  // Calculate column widths based on content
  const tableWidth = doc.page.width - 100;
  const numColumns = headers.length;
  const columnWidth = tableWidth / numColumns;
  
  // Draw table header
  doc.fontSize(10)
     .fillColor('#FFFFFF');
  
  // Draw header background
  doc.rect(50, doc.y, tableWidth, 20)
     .fill('#003366');
  
  // Draw header text
  headers.forEach((header, i) => {
    doc.fillColor('#FFFFFF')
       .text(
         header,
         50 + (i * columnWidth),
         doc.y - 20 + 5,
         { width: columnWidth, align: 'center' }
       );
  });
  
  doc.moveDown(0.5);
  
  // Draw rows
  let rowBackgroundColor = '#F9F9F9';
  
  rows.forEach((row, rowIndex) => {
    // Draw row background
    doc.rect(50, doc.y, tableWidth, 20)
       .fill(rowIndex % 2 === 0 ? rowBackgroundColor : '#FFFFFF');
    
    // Draw row text
    row.forEach((cell, i) => {
      doc.fillColor('#333333')
         .text(
           cell,
           50 + (i * columnWidth),
           doc.y - 20 + 5,
           { width: columnWidth, align: 'center' }
         );
    });
    
    doc.moveDown(0.5);
  });
}

// Run the function if this script is executed directly with arguments
if (require.main === module) {
  const [reportType, ...args] = process.argv.slice(2);
  
  // Parse arguments into params object
  const params: any = {};
  for (let i = 0; i < args.length; i += 2) {
    if (args[i] && args[i + 1]) {
      params[args[i].replace('--', '')] = args[i + 1];
    }
  }
  
  if (Object.values(ReportType).includes(reportType as ReportType)) {
    generateReport(reportType as ReportType, params)
      .then((filePath) => {
        console.log(`Report generated at ${filePath}`);
        process.exit(0);
      })
      .catch((error) => {
        console.error('Error generating report:', error);
        process.exit(1);
      });
  } else {
    console.log('Available report types:');
    Object.values(ReportType).forEach(type => {
      console.log(`  ${type}`);
    });
    console.log('\nUsage:');
    console.log('  node reportGenerator.js <report-type> [--param1 value1] [--param2 value2]');
    console.log('\nExample:');
    console.log('  node reportGenerator.js product_quality_summary --productId 1');
    process.exit(0);
  }
}