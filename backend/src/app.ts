import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import customerRoutes from './routes/customer.routes';
import brandRoutes from './routes/brand.routes';
import productGroupRoutes from './routes/productGroup.routes';
import productTypeRoutes from './routes/productType.routes';
import photoRoutes from './routes/photo.routes';
import sellerRoutes from './routes/seller.routes';
import recipeRoutes from './routes/recipe.routes';
import specRoutes from './routes/spec.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';
// New routes
import groupRoutes from './routes/group.routes';
import groupInRoleRoutes from './routes/groupInRole.routes';
import productHistoryRoutes from './routes/productHistory.routes';
import productToCustomerRoutes from './routes/productToCustomer.routes';
// Raw materials and semi-products routes
import rawMaterialRoutes from './routes/rawMaterial.routes';
import rawMaterialGroupRoutes from './routes/rawMaterialGroup.routes';
import semiProductRoutes from './routes/semiProduct.routes';
import semiProductGroupRoutes from './routes/semiProductGroup.routes';
// Warehouse management routes
import warehouseRoutes from './routes/warehouse.routes';
import warehouseLocationRoutes from './routes/warehouseLocation.routes';
import warehouseShelfRoutes from './routes/warehouseShelf.routes';
import warehouseInventoryRoutes from './routes/warehouseInventory.routes';
import warehouseMovementRoutes from './routes/warehouseMovement.routes';
// Production planning routes
import productionPlanRoutes from './routes/productionPlan.routes';
import productionOrderRoutes from './routes/productionOrder.routes';
import productionStageRoutes from './routes/productionStage.routes';
import productionResourceRoutes from './routes/productionResource.routes';
import productionOutputRoutes from './routes/productionOutput.routes';
// Quality assurance routes
import qualityCheckRoutes from './routes/qualityCheck.routes';

// Swagger options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TSmart Quality API',
      version: '1.0.0',
      description: 'API for TSmart Quality Management System',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Initialize express
const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/brands', brandRoutes);
app.use('/api/v1/product-groups', productGroupRoutes);
app.use('/api/v1/product-types', productTypeRoutes);
app.use('/api/v1/photos', photoRoutes);
app.use('/api/v1/sellers', sellerRoutes);
app.use('/api/v1/recipes', recipeRoutes);
app.use('/api/v1/specs', specRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/roles', roleRoutes);

// New API routes
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/group-in-roles', groupInRoleRoutes);
app.use('/api/v1/product-history', productHistoryRoutes);
app.use('/api/v1/product-to-customers', productToCustomerRoutes);

// Raw materials and semi-products routes
app.use('/api/v1/raw-materials', rawMaterialRoutes);
app.use('/api/v1/raw-material-groups', rawMaterialGroupRoutes);
app.use('/api/v1/semi-products', semiProductRoutes);
app.use('/api/v1/semi-product-groups', semiProductGroupRoutes);

// Warehouse management routes
app.use('/api/v1/warehouses', warehouseRoutes);
app.use('/api/v1/warehouse-locations', warehouseLocationRoutes);
app.use('/api/v1/warehouse-shelves', warehouseShelfRoutes);
app.use('/api/v1/inventory', warehouseInventoryRoutes);
app.use('/api/v1/inventory-movements', warehouseMovementRoutes);

// Production planning routes
app.use('/api/v1/production-plans', productionPlanRoutes);
app.use('/api/v1/production-orders', productionOrderRoutes);
app.use('/api/v1/production-stages', productionStageRoutes);
app.use('/api/v1/production-resources', productionResourceRoutes);
app.use('/api/v1/production-outputs', productionOutputRoutes);

// Quality assurance routes
app.use('/api/v1/quality-checks', qualityCheckRoutes);

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Root route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to TSmart Quality API' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

export { app };