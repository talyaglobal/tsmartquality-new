# TSmart Quality Backend Implementation

This document provides an overview of the backend implementation for the TSmart Quality project.

## Project Structure

The backend follows a typical Express.js architecture with TypeScript:

```
backend/
├── src/
│   ├── app.ts                  # Express application setup
│   ├── index.ts                # Entry point
│   ├── config/                 # Configuration files
│   │   └── supabase.ts         # Supabase client setup
│   ├── controllers/            # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   └── ...
│   ├── middleware/             # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   └── ...
│   ├── routes/                 # API routes
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   └── ...
│   ├── scripts/                # Utility scripts
│   │   ├── create-admin-user.js
│   │   └── ...
│   └── __tests__/              # Test files
├── tsconfig.json
├── package.json
└── README.md
```

## API Implementation

The backend implements RESTful APIs for various resources following a standard pattern:

1. **Routes** - Define endpoints and map them to controller functions
2. **Controllers** - Handle business logic and database interactions
3. **Middleware** - Authentication, role verification, validation, etc.

### Key API Endpoints

All endpoints follow the pattern:

- `GET /api/v1/<resource>` - List all resources
- `GET /api/v1/<resource>/:id` - Get a specific resource
- `POST /api/v1/<resource>` - Create a new resource
- `PUT /api/v1/<resource>/update` - Update a resource
- `GET /api/v1/<resource>/remove/:id` - Soft delete a resource

The following resource endpoints are implemented:

- **Authentication**: `/api/v1/auth`
- **Products**: `/api/v1/products`
- **Product Groups**: `/api/v1/product-groups`
- **Product Types**: `/api/v1/product-types`
- **Brands**: `/api/v1/brands`
- **Customers**: `/api/v1/customers`
- **Sellers**: `/api/v1/sellers`
- **Recipes**: `/api/v1/recipes`
- **Specifications**: `/api/v1/specs`
- **Photos**: `/api/v1/photos`
- **Users**: `/api/v1/users`
- **Roles**: `/api/v1/roles`
- **Groups**: `/api/v1/groups`
- **Group Roles**: `/api/v1/group-in-roles`
- **Product History**: `/api/v1/product-history`
- **Product Customers**: `/api/v1/product-to-customers`
- **Raw Materials**: `/api/v1/raw-materials`
- **Raw Material Groups**: `/api/v1/raw-material-groups`
- **Semi-Products**: `/api/v1/semi-products`
- **Semi-Product Groups**: `/api/v1/semi-product-groups`
- **Warehouses**: `/api/v1/warehouses`
- **Warehouse Locations**: `/api/v1/warehouse-locations`
- **Warehouse Shelves**: `/api/v1/warehouse-shelves`
- **Inventory**: `/api/v1/inventory`
- **Inventory Movements**: `/api/v1/inventory-movements`

Many endpoints also provide extended functionality:

- `GET /api/v1/<resource>/filter` - Get filtered resources with pagination
- `GET /api/v1/<resource>/:id/details` - Get detailed information with relationships
- Custom endpoints for specific business needs

## Authentication & Authorization

### Authentication

- JWT-based authentication 
- Token obtained via `/api/v1/auth/login`
- User details attached to request via middleware

### Authorization

The system uses a role-based access control (RBAC) model:

1. **Users** belong to **Groups**
2. **Groups** are assigned **Roles**
3. **Roles** determine what actions a user can perform

Middleware functions enforce authorization:
- `authMiddleware` - Verifies JWT token and attaches user info
- `roleMiddleware` - Checks if user has required roles
- `isAdmin` - Checks if user is a system administrator
- `isCompanyAdmin` - Checks if user is a company administrator
- `isResourceOwnerOrAdmin` - Checks if user owns a resource or has admin privileges

## Database Structure

The application uses Supabase (PostgreSQL) with the following key tables:

