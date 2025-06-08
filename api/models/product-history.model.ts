import pool from './index';

export interface ProductHistory {
  id: string;
  productId: string;
  fieldChanged: string;
  oldValue: string | null;
  newValue: string | null;
  changedByUserId: string;
  changeDate: Date;
}

export class ProductHistoryModel {
  static async create(historyData: Omit<ProductHistory, 'id' | 'changeDate'>): Promise<ProductHistory> {
    const result = await pool.query(
      `INSERT INTO product_history (productId, fieldChanged, oldValue, newValue, changedByUserId) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        historyData.productId,
        historyData.fieldChanged,
        historyData.oldValue,
        historyData.newValue,
        historyData.changedByUserId
      ]
    );
    return result.rows[0];
  }

  static async findByProductId(productId: string): Promise<ProductHistory[]> {
    const result = await pool.query(
      'SELECT * FROM product_history WHERE productId = $1 ORDER BY changeDate DESC',
      [productId]
    );
    return result.rows;
  }

  static async logChanges(
    productId: string, 
    oldProduct: any, 
    newProduct: any, 
    changedByUserId: string
  ): Promise<void> {
    const fieldsToTrack = ['code', 'name', 'sellerId', 'brandId', 'description', 'weight', 'volume', 'criticalStockAmount'];
    
    for (const field of fieldsToTrack) {
      if (oldProduct[field] !== newProduct[field]) {
        await this.create({
          productId,
          fieldChanged: field,
          oldValue: oldProduct[field] ? String(oldProduct[field]) : null,
          newValue: newProduct[field] ? String(newProduct[field]) : null,
          changedByUserId
        });
      }
    }
  }
}