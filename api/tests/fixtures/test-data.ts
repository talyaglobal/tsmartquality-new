export const testUsers = [
  {
    id: 1,
    email: 'admin@example.com',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
    passwordHash: '$2a$10$hashedpassword',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 2,
    email: 'user@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    isActive: true,
    passwordHash: '$2a$10$hashedpassword',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: 3,
    email: 'inactive@example.com',
    username: 'inactive',
    firstName: 'Inactive',
    lastName: 'User',
    role: 'user',
    isActive: false,
    passwordHash: '$2a$10$hashedpassword',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
];

export const testProducts = [
  {
    id: 1,
    code: 'PROD001',
    name: 'Test Product 1',
    description: 'First test product',
    sellerId: 1,
    categoryId: 1,
    price: 99.99,
    isActive: true,
    specifications: { weight: '1kg', color: 'blue' },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 2,
    code: 'PROD002',
    name: 'Test Product 2',
    description: 'Second test product',
    sellerId: 2,
    categoryId: 2,
    price: 149.99,
    isActive: true,
    specifications: { weight: '2kg', color: 'red' },
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: 3,
    code: 'PROD003',
    name: 'Inactive Product',
    description: 'Inactive test product',
    sellerId: 1,
    categoryId: 1,
    price: 199.99,
    isActive: false,
    specifications: { weight: '0.5kg', color: 'green' },
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
];

export const testQualityChecks = [
  {
    id: 1,
    productId: 1,
    checkerId: 2,
    status: 'pending',
    notes: 'Initial quality check',
    scheduledDate: new Date('2024-01-10'),
    checkedDate: null,
    rating: null,
    issues: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 2,
    productId: 1,
    checkerId: 2,
    status: 'completed',
    notes: 'Quality check completed successfully',
    scheduledDate: new Date('2024-01-05'),
    checkedDate: new Date('2024-01-05'),
    rating: 4.5,
    issues: [],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-05')
  },
  {
    id: 3,
    productId: 2,
    checkerId: 2,
    status: 'failed',
    notes: 'Quality check failed - issues found',
    scheduledDate: new Date('2024-01-06'),
    checkedDate: new Date('2024-01-06'),
    rating: 2.0,
    issues: ['packaging_damage', 'color_mismatch'],
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-06')
  }
];

export const testCategories = [
  {
    id: 1,
    name: 'Electronics',
    description: 'Electronic products',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 2,
    name: 'Clothing',
    description: 'Clothing and apparel',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export const validProductData = {
  code: 'NEW001',
  name: 'New Test Product',
  description: 'A new product for testing',
  sellerId: 1,
  categoryId: 1,
  price: 299.99,
  specifications: {
    weight: '1.5kg',
    dimensions: '10x10x5cm',
    material: 'plastic'
  }
};

export const invalidProductData = {
  code: '', // Invalid: empty code
  name: '', // Invalid: empty name
  description: 'Valid description',
  sellerId: -1, // Invalid: negative ID
  categoryId: 0, // Invalid: zero ID
  price: -50, // Invalid: negative price
  specifications: 'invalid' // Invalid: should be object
};

export const validUserData = {
  email: 'newuser@example.com',
  username: 'newuser',
  firstName: 'New',
  lastName: 'User',
  password: 'SecurePassword123!',
  role: 'user'
};

export const invalidUserData = {
  email: 'invalid-email', // Invalid email format
  username: '', // Empty username
  firstName: '', // Empty first name
  lastName: '', // Empty last name
  password: '123', // Too short password
  role: 'invalid-role' // Invalid role
};

export const validQualityCheckData = {
  productId: 1,
  scheduledDate: new Date('2024-12-31'),
  notes: 'Scheduled quality check for testing'
};

export const invalidQualityCheckData = {
  productId: -1, // Invalid product ID
  scheduledDate: 'invalid-date', // Invalid date format
  notes: '' // Empty notes
};