# Production Output and Quality Integration Documentation

This document outlines the integration between production outputs and quality checks in the TSmart Quality Management System API.

## Overview

The production output and quality integration allows for tracking the relationship between production outputs and quality checks. This integration enables quality assurance personnel to:

1. Record production outputs from manufacturing processes
2. Link quality checks to specific production outputs
3. Update output quality status based on quality check results
4. Track inventory movements for quality-approved outputs

## Features

- **Production Output Tracking**: Record and manage outputs from production orders
- **Quality Check Integration**: Link quality checks to specific production outputs
- **Inventory Management**: Automatically update inventory based on quality-approved outputs
- **Lot and Batch Tracking**: Track outputs by lot and batch numbers for traceability
- **Quality Status Management**: Manage and update output quality status

## Database Schema

The integration is supported by the following tables:

- `production_outputs`: Records of produced items from production orders
- `production_quality_checks`: Quality checks performed on production stages
- `output_quality_checks`: Linking table between outputs and quality checks
- `warehouse_inventory`: Inventory records for tracking output storage
- `warehouse_movements`: Records of inventory movements for outputs

## Quality Status Workflow

Production outputs follow this quality status workflow:

1. `pending_inspection`: Initial status when output is recorded
2. `passed`: Output passed quality checks and is approved
3. `failed`: Output failed quality checks and requires attention
4. `rework`: Output needs rework before re-inspection

## API Endpoints

### Production Outputs

- `GET /api/v1/production-outputs`: List all production outputs with filtering options
- `GET /api/v1/production-outputs/:id`: Get a specific production output with details
- `POST /api/v1/production-outputs`: Create a new production output
- `PUT /api/v1/production-outputs/:id`: Update an existing production output
- `DELETE /api/v1/production-outputs/:id`: Soft delete a production output

### Output-Quality Integration

- `POST /api/v1/production-outputs/:id/quality-checks`: Link a quality check to an output
- `DELETE /api/v1/production-outputs/:id/quality-checks/:checkId`: Unlink a quality check from an output
- `GET /api/v1/production-outputs/:id/quality-checks`: Get quality checks for an output

## Integration with Other Modules

- **Production Planning**: Outputs are created from production orders
- **Quality Assurance**: Quality checks are linked to outputs to determine quality status
- **Warehouse Management**: Quality-approved outputs are added to inventory
- **Inventory Tracking**: Inventory movements are recorded for output storage

## Implementation Details

### Creating Production Outputs

When creating a production output:

1. The output is linked to a specific production order
2. The initial quality status is set to `pending_inspection`
3. If warehouse and location are specified, the output will be added to inventory once quality is approved

### Linking Quality Checks

To link a quality check to an output:

1. The quality check must belong to a stage in the same production order as the output
2. The output's quality status is updated based on the quality check result
3. Multiple quality checks can be linked to a single output

### Inventory Management

For quality-approved outputs:

1. Outputs with `passed` quality status are added to inventory at the specified location
2. Inventory movements are recorded for traceability
3. If the output quality status changes, inventory is adjusted accordingly

## Multi-Tenancy and Access Control

- All entities include `company_id` for multi-tenant support
- Access control is enforced through role-based permissions:
  - **Admin**: Full access to all output and quality functionality
  - **Manager**: Full access within their company
  - **QualityManager**: Can view all outputs and link/unlink quality checks
  - **Operator**: Limited to viewing assigned outputs

## Best Practices

1. Always link quality checks to outputs as soon as they're performed
2. Update output quality status promptly after inspection
3. Record lot and batch numbers for complete traceability
4. Specify warehouse and location for all production outputs
5. Follow the quality status workflow to ensure proper inventory management