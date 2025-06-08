import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

// Simple mock responses for deployment testing
// In production, you would import your actual controllers

const app = express();

// Middleware configuration for production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://tsmartquality.vercel.app']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Disable for API
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'TSmart Quality API is running on Vercel',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Authentication endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  // Mock authentication - replace with real auth logic
  if (email === 'batuhan@talyasmart.com' && password === '123456') {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token-' + Date.now();
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

// Product endpoints
app.get('/api/products', (req: Request, res: Response) => {
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
      description: 'Sample product for Vercel deployment testing',
      weight: 1.5,
      volume: 0.5,
      created_at: new Date().toISOString(),
      created_by: '1',
      is_deleted: false
    },
    {
      id: '124',
      code: 'PRD002',
      name: 'Another Product',
      sellerId: 1,
      brandId: 2,
      companyId: 1001,
      criticalStockAmount: 25,
      description: 'Another sample product',
      weight: 2.0,
      volume: 1.0,
      created_at: new Date().toISOString(),
      created_by: '1',
      is_deleted: false
    }
  ];
  
  // Apply filters
  let filteredProducts = mockProducts;
  if (sellerId) {
    filteredProducts = filteredProducts.filter(p => p.sellerId === parseInt(sellerId as string));
  }
  if (brandId) {
    filteredProducts = filteredProducts.filter(p => p.brandId === parseInt(brandId as string));
  }
  
  res.json({
    items: filteredProducts,
    totalCount: filteredProducts.length,
    page: parseInt(page as string),
    pageSize: parseInt(pageSize as string)
  });
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (id === '123' || id === '124') {
    res.json({
      id,
      code: id === '123' ? 'PRD001' : 'PRD002',
      name: id === '123' ? 'Test Product' : 'Another Product',
      sellerId: 1,
      brandId: 2,
      companyId: 1001,
      criticalStockAmount: id === '123' ? 10 : 25,
      description: `Sample product ${id} for testing`,
      weight: id === '123' ? 1.5 : 2.0,
      volume: id === '123' ? 0.5 : 1.0,
      created_at: new Date().toISOString(),
      created_by: '1',
      is_deleted: false
    });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

app.post('/api/products', (req: Request, res: Response) => {
  const { code, name, sellerId, brandId, criticalStockAmount, description, weight, volume } = req.body;
  
  // Validation
  if (!code || !name || !sellerId || !brandId || criticalStockAmount === undefined) {
    return res.status(400).json({ 
      message: 'Code, name, sellerId, brandId, and criticalStockAmount are required' 
    });
  }
  
  if (criticalStockAmount <= 0) {
    return res.status(400).json({ 
      message: 'criticalStockAmount must be greater than 0' 
    });
  }
  
  const newProduct = {
    id: Date.now().toString(),
    code,
    name,
    sellerId: parseInt(sellerId),
    brandId: parseInt(brandId),
    companyId: 1001,
    criticalStockAmount: parseInt(criticalStockAmount),
    description,
    weight: weight ? parseFloat(weight) : undefined,
    volume: volume ? parseFloat(volume) : undefined,
    createdDate: new Date().toISOString(),
    createdBy: '1'
  };
  
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  
  const updatedProduct = {
    id,
    ...updates,
    updatedDate: new Date().toISOString(),
    updatedBy: '1'
  };
  
  res.json(updatedProduct);
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  
  res.json({
    message: 'Product deactivated',
    productId: id,
    deletedDate: new Date().toISOString()
  });
});

app.patch('/api/products/bulk-status', (req: Request, res: Response) => {
  const { ids, updates } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Product IDs array is required' });
  }
  
  res.json({
    message: `${ids.length} products updated`,
    updatedCount: ids.length
  });
});

app.post('/api/products/:id/photos', (req: Request, res: Response) => {
  const { id } = req.params;
  
  res.json({
    message: 'Photo upload endpoint (mock response)',
    productId: id,
    photoUrl: `/uploads/mock-photo-${id}.jpg`,
    note: 'File upload not implemented in this deployment'
  });
});

// Quality check endpoints
app.get('/api/quality-checks', (req: Request, res: Response) => {
  res.json({ 
    qualityChecks: [],
    message: 'Quality checks endpoint working'
  });
});

// User endpoints
app.get('/api/users/me', (req: Request, res: Response) => {
  // Mock user profile
  res.json({
    user: {
      id: '1',
      name: 'Batuhan',
      surname: 'Saygin',
      email: 'batuhan@talyasmart.com',
      companyId: 1001,
      role: 'admin'
    }
  });
});

// Error handling
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    message: 'Route not found',
    availableRoutes: [
      'GET /api/health',
      'POST /api/auth/login',
      'GET /api/products',
      'GET /api/products/:id',
      'POST /api/products',
      'PUT /api/products/:id',
      'DELETE /api/products/:id',
      'PATCH /api/products/bulk-status',
      'GET /api/quality-checks',
      'GET /api/users/me'
    ]
  });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`TSmart Quality API running on port ${PORT}`);
  });
}

// Export for Vercel
export default app;