# TSmart Quality Backend API Development Guide

## Overview

This comprehensive guide provides all API routes and backend implementation details for the TSmart Quality management system. The API follows RESTful conventions and includes 190+ endpoints covering all aspects of quality management.

## API Base Information

- **API Version**: 1.0
- **Base URL**: `/api`
- **Content Type**: `application/json`
- **Authentication**: Required for most endpoints
- **Response Format**: JSON

## Complete API Routes by Module

### 1. Authentication & User Management

#### Users
```
POST   /api/Users/Login                    # User authentication
```

#### Roles & Permissions
```
GET    /api/Roles                          # Get all roles
POST   /api/Roles                          # Create new role
GET    /api/Roles/{id}                     # Get role by ID
PUT    /api/Roles/Update                   # Update role
GET    /api/Roles/Remove/{id}              # Delete role

GET    /api/Groups                         # Get all groups
POST   /api/Groups                         # Create new group
GET    /api/Groups/{id}                    # Get group by ID
PUT    /api/Groups/Update                  # Update group
GET    /api/Groups/Remove/{id}             # Delete group

GET    /api/GroupInRoles                   # Get group-role associations
POST   /api/GroupInRoles                   # Create group-role association
GET    /api/GroupInRoles/{id}              # Get association by ID
PUT    /api/GroupInRoles/Update            # Update association
GET    /api/GroupInRoles/Remove/{id}       # Delete association
```

### 2. Product Management

#### Products (Core)
```
GET    /api/Products                       # Get all products
POST   /api/Products                       # Create new product
GET    /api/Products/{id}                  # Get product by ID
PUT    /api/Products/Update                # Update product
GET    /api/Products/Remove/{id}           # Delete product

# Advanced Product Endpoints
GET    /api/Products/Dashboard             # Product dashboard data
GET    /api/Products/FilteredList          # Filtered product list
GET    /api/Products/GetAllWithDetails     # Products with full details
GET    /api/Products/GetAllWithDetails/{limit}/{offset}  # Paginated detailed products
GET    /api/Products/GetAllWithDetailsForWeb  # Web-optimized product details
GET    /api/Products/GetProductFilterItems # Filter options for products
GET    /api/Products/GetProductsWithDetailsWithFilter/{limit}/{offset}  # Filtered & paginated
GET    /api/Products/GetWithDetails/{productId}  # Single product with details
```

#### Product Types & Categories
```
GET    /api/ProductTypes                   # Get all product types
POST   /api/ProductTypes                   # Create product type
GET    /api/ProductTypes/{id}              # Get product type by ID
PUT    /api/ProductTypes/Update            # Update product type
GET    /api/ProductTypes/Remove/{id}       # Delete product type

GET    /api/ProductGroups                  # Get all product groups
POST   /api/ProductGroups                  # Create product group
GET    /api/ProductGroups/{id}             # Get product group by ID
PUT    /api/ProductGroups/Update           # Update product group
GET    /api/ProductGroups/Remove/{id}      # Delete product group

GET    /api/ProductGroupTypes              # Get all product group types
POST   /api/ProductGroupTypes              # Create product group type
GET    /api/ProductGroupTypes/{id}         # Get product group type by ID
PUT    /api/ProductGroupTypes/Update       # Update product group type
GET    /api/ProductGroupTypes/Remove/{id}  # Delete product group type
GET    /api/ProductGroupTypes/GetAllWithDetails  # Group types with details
GET    /api/ProductGroupTypes/GetWithDetails/{productGroupTypeId}  # Single with details

GET    /api/ProductGroupTypeDefinitions    # Get all definitions
POST   /api/ProductGroupTypeDefinitions    # Create definition
GET    /api/ProductGroupTypeDefinitions/{id}  # Get definition by ID
PUT    /api/ProductGroupTypeDefinitions/Update  # Update definition
GET    /api/ProductGroupTypeDefinitions/Remove/{id}  # Delete definition
```

#### Product Status & History
```
GET    /api/ProductStatuses                # Get all product statuses
POST   /api/ProductStatuses                # Create product status
GET    /api/ProductStatuses/{id}           # Get status by ID
PUT    /api/ProductStatuses/Update         # Update status
GET    /api/ProductStatuses/Remove/{id}    # Delete status

GET    /api/ProductHistories               # Get all product histories
GET    /api/ProductHistories/{id}          # Get history by ID
GET    /api/ProductHistories/Remove/{id}   # Delete history
GET    /api/ProductHistories/GetAllWithDetails/{limit}/{offset}  # Paginated histories
```

