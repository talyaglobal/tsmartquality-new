import { testUsers, testProducts, testQualityChecks } from '../fixtures/test-data';

export class MockDatabase {
  private users = new Map(testUsers.map(user => [user.id, user]));
  private products = new Map(testProducts.map(product => [product.id, product]));
  private qualityChecks = new Map(testQualityChecks.map(check => [check.id, check]));
  private nextId = 1000; // Start from high number to avoid conflicts
  
  // Generic query method
  async query(sql: string, params: any[] = []): Promise<{ rows: any[], rowCount: number }> {
    // Simple query simulation - in real tests you might use a library like sqlite3
    if (sql.includes('SELECT') && sql.includes('users')) {
      const rows = Array.from(this.users.values());
      return { rows, rowCount: rows.length };
    }
    
    if (sql.includes('SELECT') && sql.includes('products')) {
      const rows = Array.from(this.products.values());
      return { rows, rowCount: rows.length };
    }
    
    if (sql.includes('SELECT') && sql.includes('quality_checks')) {
      const rows = Array.from(this.qualityChecks.values());
      return { rows, rowCount: rows.length };
    }
    
    return { rows: [], rowCount: 0 };
  }
  
  // User operations
  async findUserById(id: number) {
    return this.users.get(id) || null;
  }
  
  async findUserByEmail(email: string) {
    return Array.from(this.users.values()).find(user => user.email === email) || null;
  }
  
  async createUser(userData: any) {
    const newUser = {
      ...userData,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, updates: any) {
    const user = this.users.get(id);
    if (!user) return null;
    
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number) {
    return this.users.delete(id);
  }
  
  // Product operations
  async findProductById(id: number) {
    return this.products.get(id) || null;
  }
  
  async findProductByCode(code: string) {
    return Array.from(this.products.values()).find(product => product.code === code) || null;
  }
  
  async createProduct(productData: any) {
    const newProduct = {
      ...productData,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.set(newProduct.id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, updates: any) {
    const product = this.products.get(id);
    if (!product) return null;
    
    const updatedProduct = {
      ...product,
      ...updates,
      updatedAt: new Date()
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number) {
    return this.products.delete(id);
  }
  
  // Quality check operations
  async findQualityCheckById(id: number) {
    return this.qualityChecks.get(id) || null;
  }
  
  async findQualityChecksByProductId(productId: number) {
    return Array.from(this.qualityChecks.values()).filter(check => check.productId === productId);
  }
  
  async createQualityCheck(checkData: any) {
    const newCheck = {
      ...checkData,
      id: this.nextId++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.qualityChecks.set(newCheck.id, newCheck);
    return newCheck;
  }
  
  async updateQualityCheck(id: number, updates: any) {
    const check = this.qualityChecks.get(id);
    if (!check) return null;
    
    const updatedCheck = {
      ...check,
      ...updates,
      updatedAt: new Date()
    };
    this.qualityChecks.set(id, updatedCheck);
    return updatedCheck;
  }
  
  async deleteQualityCheck(id: number) {
    return this.qualityChecks.delete(id);
  }
  
  // Transaction simulation
  async beginTransaction() {
    return {
      query: this.query.bind(this),
      commit: async () => Promise.resolve(),
      rollback: async () => Promise.resolve(),
      release: async () => Promise.resolve()
    };
  }
  
  // Reset data for clean tests
  reset() {
    this.users.clear();
    this.products.clear();
    this.qualityChecks.clear();
    
    testUsers.forEach(user => this.users.set(user.id, user));
    testProducts.forEach(product => this.products.set(product.id, product));
    testQualityChecks.forEach(check => this.qualityChecks.set(check.id, check));
    
    this.nextId = 1000;
  }
}

// Create singleton instance
export const mockDatabase = new MockDatabase();

// Mock the database module
export const createMockDatabase = () => {
  return {
    query: jest.fn().mockImplementation((...args) => mockDatabase.query(...args)),
    beginTransaction: jest.fn().mockImplementation(() => mockDatabase.beginTransaction()),
    end: jest.fn().mockResolvedValue(undefined)
  };
};