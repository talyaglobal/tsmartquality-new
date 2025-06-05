# Production Planning API Documentation

This document outlines the production planning functionality in the TSmart Quality Management System API.

## Overview

The production planning module allows users to create and manage production plans, orders, stages, and resources. It provides a comprehensive way to schedule and track production activities, allocate resources, and monitor progress.

## Features

- **Production Plans**: Create and manage high-level production plans with start/end dates
- **Production Orders**: Schedule specific production tasks within plans
- **Production Stages**: Break down orders into sequential stages for better tracking
- **Resource Management**: Assign and track resources (equipment, personnel, etc.) for production
- **Material Requirements**: Track materials needed for production
- **Output Tracking**: Record production outputs and quality status

## Database Schema

The production planning functionality is supported by the following tables:

- `production_plans`: High-level production plans
- `production_orders`: Specific production tasks
- `production_stages`: Sequential stages of production
- `production_resources`: Resources available for production
- `production_stage_resources`: Resources allocated to stages
- `production_order_materials`: Materials required for production
- `production_outputs`: Finished products from production
- `production_quality_checks`: Quality checks performed during production
- `production_resource_availability_logs`: Resource availability history
- `production_order_status_history`: Order status change history

## API Endpoints

### Production Plans

- `GET /api/v1/production-plans`: List all production plans with filtering options
- `GET /api/v1/production-plans/:id`: Get a specific production plan with details
- `POST /api/v1/production-plans`: Create a new production plan
- `PUT /api/v1/production-plans/:id`: Update an existing production plan
- `PUT /api/v1/production-plans/status/:id`: Update the status of a production plan
- `DELETE /api/v1/production-plans/:id`: Soft delete a production plan

### Production Orders

- `GET /api/v1/production-orders`: List all production orders with filtering options
- `GET /api/v1/production-orders/:id`: Get a specific production order with details
- `POST /api/v1/production-orders`: Create a new production order
- `PUT /api/v1/production-orders/:id`: Update an existing production order
- `PUT /api/v1/production-orders/status/:id`: Update the status of a production order
- `DELETE /api/v1/production-orders/:id`: Soft delete a production order
- `GET /api/v1/production-orders/:id/materials`: Get materials for a production order
- `POST /api/v1/production-orders/:id/materials`: Add materials to a production order

### Production Stages

- `GET /api/v1/production-stages`: List all production stages with filtering options
- `GET /api/v1/production-stages/:id`: Get a specific production stage with details
- `POST /api/v1/production-stages`: Create a new production stage
- `PUT /api/v1/production-stages/:id`: Update an existing production stage
- `PUT /api/v1/production-stages/status/:id`: Update the status of a production stage
- `DELETE /api/v1/production-stages/:id`: Soft delete a production stage
- `POST /api/v1/production-stages/:id/resources`: Add resources to a production stage
- `DELETE /api/v1/production-stages/:stageId/resources/:resourceId`: Remove a resource from a stage

### Production Resources

- `GET /api/v1/production-resources`: List all production resources with filtering options
- `GET /api/v1/production-resources/:id`: Get a specific production resource
- `POST /api/v1/production-resources`: Create a new production resource
- `PUT /api/v1/production-resources/:id`: Update an existing production resource
- `DELETE /api/v1/production-resources/:id`: Soft delete a production resource
- `GET /api/v1/production-resources/types`: Get all resource types
- `PUT /api/v1/production-resources/:id/availability`: Update resource availability
- `GET /api/v1/production-resources/:id/availability-history`: Get resource availability history

## Status Workflows

### Production Plan Status

- `draft` → `active` → `completed` / `cancelled`
- Plans start as drafts, are activated when ready, and are completed when all orders are done

### Production Order Status

- `draft` → `pending` → `in_progress` → `completed` / `cancelled`
- Orders are created as drafts, move to pending when ready to start, in_progress when started, and completed when done

### Production Stage Status

- `pending` → `in_progress` → `completed` / `cancelled`
- Stages start as pending, move to in_progress when started, and are completed when done

## Integration with Other Modules

- **Inventory Management**: Production uses materials from inventory and produces outputs that go into inventory
- **Recipe Management**: Production orders can be based on recipes
- **Quality Control**: Production stages can require quality checks

## Multi-Tenancy

All production planning entities include `company_id` for multi-tenant support, ensuring users only see and manage their own company's data.

## Access Control

- **Admin**: Full access to all production planning functionality
- **Manager**: Full access to production planning within their company
- **QualityManager**: View access to all production data, update access to quality checks
- **Operator**: View access to assigned production orders and stages

## Implementation Notes

- All entities use soft deletion (setting `status` to `false`)
- Proper validation is implemented for all endpoints
- Status transitions are strictly controlled to maintain data integrity
- Progress tracking is available for orders and stages
- Historical logs are maintained for important status changes