#### Product Relationships
```
GET    /api/ProductToCustomers             # Get product-customer relationships
POST   /api/ProductToCustomers             # Create relationship
GET    /api/ProductToCustomers/{id}        # Get relationship by ID
PUT    /api/ProductToCustomers/Update      # Update relationship
GET    /api/ProductToCustomers/Remove/{id} # Delete relationship

GET    /api/ProductToProductGroupTypeDefinitions  # Get product-definition relationships
POST   /api/ProductToProductGroupTypeDefinitions  # Create relationship
GET    /api/ProductToProductGroupTypeDefinitions/{id}  # Get relationship by ID
PUT    /api/ProductToProductGroupTypeDefinitions/Update  # Update relationship
GET    /api/ProductToProductGroupTypeDefinitions/Remove/{id}  # Delete relationship
```

### 3. Raw Materials & Semi-Products

#### Raw Materials
```
GET    /api/RawMaterials                   # Get all raw materials
POST   /api/RawMaterials                   # Create raw material
GET    /api/RawMaterials/{id}              # Get raw material by ID
PUT    /api/RawMaterials/Update            # Update raw material
GET    /api/RawMaterials/Remove/{id}       # Delete raw material

GET    /api/RawMaterialGroups              # Get all raw material groups
POST   /api/RawMaterialGroups              # Create group
GET    /api/RawMaterialGroups/{id}         # Get group by ID
PUT    /api/RawMaterialGroups/Update       # Update group
GET    /api/RawMaterialGroups/Remove/{id}  # Delete group
```

#### Semi-Products
```
GET    /api/SemiProducts                   # Get all semi-products
POST   /api/SemiProducts                   # Create semi-product
GET    /api/SemiProducts/{id}              # Get semi-product by ID
PUT    /api/SemiProducts/Update            # Update semi-product
GET    /api/SemiProducts/Remove/{id}       # Delete semi-product
GET    /api/SemiProducts/GetWithDetails/{semiProductId}  # Semi-product with details

GET    /api/SemiProductGroups              # Get all semi-product groups
POST   /api/SemiProductGroups              # Create group
GET    /api/SemiProductGroups/{id}         # Get group by ID
PUT    /api/SemiProductGroups/Update       # Update group
GET    /api/SemiProductGroups/Remove/{id}  # Delete group
```

### 4. Recipes & Specifications

#### Recipes
```
GET    /api/Recipes                        # Get all recipes
POST   /api/Recipes                        # Create recipe
GET    /api/Recipes/{id}                   # Get recipe by ID
PUT    /api/Recipes/Update                 # Update recipe
GET    /api/Recipes/Remove/{id}            # Delete recipe
GET    /api/Recipes/GetAllWithDetails      # Recipes with details
GET    /api/Recipes/GetWithDetails/{recipeId}  # Single recipe with details

GET    /api/RecipeDetails                  # Get all recipe details
POST   /api/RecipeDetails                  # Create recipe detail
GET    /api/RecipeDetails/{id}             # Get detail by ID
PUT    /api/RecipeDetails/Update           # Update detail
GET    /api/RecipeDetails/Remove/{id}      # Delete detail
```

#### Specifications
```
GET    /api/Specs                          # Get all specifications
POST   /api/Specs                          # Create specification
GET    /api/Specs/{id}                     # Get spec by ID
PUT    /api/Specs/Update                   # Update spec
GET    /api/Specs/Remove/{id}              # Delete spec
GET    /api/Specs/GetAllWithDetails        # Specs with details
GET    /api/Specs/GetWithDetails/{specId}  # Single spec with details

GET    /api/SpecDetails                    # Get all spec details
POST   /api/SpecDetails                    # Create spec detail
GET    /api/SpecDetails/{id}               # Get detail by ID
PUT    /api/SpecDetails/Update             # Update detail
GET    /api/SpecDetails/Remove/{id}        # Delete detail
```

#### Norms
```
GET    /api/Norms                          # Get all norms
POST   /api/Norms                          # Create norm
GET    /api/Norms/{id}                     # Get norm by ID
PUT    /api/Norms/Update                   # Update norm
GET    /api/Norms/Remove/{id}              # Delete norm
GET    /api/Norms/GetAllWithDetails        # Norms with details
GET    /api/Norms/GetWithDetails/{normId}  # Single norm with details

GET    /api/NormDetails                    # Get all norm details
POST   /api/NormDetails                    # Create norm detail
GET    /api/NormDetails/{id}               # Get detail by ID
PUT    /api/NormDetails/Update             # Update detail
GET    /api/NormDetails/Remove/{id}        # Delete detail
```

