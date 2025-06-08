"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
// Simple mock responses for deployment testing
// In production, you would import your actual controllers
const app = (0, express_1.default)();
// Middleware configuration for production
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://tsmartquality.vercel.app']
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false // Disable for API
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Enhanced health check endpoint for serverless
app.get('/api/health', (req, res) => {
    try {
        const memoryUsage = process.memoryUsage();
        const healthStatus = {
            status: 'healthy',
            message: 'TSmart Quality API is running on Vercel',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'production',
            version: '1.0.0',
            uptime: process.uptime(),
            memory: {
                rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
                heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
            },
            checks: {
                environment: {
                    status: true,
                    message: 'Environment variables loaded',
                    nodeVersion: process.version
                },
                database: {
                    status: true,
                    message: 'Database connection ready (mock)',
                    note: 'Real database connection would be tested here'
                },
                serverless: {
                    status: true,
                    message: 'Serverless function operational',
                    platform: 'Vercel'
                }
            }
        };
        res.status(200).json(healthStatus);
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            message: 'Health check failed',
            error: error.message,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'production'
        });
    }
});
// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
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
    }
    else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});
// Product endpoints
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
        filteredProducts = filteredProducts.filter(p => p.sellerId === parseInt(sellerId));
    }
    if (brandId) {
        filteredProducts = filteredProducts.filter(p => p.brandId === parseInt(brandId));
    }
    res.json({
        items: filteredProducts,
        totalCount: filteredProducts.length,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
    });
});
app.get('/api/products/:id', (req, res) => {
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
    }
    else {
        res.status(404).json({ message: 'Product not found' });
    }
});
app.post('/api/products', (req, res) => {
    const { code, name, sellerId, brandId, criticalStockAmount, description, weight, volume } = req.body;
    // Validation
    if (!code || !name || !sellerId || !brandId || criticalStockAmount === undefined) {
        res.status(400).json({
            message: 'Code, name, sellerId, brandId, and criticalStockAmount are required'
        });
        return;
    }
    if (criticalStockAmount <= 0) {
        res.status(400).json({
            message: 'criticalStockAmount must be greater than 0'
        });
        return;
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
app.put('/api/products/:id', (req, res) => {
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
app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    res.json({
        message: 'Product deactivated',
        productId: id,
        deletedDate: new Date().toISOString()
    });
});
app.patch('/api/products/bulk-status', (req, res) => {
    const { ids, updates } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ message: 'Product IDs array is required' });
        return;
    }
    res.json({
        message: `${ids.length} products updated`,
        updatedCount: ids.length
    });
});
app.post('/api/products/:id/photos', (req, res) => {
    const { id } = req.params;
    res.json({
        message: 'Photo upload endpoint (mock response)',
        productId: id,
        photoUrl: `/uploads/mock-photo-${id}.jpg`,
        note: 'File upload not implemented in this deployment'
    });
});
// Quality check endpoints
app.get('/api/quality-checks', (req, res) => {
    res.json({
        qualityChecks: [],
        message: 'Quality checks endpoint working'
    });
});
// User endpoints
app.get('/api/users/me', (req, res) => {
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
app.use((req, res) => {
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
app.use((err, req, res, next) => {
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
exports.default = app;
