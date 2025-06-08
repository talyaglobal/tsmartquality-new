import pool from './index';

export interface Product {
  id: string;
  code: string;
  name: string;
  sellerId: number;
  brandId: number;
  companyId: number;
  description?: string;
  weight?: number;
  volume?: number;
  criticalStockAmount: number;
  created_at: Date;
  created_by: string;
  updated_at?: Date;
  updated_by?: string;
  is_deleted: boolean;
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
}