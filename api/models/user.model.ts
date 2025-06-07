import pool from './index';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: Date;
}

export class UserModel {
  static async findAll(): Promise<User[]> {
    const result = await pool.query('SELECT * FROM users');
    return result.rows;
  }

  static async findById(id: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async create(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [userData.name, userData.email, userData.password]
    );
    return result.rows[0];
  }

  static async update(id: string, userData: Partial<Omit<User, 'id' | 'created_at'>>): Promise<User | null> {
    const keys = Object.keys(userData);
    const values = Object.values(userData);
    
    if (keys.length === 0) return this.findById(id);
    
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    
    const result = await pool.query(
      `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}