### 5. Brand & Packaging Management

#### Brands
```
GET    /api/Brands                         # Get all brands
POST   /api/Brands                         # Create brand
GET    /api/Brands/{id}                    # Get brand by ID
PUT    /api/Brands/Update                  # Update brand
GET    /api/Brands/Remove/{id}             # Delete brand
```

#### Packaging
```
GET    /api/Packagings                     # Get all packaging types
POST   /api/Packagings                     # Create packaging
GET    /api/Packagings/{id}                # Get packaging by ID
PUT    /api/Packagings/Update              # Update packaging
GET    /api/Packagings/Remove/{id}         # Delete packaging
```

### 6. Quality Management

#### Quality Types
```
GET    /api/QualityTypes                   # Get all quality types
POST   /api/QualityTypes                   # Create quality type
GET    /api/QualityTypes/{id}              # Get quality type by ID
PUT    /api/QualityTypes/Update            # Update quality type
GET    /api/QualityTypes/Remove/{id}       # Delete quality type
```

#### Color Types
```
GET    /api/ColorTypes                     # Get all color types
POST   /api/ColorTypes                     # Create color type
GET    /api/ColorTypes/{id}                # Get color type by ID
PUT    /api/ColorTypes/Update              # Update color type
GET    /api/ColorTypes/Remove/{id}         # Delete color type
```

#### Cutting Types
```
GET    /api/CuttingTypes                   # Get all cutting types
POST   /api/CuttingTypes                   # Create cutting type
GET    /api/CuttingTypes/{id}              # Get cutting type by ID
PUT    /api/CuttingTypes/Update            # Update cutting type
GET    /api/CuttingTypes/Remove/{id}       # Delete cutting type
```

### 7. Customer & Sales Management

#### Customers
```
GET    /api/Customers                      # Get all customers
POST   /api/Customers                      # Create customer
GET    /api/Customers/{id}                 # Get customer by ID
PUT    /api/Customers/Update               # Update customer
GET    /api/Customers/Remove/{id}          # Delete customer
```

#### Sales Management
```
GET    /api/SalesGroups                    # Get all sales groups
POST   /api/SalesGroups                    # Create sales group
GET    /api/SalesGroups/{id}               # Get sales group by ID
PUT    /api/SalesGroups/Update             # Update sales group
GET    /api/SalesGroups/Remove/{id}        # Delete sales group

GET    /api/SalesBaseds                    # Get all sales bases
POST   /api/SalesBaseds                    # Create sales base
GET    /api/SalesBaseds/{id}               # Get sales base by ID
PUT    /api/SalesBaseds/Update             # Update sales base
GET    /api/SalesBaseds/Remove/{id}        # Delete sales base

GET    /api/Sellers                        # Get all sellers
POST   /api/Sellers                        # Create seller
GET    /api/Sellers/{id}                   # Get seller by ID
PUT    /api/Sellers/Update                 # Update seller
GET    /api/Sellers/Remove/{id}            # Delete seller
```

### 8. Inventory & Warehouse Management

#### Warehouses
```
GET    /api/Warehouses                     # Get all warehouses
POST   /api/Warehouses                     # Create warehouse
GET    /api/Warehouses/{id}                # Get warehouse by ID
PUT    /api/Warehouses/Update              # Update warehouse
GET    /api/Warehouses/Remove/{id}         # Delete warehouse
```

#### Storage Conditions
```
GET    /api/StorageConditions              # Get all storage conditions
POST   /api/StorageConditions              # Create storage condition
GET    /api/StorageConditions/{id}         # Get condition by ID
PUT    /api/StorageConditions/Update       # Update condition
GET    /api/StorageConditions/Remove/{id}  # Delete condition
```

#### SKU Management
```
GET    /api/SKUFollowTypes                 # Get all SKU follow types
POST   /api/SKUFollowTypes                 # Create SKU follow type
GET    /api/SKUFollowTypes/{id}            # Get type by ID
PUT    /api/SKUFollowTypes/Update          # Update type
GET    /api/SKUFollowTypes/Remove/{id}     # Delete type

GET    /api/SKUFollowUnits                 # Get all SKU follow units
POST   /api/SKUFollowUnits                 # Create SKU follow unit
GET    /api/SKUFollowUnits/{id}            # Get unit by ID
PUT    /api/SKUFollowUnits/Update          # Update unit
GET    /api/SKUFollowUnits/Remove/{id}     # Delete unit
```

