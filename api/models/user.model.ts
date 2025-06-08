import pool from './index';

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  password: string;
  companyId: number;
  role: string;
  created_at: Date;
  failed_login_attempts: number;
  locked_until: Date | null;
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

  static async create(userData: Omit<User, 'id' | 'created_at' | 'failed_login_attempts' | 'locked_until'>): Promise<User> {
    const result = await pool.query(
      'INSERT INTO users (name, surname, email, password, companyId, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userData.name, userData.surname, userData.email, userData.password, userData.companyId, userData.role || 'user']
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
    return (result.rowCount ?? 0) > 0;
  }

  static async incrementFailedLoginAttempts(email: string): Promise<void> {
    await pool.query(
      `UPDATE users 
       SET failed_login_attempts = failed_login_attempts + 1,
           locked_until = CASE 
             WHEN failed_login_attempts >= 2 THEN NOW() + INTERVAL '15 minutes'
             ELSE locked_until
           END
       WHERE email = $1`,
      [email]
    );
  }

  static async resetFailedLoginAttempts(email: string): Promise<void> {
    await pool.query(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE email = $1',
      [email]
    );
  }

  static async isAccountLocked(email: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT locked_until FROM users WHERE email = $1',
      [email]
    );
    
    if (!result.rows[0]) return false;
    
    const lockedUntil = result.rows[0].locked_until;
    if (!lockedUntil) return false;
    
    return new Date() < new Date(lockedUntil);
  }
}