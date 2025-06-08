import pool from './index';

export interface QualityCheck {
  id: string;
  product_id: string;
  inspector_id: string;
  check_date: Date;
  status: 'pending' | 'passed' | 'failed';
  notes: string;
  created_at: Date;
}

export class QualityCheckModel {
  static async findAll(): Promise<QualityCheck[]> {
    const result = await pool.query('SELECT * FROM quality_checks ORDER BY check_date DESC');
    return result.rows;
  }

  static async findById(id: string): Promise<QualityCheck | null> {
    const result = await pool.query('SELECT * FROM quality_checks WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByProductId(productId: string): Promise<QualityCheck[]> {
    const result = await pool.query('SELECT * FROM quality_checks WHERE product_id = $1 ORDER BY check_date DESC', [productId]);
    return result.rows;
  }

  static async findByInspectorId(inspectorId: string): Promise<QualityCheck[]> {
    const result = await pool.query('SELECT * FROM quality_checks WHERE inspector_id = $1 ORDER BY check_date DESC', [inspectorId]);
    return result.rows;
  }

  static async create(checkData: Omit<QualityCheck, 'id' | 'created_at'>): Promise<QualityCheck> {
    const result = await pool.query(
      'INSERT INTO quality_checks (product_id, inspector_id, check_date, status, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [checkData.product_id, checkData.inspector_id, checkData.check_date, checkData.status, checkData.notes]
    );
    return result.rows[0];
  }

  static async update(id: string, checkData: Partial<Omit<QualityCheck, 'id' | 'created_at'>>): Promise<QualityCheck | null> {
    const keys = Object.keys(checkData);
    const values = Object.values(checkData);
    
    if (keys.length === 0) return this.findById(id);
    
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    
    const result = await pool.query(
      `UPDATE quality_checks SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM quality_checks WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}