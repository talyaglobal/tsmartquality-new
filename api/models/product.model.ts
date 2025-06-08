import pool from './index';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  created_at: Date;
}

export class ProductModel {
  static async findAll(): Promise<Product[]> {
    const result = await pool.query('SELECT * FROM products');
    return result.rows;
  }

  static async findById(id: string): Promise<Product | null> {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findBySku(sku: string): Promise<Product | null> {
    const result = await pool.query('SELECT * FROM products WHERE sku = $1', [sku]);
    return result.rows[0] || null;
  }

  static async create(productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const result = await pool.query(
      'INSERT INTO products (name, sku, description, category) VALUES ($1, $2, $3, $4) RETURNING *',
      [productData.name, productData.sku, productData.description, productData.category]
    );
    return result.rows[0];
  }

  static async update(id: string, productData: Partial<Omit<Product, 'id' | 'created_at'>>): Promise<Product | null> {
    const keys = Object.keys(productData);
    const values = Object.values(productData);
    
    if (keys.length === 0) return this.findById(id);
    
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    
    const result = await pool.query(
      `UPDATE products SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}