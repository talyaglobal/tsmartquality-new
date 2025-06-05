# TSmart Quality Database Setup

This document provides instructions for setting up the database for the TSmart Quality project.

## Project Information

- **Project Name:** tsmartquality-new
- **Team:** tsmart
- **Admin User:** info@tsmart.ai
- **Supabase URL:** https://fqxcnvygqgrljycigirt.supabase.co

## Files

1. `database-schema.sql` - Contains the SQL to create all tables and relationships
2. `sample-data.sql` - Contains SQL to populate the tables with 100 sample records each

## Setup Instructions

### 1. Set Up Tables

1. Login to the Supabase dashboard at https://app.supabase.com/
2. Select your project (tsmartquality-new)
3. Go to the SQL Editor
4. Create a new query
5. Copy and paste the contents of `database-schema.sql`
6. Run the query

This will create all the required tables with proper relationships.

### 2. Add Sample Data

1. In the SQL Editor, create another new query
2. Copy and paste the contents of `sample-data.sql`
3. Run the query

This will populate all tables with 100 sample records each.

### 3. Verify the Setup

Run the following SQL to verify that data was inserted correctly:

```sql
-- Check company count
SELECT COUNT(*) FROM companies;

-- Check product count
SELECT COUNT(*) FROM products;

-- Sample join query to verify relationships
SELECT 
    p.id, 
    p.name AS product_name, 
    b.name AS brand_name,
    pg.name AS product_group,
    COUNT(ph.id) AS photo_count
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN product_groups pg ON p.product_group_id = pg.id
LEFT JOIN photos ph ON ph.product_id = p.id
GROUP BY p.id, p.name, b.name, pg.name
LIMIT 10;
```

## Table Structure

The database includes the following main tables:

- `companies` - Company information
- `users` - User accounts (linked to Supabase auth)
- `products` - Core product information
- `customers` - Customer information
- `brands`, `product_groups`, `product_types` - Classification tables
- `sellers` - Seller information
- `recipes`, `recipe_details` - Recipe management
- `specs`, `spec_details` - Product specifications
- `photos` - Product photos
- `roles`, `groups` - Access control

Each table includes standard fields:
- `id` - Primary key
- `status` - Active/inactive flag
- `created_at`, `updated_at` - Timestamps
- `created_by`, `updated_by` - User references

## Connecting to the Database

The frontend application connects to Supabase using the following environment variables:

```
VITE_SUPABASE_URL=https://fqxcnvygqgrljycigirt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxeGNudnlncWdybGp5Y2lnaXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODg1NzQsImV4cCI6MjA2NDY2NDU3NH0.0smoLW1Pw52zXUFibQvQnv-ToEa3YmUEn_vc-zttKDQ
```

These are already set up in the project's `.env` file.