### 9. Production Management

#### Production Places
```
GET    /api/ProductionPlaces               # Get all production places
POST   /api/ProductionPlaces               # Create production place
GET    /api/ProductionPlaces/{id}          # Get place by ID
PUT    /api/ProductionPlaces/Update        # Update place
GET    /api/ProductionPlaces/Remove/{id}   # Delete place
```

### 10. Media & Documentation

#### Photos
```
GET    /api/Photos                         # Get all photos
POST   /api/Photos                         # Upload photo
GET    /api/Photos/{id}                    # Get photo by ID
PUT    /api/Photos/Update                  # Update photo
GET    /api/Photos/Remove/{id}             # Delete photo

GET    /api/PhotoTypes                     # Get all photo types
POST   /api/PhotoTypes                     # Create photo type
GET    /api/PhotoTypes/{id}                # Get type by ID
PUT    /api/PhotoTypes/Update              # Update type
GET    /api/PhotoTypes/Remove/{id}         # Delete type
```

### 11. System Configuration

#### Countries & Localization
```
GET    /api/Countries                      # Get all countries
POST   /api/Countries                      # Create country
GET    /api/Countries/{id}                 # Get country by ID
PUT    /api/Countries/Update               # Update country
GET    /api/Countries/Remove/{id}          # Delete country

GET    /api/Localizations                  # Get all localizations
POST   /api/Localizations                  # Create localization
GET    /api/Localizations/{id}             # Get localization by ID
PUT    /api/Localizations/Update           # Update localization
GET    /api/Localizations/Remove/{id}      # Delete localization
```

#### ERP Integration
```
GET    /api/ERPSettings                    # Get all ERP settings
POST   /api/ERPSettings                    # Create ERP setting
GET    /api/ERPSettings/{id}               # Get setting by ID
PUT    /api/ERPSettings/Update             # Update setting
GET    /api/ERPSettings/Remove/{id}        # Delete setting
```

#### Budget Management
```
GET    /api/BudgetGroups                   # Get all budget groups
POST   /api/BudgetGroups                   # Create budget group
GET    /api/BudgetGroups/{id}              # Get group by ID
PUT    /api/BudgetGroups/Update            # Update group
GET    /api/BudgetGroups/Remove/{id}       # Delete group
```

### 12. Notifications
```
GET    /api/NotificationTokens             # Get all notification tokens
POST   /api/NotificationTokens             # Create token
GET    /api/NotificationTokens/{id}        # Get token by ID
PUT    /api/NotificationTokens/Update      # Update token
GET    /api/NotificationTokens/Remove/{id} # Delete token
```

## Backend Implementation Guide

### 1. Technology Stack Recommendations

#### For Next.js 14 + Supabase
```typescript
// Recommended stack
- Next.js 14 (App Router)
- Supabase (Database + Auth)
- Prisma ORM (Database management)
- TypeScript (Type safety)
- Zod (Validation)
- NextAuth.js (Authentication)
```

#### For Node.js/Express Backend
```typescript
// Alternative stack
- Node.js + Express.js
- PostgreSQL/MySQL
- Prisma/TypeORM
- JWT Authentication
- Joi/Yup validation
- Swagger documentation
```

### 2. Database Schema Design