- `companies` - Company information
- `users` - User accounts (linked to Supabase Auth)
- `groups` - User groups
- `roles` - System roles
- `group_in_roles` - Maps groups to roles
- `user_in_groups` - Maps users to groups
- `products` - Core product information
- `product_history` - Tracks changes to products
- `product_to_customers` - Maps products to customers
- `raw_materials` - Raw material information
- `raw_material_groups` - Raw material categorization
- `semi_products` - Semi-finished product information
- `semi_product_groups` - Semi-product categorization
- `warehouses` - Warehouse information
- `warehouse_locations` - Locations within warehouses
- `warehouse_shelves` - Shelves within locations
- `warehouse_inventory` - Inventory tracking
- `warehouse_movements` - Movement history
- Other supporting tables for brands, product types, etc.

## Key Features

### Multi-tenancy

The system supports multiple companies:
- Each record includes a `company_id`
- Users can only access data from their own company
- Company administrators can access all data within their company

### Soft Deletion

Records are never physically deleted:
- Every table has a `status` boolean column
- "Deleted" records have `status = false`
- Queries filter for `status = true` by default

### Audit Trail

Changes to products are tracked:
- `product_history` table records all changes
- Each entry includes old value, new value, and who made the change

### File Upload

The system supports photo uploads:
- Files stored in `/uploads` directory
- File metadata stored in `photos` table
- Photos linked to products

## Testing

Unit tests are written using Jest:
- Controllers are tested with mocked Supabase responses
- Tests focus on business logic and error handling

## API Documentation

API documentation is available via Swagger:
- Accessible at `/api-docs` when the server is running
- Includes all endpoints, parameters, and response formats

## Security

The system implements several security practices:
- JWT authentication
- Role-based authorization
- Input validation
- Error handling
- Security headers via Helmet

## Deployment

The application can be deployed using:
- Standard Node.js hosting
- Docker containerization

## Implementation Progress

### Recently Implemented Features

1. **User Group Management**:
   - Group creation, assignment, and management
   - Role-based authorization through groups
   - Mapping users to groups for access control

2. **Product Relationships**:
   - Product-to-customer mapping with custom codes
   - Product history tracking for audit trails
   - Comprehensive filtering and search capabilities

3. **Raw Materials Management**:
   - Complete CRUD operations for raw materials
   - Categorization with material groups
   - Filtering and search capabilities
   - Protection against deleting materials in use

4. **Semi-Products Management**:
   - Full lifecycle management of intermediate products
   - Links to recipes as both inputs and outputs
   - Detailed views with related production information

### Recently Implemented Features (continued)

5. **Warehouse Management**:
   - Complete warehouse management system
   - Hierarchical location structure (warehouse > location > shelf)
   - Inventory tracking for products, raw materials, and semi-products
   - Lot and batch tracking with expiry dates
   - Movement history with full audit trail
   - Comprehensive reporting and filtering

### Next Implementation Phases

1. **Production Planning**:
   - Production schedule management
   - Resource allocation and planning
   - Capacity tracking

2. **Quality Assurance**:
   - QA checkpoints and workflows
   - Test result recording
   - Compliance tracking

3. **Advanced Analytics**:
   - Business intelligence dashboards
   - Predictive analytics
   - Performance metrics

## Missing Features & Future Work

Some potential improvements for future development:

1. **Additional Resources**: Implement remaining endpoints from the API specification
2. **Caching**: Add Redis caching for frequently accessed data
3. **Webhooks**: Add webhook support for integration with other systems
4. **Advanced Pagination**: Implement cursor-based pagination for better performance
5. **Real-time Updates**: Add WebSocket support for real-time notifications
6. **Full-text Search**: Implement more advanced search capabilities
7. **Analytics**: Add reporting and analytics capabilities
8. **Mobile Support**: Optimize APIs for mobile applications
9. **Background Jobs**: Add support for long-running operations
10. **Export/Import**: Add data export and import capabilities