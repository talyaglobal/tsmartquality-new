import pool from './index';

export interface QualityCheck {
  id: string;
  product_id: string;
  inspector_id: string;
  check_type: string;
  status: string;
  overall_grade?: string;
  score?: number;
  check_date: Date;
  notes?: string;
  measurements?: any;
  attachments?: string[];
  company_id: number;
  created_at: Date;
  updated_at?: Date;
  // Additional fields for joined queries
  product_name?: string;
  product_code?: string;
  inspector_name?: string;
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

  // Enhanced method for comprehensive controller support
  static async findAllAdvanced(
    companyId: number,
    page: number,
    pageSize: number,
    offset: number,
    filters: any = {},
    orderBy = 'created_at',
    sortDirection: 'ASC' | 'DESC' = 'DESC'
  ): Promise<{items: QualityCheck[], totalCount: number}> {
    let whereClause = 'WHERE qc.company_id = $1';
    let params: any[] = [companyId];
    let paramIndex = 2;

    // Add filters
    if (filters.productId) {
      whereClause += ` AND qc.product_id = $${paramIndex}`;
      params.push(filters.productId);
      paramIndex++;
    }

    if (filters.inspectorId) {
      whereClause += ` AND qc.inspector_id = $${paramIndex}`;
      params.push(filters.inspectorId);
      paramIndex++;
    }

    if (filters.status) {
      whereClause += ` AND qc.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.checkType) {
      whereClause += ` AND qc.check_type = $${paramIndex}`;
      params.push(filters.checkType);
      paramIndex++;
    }

    if (filters.overallGrade) {
      whereClause += ` AND qc.overall_grade = $${paramIndex}`;
      params.push(filters.overallGrade);
      paramIndex++;
    }

    if (filters.dateFrom) {
      whereClause += ` AND qc.check_date >= $${paramIndex}`;
      params.push(filters.dateFrom);
      paramIndex++;
    }

    if (filters.dateTo) {
      whereClause += ` AND qc.check_date <= $${paramIndex}`;
      params.push(filters.dateTo);
      paramIndex++;
    }

    const orderClause = `ORDER BY qc.${orderBy} ${sortDirection}`;
    
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM quality_checks qc ${whereClause}`,
      params
    );

    const result = await pool.query(
      `SELECT qc.*, p.name as product_name, p.code as product_code,
              u.name as inspector_name
       FROM quality_checks qc
       LEFT JOIN products p ON qc.product_id = p.id
       LEFT JOIN users u ON qc.inspector_id = u.id
       ${whereClause} ${orderClause} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, pageSize, offset]
    );

    return {
      items: result.rows,
      totalCount: parseInt(countResult.rows[0].count)
    };
  }

  static async createAdvanced(checkData: any): Promise<QualityCheck> {
    const result = await pool.query(
      `INSERT INTO quality_checks (
        product_id, inspector_id, check_type, status, overall_grade, score,
        check_date, notes, measurements, attachments, company_id
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        checkData.product_id,
        checkData.inspector_id,
        checkData.check_type,
        checkData.status,
        checkData.overall_grade,
        checkData.score,
        checkData.check_date,
        checkData.notes,
        JSON.stringify(checkData.measurements || {}),
        JSON.stringify(checkData.attachments || []),
        checkData.company_id
      ]
    );
    return result.rows[0];
  }
}