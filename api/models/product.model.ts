import pool from './index';

export interface Product {
  id: string;
  code: string;
  name: string;
  sellerId: number;
  brandId: number;
  productTypeId?: number;
  companyId: number;
  description?: string;
  weight?: number;
  volume?: number;
  criticalStockAmount: number;
  unitPrice?: number;
  currentStock?: number;
  specifications?: any;
  tags?: string[];
  status?: string;
  created_at: Date;
  created_by: string;
  updated_at?: Date;
  updated_by?: string;
  is_deleted: boolean;
  // Additional fields for joined queries
  seller_name?: string;
  brand_name?: string;
  product_type_name?: string;
  product_category_name?: string;
}

export class ProductModel {
  static async findAll(companyId: number, page = 1, pageSize = 20, filters?: any): Promise<{items: Product[], totalCount: number}> {
    const offset = (page - 1) * pageSize;
    let whereClause = 'WHERE is_deleted = false AND companyId = $1';
    let params: any[] = [companyId];
    let paramIndex = 2;

    if (filters?.sellerId) {
      whereClause += ` AND sellerId = $${paramIndex}`;
      params.push(filters.sellerId);
      paramIndex++;
    }

    if (filters?.brandId) {
      whereClause += ` AND brandId = $${paramIndex}`;
      params.push(filters.brandId);
      paramIndex++;
    }

    const orderBy = filters?.orderBy ? `ORDER BY ${filters.orderBy}` : 'ORDER BY created_at DESC';
    
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM products ${whereClause}`,
      params
    );

    const result = await pool.query(
      `SELECT * FROM products ${whereClause} ${orderBy} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, pageSize, offset]
    );

    return {
      items: result.rows,
      totalCount: parseInt(countResult.rows[0].count)
    };
  }

  static async findById(id: string, companyId: number): Promise<Product | null> {
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND companyId = $2 AND is_deleted = false', 
      [id, companyId]
    );
    return result.rows[0] || null;
  }

  static async findByCode(code: string, companyId: number): Promise<Product | null> {
    const result = await pool.query(
      'SELECT * FROM products WHERE code = $1 AND companyId = $2 AND is_deleted = false', 
      [code, companyId]
    );
    return result.rows[0] || null;
  }

  static async create(productData: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>): Promise<Product> {
    const result = await pool.query(
      `INSERT INTO products (code, name, sellerId, brandId, companyId, description, weight, volume, criticalStockAmount, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        productData.code, 
        productData.name, 
        productData.sellerId, 
        productData.brandId, 
        productData.companyId,
        productData.description,
        productData.weight,
        productData.volume,
        productData.criticalStockAmount,
        productData.created_by
      ]
    );
    return result.rows[0];
  }

  static async update(id: string, companyId: number, productData: Partial<Omit<Product, 'id' | 'created_at' | 'companyId' | 'is_deleted'>>): Promise<Product | null> {
    const keys = Object.keys(productData).filter(key => key !== 'companyId');
    const values = keys.map(key => (productData as any)[key]);
    
    if (keys.length === 0) return this.findById(id, companyId);
    
    const setClause = keys.map((key, i) => `${key} = $${i + 3}`).join(', ');
    
    const result = await pool.query(
      `UPDATE products SET ${setClause}, updated_at = NOW() WHERE id = $1 AND companyId = $2 AND is_deleted = false RETURNING *`,
      [id, companyId, ...values]
    );
    
    return result.rows[0] || null;
  }

  static async softDelete(id: string, companyId: number): Promise<boolean> {
    const result = await pool.query(
      'UPDATE products SET is_deleted = true, updated_at = NOW() WHERE id = $1 AND companyId = $2', 
      [id, companyId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  static async bulkUpdateStatus(ids: string[], companyId: number, updates: any): Promise<number> {
    const setClause = Object.keys(updates).map((key, i) => `${key} = $${i + 3}`).join(', ');
    const values = Object.values(updates);
    
    const result = await pool.query(
      `UPDATE products SET ${setClause}, updated_at = NOW() 
       WHERE id = ANY($1) AND companyId = $2 AND is_deleted = false`,
      [ids, companyId, ...values]
    );
    
    return result.rowCount ?? 0;
  }

  // Enhanced methods for comprehensive controller support

  static async findAllAdvanced(
    companyId: number, 
    page: number, 
    pageSize: number, 
    offset: number,
    filters: any = {}, 
    orderBy = 'created_at',
    sortDirection: 'ASC' | 'DESC' = 'DESC'
  ): Promise<{items: Product[], totalCount: number}> {
    let whereClause = 'WHERE p.is_deleted = false AND p.company_id = $1';
    let params: any[] = [companyId];
    let paramIndex = 2;

    // Add filters
    if (filters.sellerId) {
      whereClause += ` AND p.seller_id = $${paramIndex}`;
      params.push(filters.sellerId);
      paramIndex++;
    }

    if (filters.brandId) {
      whereClause += ` AND p.brand_id = $${paramIndex}`;
      params.push(filters.brandId);
      paramIndex++;
    }

    if (filters.productTypeId) {
      whereClause += ` AND p.product_type_id = $${paramIndex}`;
      params.push(filters.productTypeId);
      paramIndex++;
    }

    if (filters.status) {
      whereClause += ` AND p.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.code ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const orderClause = `ORDER BY p.${orderBy} ${sortDirection}`;
    
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM products p ${whereClause}`,
      params
    );

    const result = await pool.query(
      `SELECT p.*, s.name as seller_name, b.name as brand_name, pt.name as product_type_name
       FROM products p 
       LEFT JOIN sellers s ON p.seller_id = s.id
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN product_types pt ON p.product_type_id = pt.id
       ${whereClause} ${orderClause} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, pageSize, offset]
    );

    return {
      items: result.rows,
      totalCount: parseInt(countResult.rows[0].count)
    };
  }

  static async findByIdWithDetails(id: string, companyId: number): Promise<Product | null> {
    const result = await pool.query(
      `SELECT p.*, s.name as seller_name, b.name as brand_name, pt.name as product_type_name,
              pc.name as product_category_name
       FROM products p 
       LEFT JOIN sellers s ON p.seller_id = s.id
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN product_types pt ON p.product_type_id = pt.id
       LEFT JOIN product_category_mapping pcm ON p.id = pcm.product_id
       LEFT JOIN product_categories pc ON pcm.product_category_id = pc.id
       WHERE p.id = $1 AND p.company_id = $2 AND p.is_deleted = false`, 
      [id, companyId]
    );
    return result.rows[0] || null;
  }

  static async createAdvanced(productData: any): Promise<Product> {
    const result = await pool.query(
      `INSERT INTO products (
        code, name, seller_id, brand_id, product_type_id, company_id, 
        description, weight, volume, critical_stock_amount, unit_price, 
        current_stock, specifications, tags, status, created_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
       RETURNING *`,
      [
        productData.code, 
        productData.name, 
        productData.sellerId, 
        productData.brandId, 
        productData.productTypeId,
        productData.companyId,
        productData.description,
        productData.weight,
        productData.volume,
        productData.criticalStockAmount,
        productData.unitPrice,
        productData.currentStock,
        JSON.stringify(productData.specifications || {}),
        JSON.stringify(productData.tags || []),
        productData.status || 'active',
        productData.created_by
      ]
    );
    return result.rows[0];
  }

  // Validation methods for relationships
  static async validateSeller(sellerId: number, companyId: number): Promise<boolean> {
    const result = await pool.query(
      'SELECT id FROM sellers WHERE id = $1 AND company_id = $2 AND is_active = true',
      [sellerId, companyId]
    );
    return result.rows.length > 0;
  }

  static async validateBrand(brandId: number, companyId: number): Promise<boolean> {
    const result = await pool.query(
      'SELECT id FROM brands WHERE id = $1 AND company_id = $2 AND is_active = true',
      [brandId, companyId]
    );
    return result.rows.length > 0;
  }

  static async validateProductType(productTypeId: number, companyId: number): Promise<boolean> {
    const result = await pool.query(
      'SELECT id FROM product_types WHERE id = $1 AND company_id = $2 AND is_active = true',
      [productTypeId, companyId]
    );
    return result.rows.length > 0;
  }
}