const express = require('express');
const cors = require('cors');

// Create a simple test server to check our route structure
const app = express();

app.use(cors());
app.use(express.json());

// Mock data for testing
const mockUser = {
  id: '1',
  name: 'Batuhan',
  surname: 'Saygin',
  email: 'batuhan@talyasmart.com',
  companyId: 1001
};

const mockProducts = [
  {
    id: '123',
    code: 'PRD001',
    name: 'Test Product',
    sellerId: 1,
    brandId: 2,
    companyId: 1001,
    criticalStockAmount: 10
  }
];

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email);
  
  if (email === 'batuhan@talyasmart.com' && password === '123456') {
    res.status(200).json({
      token: 'mock-jwt-token-here',
      user: mockUser,
      expiresIn: 3600
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Product endpoints
app.get('/api/products', (req, res) => {
  console.log('Get products request:', req.query);
  res.json({
    items: mockProducts,
    totalCount: 1,
    page: 1,
    pageSize: 20
  });
});

app.get('/api/products/:id', (req, res) => {
  console.log('Get product by ID:', req.params.id);
  const product = mockProducts.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

app.post('/api/products', (req, res) => {
  console.log('Create product:', req.body);
  const newProduct = {
    id: Date.now().toString(),
    ...req.body,
    createdDate: new Date().toISOString(),
    createdBy: '1',
    companyId: 1001
  };
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  console.log('Update product:', req.params.id, req.body);
  const updatedProduct = {
    id: req.params.id,
    ...req.body,
    updatedDate: new Date().toISOString(),
    updatedBy: '1'
  };
  res.json(updatedProduct);
});

app.delete('/api/products/:id', (req, res) => {
  console.log('Delete product:', req.params.id);
  res.json({
    message: 'Product deactivated',
    productId: req.params.id,
    deletedDate: new Date().toISOString()
  });
});

app.post('/api/products/:id/photos', (req, res) => {
  console.log('Upload photo for product:', req.params.id);
  res.json({
    message: 'Photo uploaded successfully',
    photoUrl: '/uploads/mock-photo.jpg',
    filename: 'mock-photo.jpg'
  });
});

app.patch('/api/products/bulk-status', (req, res) => {
  console.log('Bulk update:', req.body);
  res.json({
    message: '1 products updated',
    updatedCount: 1
  });
});

// Quality check endpoints
app.get('/api/quality-checks', (req, res) => {
  console.log('Get quality checks');
  res.json({ qualityChecks: [] });
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test API server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /health');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/products');
  console.log('  GET  /api/products/:id');
  console.log('  POST /api/products');
  console.log('  PUT  /api/products/:id');
  console.log('  DELETE /api/products/:id');
  console.log('  POST /api/products/:id/photos');
  console.log('  PATCH /api/products/bulk-status');
  console.log('  GET  /api/quality-checks');
});