#### Core Tables Structure
```sql
-- Users and Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id UUID REFERENCES roles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products (Main entity)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  product_type_id UUID REFERENCES product_types(id),
  product_group_id UUID REFERENCES product_groups(id),
  brand_id UUID REFERENCES brands(id),
  quality_type_id UUID REFERENCES quality_types(id),
  storage_condition_id UUID REFERENCES storage_conditions(id),
  packaging_id UUID REFERENCES packagings(id),
  seller_id UUID REFERENCES sellers(id),
  production_place_id UUID REFERENCES production_places(id),
  warehouse_id UUID REFERENCES warehouses(id),
  
  -- Product specifications
  weight DECIMAL(10,3),
  volume DECIMAL(10,3),
  density DECIMAL(10,3),
  width DECIMAL(10,3),
  length DECIMAL(10,3),
  height DECIMAL(10,3),
  
  -- Inventory management
  critical_stock_amount INTEGER,
  shelflife_limit INTEGER,
  max_stack INTEGER,
  
  -- Tracking flags
  stock_tracking BOOLEAN DEFAULT false,
  bbd_tracking BOOLEAN DEFAULT false,
  lot_tracking BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,
  is_setted_product BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Recipes
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50),
  output_product_id UUID REFERENCES products(id),
  yield_expected DECIMAL(10,3),
  cost_per_unit DECIMAL(10,2),
  production_time INTEGER, -- minutes
  instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Recipe Details (Ingredients)
CREATE TABLE recipe_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_product_id UUID REFERENCES products(id),
  quantity DECIMAL(10,3) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  sequence_order INTEGER,
  is_critical BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Brands
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500),
  brand_color VARCHAR(7), -- Hex color
  market_position VARCHAR(50), -- premium, standard, economy
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product Types (HM, YM, MM, TM)
CREATE TABLE product_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) NOT NULL, -- HM, YM, MM, TM
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quality Types
CREATE TABLE quality_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  grade VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Storage Conditions
CREATE TABLE storage_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  temperature_min DECIMAL(5,2),
  temperature_max DECIMAL(5,2),
  humidity_min DECIMAL(5,2),
  humidity_max DECIMAL(5,2),
  special_requirements TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Packaging Types
CREATE TABLE packagings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  material VARCHAR(255),
  size_specification VARCHAR(255),
  weight DECIMAL(10,3),
  sustainability_rating INTEGER,
  cost DECIMAL(10,2),
  recyclable BOOLEAN DEFAULT false,
  certifications TEXT[], -- Array of certifications
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  country_id UUID REFERENCES countries(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Warehouses
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) UNIQUE NOT NULL,
  location VARCHAR(255),
  capacity DECIMAL(15,3),
  current_stock DECIMAL(15,3) DEFAULT 0,
  warehouse_type VARCHAR(100), -- cold, dry, frozen, etc.
  created_at TIMESTAMP DEFAULT NOW()
);

-- Product History (Audit trail)
CREATE TABLE product_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  action VARCHAR(100) NOT NULL, -- created, updated, deleted, etc.
  field_name VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW()
);
```

### 3. API Implementation Examples

#### Product CRUD Operations
```typescript
// Next.js API Route: /app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(request.url)
  
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = parseInt(searchParams.get('offset') || '0')
  
  try {
    const { data, error, count } = await supabase
      .from('products')
      .select(`
        *,
        product_types(name, code),
        brands(name, logo_url),
        quality_types(name, grade),
        storage_conditions(name),
        packagings(name, material),
        warehouses(name, code)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      data,
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: count > offset + limit
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['stock_code', 'name', 'product_type_id']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }
    
    const { data, error } = await supabase
      .from('products')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
```

#### Product Dashboard Endpoint
```typescript
// /app/api/products/dashboard/route.ts
export async function GET() {
  const supabase = createServerClient()
  
  try {
    // Get product type statistics
    const { data: typeStats } = await supabase
      .from('products')
      .select('product_types(code), count(*)')
      .group('product_types.code')

    // Get quality distribution
    const { data: qualityStats } = await supabase
      .from('products')
      .select('quality_types(name), count(*)')
      .group('quality_types.name')

    // Get brand distribution
    const { data: brandStats } = await supabase
      .from('products')
      .select('brands(name), count(*)')
      .group('brands.name')

    // Get recent activities
    const { data: recentActivities } = await supabase
      .from('product_histories')
      .select(`
        *,
        products(name, stock_code),
        users(email)
      `)
      .order('changed_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      statistics: {
        byType: typeStats,
        byQuality: qualityStats,
        byBrand: brandStats
      },
      recentActivities
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
```

#### Recipe Management
```typescript
// /app/api/recipes/route.ts
export async function GET() {
  const supabase = createServerClient()
  
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        products!output_product_id(name, stock_code),
        recipe_details(
          *,
          products!ingredient_product_id(name, stock_code)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  
  try {
    const { recipe, ingredients } = await request.json()
    
    // Create recipe
    const { data: newRecipe, error: recipeError } = await supabase
      .from('recipes')
      .insert(recipe)
      .select()
      .single()

    if (recipeError) throw recipeError

    // Create recipe details (ingredients)
    if (ingredients && ingredients.length > 0) {
      const recipeDetails = ingredients.map((ingredient: any, index: number) => ({
        ...ingredient,
        recipe_id: newRecipe.id,
        sequence_order: index + 1
      }))

      const { error: detailsError } = await supabase
        .from('recipe_details')
        .insert(recipeDetails)

      if (detailsError) throw detailsError
    }

    return NextResponse.json(newRecipe, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    )
  }
}
```

### 4. Authentication & Authorization

#### JWT Authentication Setup
```typescript
// /lib/auth/jwt.ts
import jwt from 'jsonwebtoken'

export function generateToken(userId: string, role: string) {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  )
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!)
  } catch (error) {
    return null
  }
}

