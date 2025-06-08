const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import routes (will need to be compiled from TypeScript)
// For now, we'll create a simplified version

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.vercel.app', 'https://tsmartquality.vercel.app']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'TSmart Quality API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Basic auth endpoint for testing
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  // Mock authentication for deployment testing
  if (email === 'batuhan@talyasmart.com' && password === '123456') {
    const token = 'mock-jwt-token-' + Date.now();
    res.status(200).json({
      token,
      user: {
        id: '1',
        name: 'Batuhan',
        surname: 'Saygin',
        email: 'batuhan@talyasmart.com',
        companyId: 1001
      },
      expiresIn: 3600
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Basic products endpoint
app.get('/api/products', (req, res) => {
  const { page = 1, pageSize = 20, sellerId, brandId, orderBy } = req.query;
  
  // Mock product data
  const mockProducts = [
    {
      id: '123',
      code: 'PRD001',
      name: 'Test Product',
      sellerId: 1,
      brandId: 2,
      companyId: 1001,
      criticalStockAmount: 10,
      description: 'Sample product for testing',
      created_at: new Date().toISOString()
    }
  ];
  
  res.json({
    items: mockProducts,
    totalCount: 1,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  
  if (id === '123') {
    res.json({
      id: '123',
      code: 'PRD001',
      name: 'Test Product',
      sellerId: 1,
      brandId: 2,
      companyId: 1001,
      criticalStockAmount: 10,
      description: 'Sample product for testing',
      created_at: new Date().toISOString()
    });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

app.post('/api/products', (req, res) => {
  const { code, name, sellerId, brandId, criticalStockAmount } = req.body;
  
  if (!code || !name || !sellerId || !brandId || criticalStockAmount === undefined) {
    return res.status(400).json({ 
      message: 'Code, name, sellerId, brandId, and criticalStockAmount are required' 
    });
  }
  
  const newProduct = {
    id: Date.now().toString(),
    code,
    name,
    sellerId,
    brandId,
    companyId: 1001,
    criticalStockAmount,
    createdDate: new Date().toISOString(),
    createdBy: '1'
  };
  
  res.status(201).json(newProduct);
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Export for Vercel
module.exports = app;