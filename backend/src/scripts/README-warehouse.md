# Warehouse Management Implementation

This module implements comprehensive warehouse management functionality for the TSmart Quality system. It provides a complete solution for tracking inventory across warehouses, locations, and shelves, with full movement history and reporting capabilities.

## Features

1. **Hierarchical Structure**
   - Warehouses
   - Locations within warehouses
   - Shelves within locations

2. **Inventory Management**
   - Track inventory of products, raw materials, and semi-products
   - Support for lot and batch tracking
   - Expiry date management
   - Status tracking (available, reserved, damaged, expired)

3. **Movement Tracking**
   - Complete movement history for all inventory items
   - Support for different movement types:
     - Incoming stock
     - Outgoing stock
     - Transfers between locations
     - Inventory adjustments
   - Reference numbers and notes for each movement

4. **Reporting**
   - Inventory summary by warehouse, location, and shelf
   - Movement history and reports
   - Filtering and searching capabilities

## Database Schema

The following tables were created to support warehouse management:

1. **warehouse_locations**
   - Manages locations within warehouses
   - Tracks capacity and status of each location

2. **warehouse_shelves**
   - Manages shelves within locations
   - Includes positional information (row, column)

3. **warehouse_inventory**
   - Tracks inventory items across warehouses, locations, and shelves
   - Supports different item types (products, raw materials, semi-products)
   - Includes lot, batch, and expiry tracking

4. **warehouse_movements**
   - Records all inventory movements
   - Maintains complete history for auditing and reporting

## API Endpoints

### Warehouse Management

```
# Warehouse Endpoints
GET    /api/v1/warehouses                 - Get all warehouses
GET    /api/v1/warehouses/:id             - Get warehouse by ID
POST   /api/v1/warehouses                 - Create a new warehouse
PUT    /api/v1/warehouses/update          - Update a warehouse
GET    /api/v1/warehouses/remove/:id      - Delete a warehouse (soft delete)
GET    /api/v1/warehouses/details/:id     - Get warehouse with detailed information
GET    /api/v1/warehouses/withdetails     - Get all warehouses with detailed information
GET    /api/v1/warehouses/filter          - Get warehouses with filtered search
GET    /api/v1/warehouses/bycountry/:countryId - Get warehouses by country

# Warehouse Location Endpoints
GET    /api/v1/warehouse-locations                 - Get all warehouse locations
GET    /api/v1/warehouse-locations/:id             - Get warehouse location by ID
POST   /api/v1/warehouse-locations                 - Create a new warehouse location
PUT    /api/v1/warehouse-locations/update          - Update a warehouse location
GET    /api/v1/warehouse-locations/remove/:id      - Delete a warehouse location (soft delete)
GET    /api/v1/warehouse-locations/warehouse/:warehouseId - Get locations by warehouse ID
GET    /api/v1/warehouse-locations/details/:id     - Get location with detailed information
GET    /api/v1/warehouse-locations/filter          - Get locations with filtered search

# Warehouse Shelves Endpoints
GET    /api/v1/warehouse-shelves                 - Get all warehouse shelves
GET    /api/v1/warehouse-shelves/:id             - Get warehouse shelf by ID
POST   /api/v1/warehouse-shelves                 - Create a new warehouse shelf
PUT    /api/v1/warehouse-shelves/update          - Update a warehouse shelf
GET    /api/v1/warehouse-shelves/remove/:id      - Delete a warehouse shelf (soft delete)
GET    /api/v1/warehouse-shelves/location/:locationId - Get shelves by location ID
GET    /api/v1/warehouse-shelves/details/:id     - Get shelf with detailed information
GET    /api/v1/warehouse-shelves/filter          - Get shelves with filtered search

# Inventory Endpoints
GET    /api/v1/inventory                 - Get all inventory items
GET    /api/v1/inventory/:id             - Get inventory item by ID
POST   /api/v1/inventory                 - Create a new inventory item
PUT    /api/v1/inventory/update          - Update an inventory item
GET    /api/v1/inventory/remove/:id      - Delete an inventory item (soft delete)
GET    /api/v1/inventory/warehouse/:warehouseId - Get inventory by warehouse
GET    /api/v1/inventory/location/:locationId   - Get inventory by location
GET    /api/v1/inventory/product/:productId     - Get inventory by product
GET    /api/v1/inventory/filter          - Get filtered inventory
GET    /api/v1/inventory/summary         - Get inventory summary

# Movement Tracking Endpoints
GET    /api/v1/inventory-movements                 - Get all movement history
GET    /api/v1/inventory-movements/:id             - Get movement by ID
POST   /api/v1/inventory-movements                 - Create a new movement record
GET    /api/v1/inventory-movements/warehouse/:warehouseId - Get movements by warehouse
GET    /api/v1/inventory-movements/item/:itemType/:itemId - Get movements by product, raw material, or semi-product
GET    /api/v1/inventory-movements/filter          - Get movement history with filtering
GET    /api/v1/inventory-movements/report          - Get movement report (aggregated summary)
```

## Implementation Details

1. **Controllers**
   - `warehouse.controller.ts` - CRUD operations for warehouses
   - `warehouseLocation.controller.ts` - CRUD operations for locations
   - `warehouseShelf.controller.ts` - CRUD operations for shelves
   - `warehouseInventory.controller.ts` - Inventory management
   - `warehouseMovement.controller.ts` - Movement tracking and history

2. **Routes**
   - Corresponding route files with validation and authentication
   - Role-based access control for all endpoints

3. **SQL Scripts**
   - `warehouse-location-schema.sql` - Creates the required database tables and indexes

## Features

### Multi-tenancy Support
All warehouse management functionality includes multi-tenancy support via the `company_id` field, ensuring data isolation between different companies using the system.

### Role-Based Access Control
All endpoints are protected with appropriate role-based access control:
- Admin/Manager: Full access to create, update, and delete operations
- User: Read-only access to view inventory and movements

### Validation
Comprehensive validation is implemented to ensure data integrity:
- Input validation for all API endpoints
- Business logic validation (e.g., preventing deletion of locations with inventory)
- Reference integrity validation

### Soft Deletion
All entities follow the soft deletion pattern, maintaining historical data while preventing accidental data loss.

## Setup Instructions

1. Run the database migration script:
   ```
   psql -U postgres -d your_database_name -f ./src/scripts/warehouse-location-schema.sql
   ```

2. Restart the application to load the new routes

## Example Usage

### Creating a Warehouse
```json
POST /api/v1/warehouses
{
  "name": "Main Distribution Center",
  "code": "MDC-001",
  "address": "123 Warehouse St, City",
  "country_id": 1
}
```

### Adding a Location
```json
POST /api/v1/warehouse-locations
{
  "name": "Zone A",
  "code": "ZA-001",
  "warehouse_id": 1,
  "floor_level": 1,
  "aisle": "A",
  "capacity": 1000
}
```

### Adding Inventory
```json
POST /api/v1/inventory
{
  "warehouse_id": 1,
  "location_id": 1,
  "shelf_id": 1,
  "product_id": 100,
  "quantity": 50,
  "unit": "pcs",
  "lot_number": "LOT-2023-001",
  "batch_number": "B001",
  "expiry_date": "2024-12-31T00:00:00Z"
}
```

### Recording a Movement
```json
POST /api/v1/inventory-movements
{
  "product_id": 100,
  "from_warehouse_id": 1,
  "to_warehouse_id": 2,
  "quantity": 10,
  "unit": "pcs",
  "movement_type": "transfer",
  "lot_number": "LOT-2023-001",
  "batch_number": "B001",
  "notes": "Transferring stock to another warehouse"
}
```