// Middleware for protected routes
export function withAuth(handler: Function) {
  return async (request: NextRequest) => {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Add user info to request
    request.user = payload
    return handler(request)
  }
}
```

### 5. Data Validation

#### Zod Schemas
```typescript
// /lib/validations/product.ts
import { z } from 'zod'

export const ProductSchema = z.object({
  stock_code: z.string().min(1, 'Stock code is required'),
  name: z.string().min(1, 'Product name is required'),
  product_type_id: z.string().uuid('Invalid product type'),
  product_group_id: z.string().uuid().optional(),
  brand_id: z.string().uuid().optional(),
  weight: z.number().positive().optional(),
  volume: z.number().positive().optional(),
  density: z.number().positive().optional(),
  width: z.number().positive().optional(),
  length: z.number().positive().optional(),
  height: z.number().positive().optional(),
  critical_stock_amount: z.number().int().min(0).optional(),
  shelflife_limit: z.number().int().min(0).optional(),
  max_stack: z.number().int().min(0).optional(),
  stock_tracking: z.boolean().default(false),
  bbd_tracking: z.boolean().default(false),
  lot_tracking: z.boolean().default(false),
  is_blocked: z.boolean().default(false),
  is_setted_product: z.boolean().default(false)
})

export const RecipeSchema = z.object({
  name: z.string().min(1, 'Recipe name is required'),
  version: z.string().optional(),
  output_product_id: z.string().uuid('Invalid product ID'),
  yield_expected: z.number().positive().optional(),
  cost_per_unit: z.number().positive().optional(),
  production_time: z.number().int().min(0).optional(),
  instructions: z.string().optional()
})

export const RecipeDetailSchema = z.object({
  ingredient_product_id: z.string().uuid('Invalid ingredient ID'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  is_critical: z.boolean().default(false)
})
```

### 6. Error Handling

#### Centralized Error Handler
```typescript
// /lib/errors/handler.ts
export class APIError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export function handleAPIError(error: any) {
  console.error('API Error:', error)

  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  if (error.code === '23505') { // PostgreSQL unique violation
    return NextResponse.json(
      { error: 'Resource already exists' },
      { status: 409 }
    )
  }

  if (error.code === '23503') { // PostgreSQL foreign key violation
    return NextResponse.json(
      { error: 'Referenced resource not found' },
      { status: 400 }
    )
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

### 7. Testing Strategy

#### API Testing with Jest
```typescript
// /tests/api/products.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/products/route'

describe('/api/products', () => {
  it('should return products list', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token'
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data).toHaveProperty('data')
    expect(data).toHaveProperty('pagination')
  })

  it('should create new product', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token',
        'content-type': 'application/json'
      },
      body: {
        stock_code: 'TEST-001',
        name: 'Test Product',
        product_type_id: 'uuid-here'
      }
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(201)
    const data = JSON.parse(res._getData())
    expect(data.stock_code).toBe('TEST-001')
  })
})
```

### 8. Performance Optimization

#### Database Indexing
```sql
-- Essential indexes for performance
CREATE INDEX idx_products_stock_code ON products(stock_code);
CREATE INDEX idx_products_product_type ON products(product_type_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_recipe_details_recipe_id ON recipe_details(recipe_id);
CREATE INDEX idx_product_histories_product_id ON product_histories(product_id);
CREATE INDEX idx_product_histories_changed_at ON product_histories(changed_at);

-- Composite indexes for common queries
CREATE INDEX idx_products_type_brand ON products(product_type_id, brand_id);
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || stock_code));
```

#### Caching Strategy
```typescript
// /lib/cache/redis.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export async function getCachedData(key: string) {
  try {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

export async function setCachedData(key: string, data: any, ttl: number = 300) {
  try {
    await redis.setex(key, ttl, JSON.stringify(data))
  } catch (error) {
    console.error('Cache set error:', error)
  }
}

export async function invalidateCache(pattern: string) {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch (error) {
    console.error('Cache invalidation error:', error)
  }
}
```

### 9. Deployment Configuration

#### Docker Setup
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### Environment Variables
```bash
# .env.production
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
REDIS_URL=redis://localhost:6379
NODE_ENV=production
```

This comprehensive backend implementation guide provides everything needed to build a robust, scalable API for the TSmart Quality management system. The implementation follows modern best practices and is optimized for performance, security, and maintainability.

