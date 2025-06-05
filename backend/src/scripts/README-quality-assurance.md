# Quality Assurance API Documentation

This document outlines the quality assurance functionality in the TSmart Quality Management System API.

## Overview

The quality assurance module allows users to perform quality checks on production stages, maintain quality templates, track quality issues, and ensure that all products meet the required quality standards.

## Features

- **Production Quality Checks**: Perform quality checks on production stages
- **Quality Check Items**: Track detailed parameters for each quality check
- **Quality Templates**: Define reusable templates for different product types
- **Product Quality Checks**: Perform standalone quality checks on products
- **Quality Issues**: Track and resolve quality-related issues

## Database Schema

The quality assurance functionality is supported by the following tables:

- `production_quality_checks`: Quality checks performed on production stages
- `quality_check_items`: Detailed parameters for each quality check
- `quality_templates`: Reusable templates for quality checks
- `quality_template_items`: Parameters defined in quality templates
- `product_quality_checks`: Standalone quality checks on products
- `product_quality_check_items`: Parameters for product quality checks
- `quality_issues`: Tracking of quality-related issues
- `quality_issue_comments`: Comments on quality issues

## API Endpoints

### Quality Checks

- `GET /api/v1/quality-checks`: List all quality checks with filtering options
- `GET /api/v1/quality-checks/:id`: Get a specific quality check with details
- `POST /api/v1/quality-checks`: Create a new quality check
- `PUT /api/v1/quality-checks/:id`: Update an existing quality check
- `DELETE /api/v1/quality-checks/:id`: Soft delete a quality check
- `GET /api/v1/quality-checks/stage/:stageId`: Get quality checks for a production stage
- `GET /api/v1/quality-checks/order/:orderId`: Get quality checks for a production order
- `POST /api/v1/quality-checks/:id/items`: Add or update quality check items
- `DELETE /api/v1/quality-checks/:checkId/items/:itemId`: Remove a quality check item

### Quality Templates (Future Implementation)

- `GET /api/v1/quality-templates`: List all quality templates
- `GET /api/v1/quality-templates/:id`: Get a specific quality template with details
- `POST /api/v1/quality-templates`: Create a new quality template
- `PUT /api/v1/quality-templates/:id`: Update an existing quality template
- `DELETE /api/v1/quality-templates/:id`: Soft delete a quality template
- `POST /api/v1/quality-templates/:id/items`: Add items to a quality template
- `DELETE /api/v1/quality-templates/:templateId/items/:itemId`: Remove an item from a template

### Product Quality Checks (Future Implementation)

- `GET /api/v1/product-quality-checks`: List all product quality checks
- `GET /api/v1/product-quality-checks/:id`: Get a specific product quality check
- `POST /api/v1/product-quality-checks`: Create a new product quality check
- `PUT /api/v1/product-quality-checks/:id`: Update an existing product quality check
- `DELETE /api/v1/product-quality-checks/:id`: Soft delete a product quality check

### Quality Issues (Future Implementation)

- `GET /api/v1/quality-issues`: List all quality issues
- `GET /api/v1/quality-issues/:id`: Get a specific quality issue with details
- `POST /api/v1/quality-issues`: Create a new quality issue
- `PUT /api/v1/quality-issues/:id`: Update an existing quality issue
- `POST /api/v1/quality-issues/:id/comments`: Add a comment to a quality issue
- `DELETE /api/v1/quality-issues/:id`: Soft delete a quality issue

## Integration with Other Modules

- **Production Planning**: Quality checks are performed on production stages
- **Product Management**: Quality checks can be linked to specific products
- **User Management**: Quality checks and issues are assigned to users

## Multi-Tenancy

All quality assurance entities include `company_id` for multi-tenant support, ensuring users only see and manage their own company's data.

## Access Control

- **Admin**: Full access to all quality assurance functionality
- **Manager**: Full access to quality assurance within their company
- **QualityManager**: Full access to quality assurance within their company
- **Operator**: View access to quality checks for their assigned tasks

## Implementation Notes

- All entities use soft deletion (setting `status` to `false`)
- Proper validation is implemented for all endpoints
- Quality checks can be created manually or from templates
- Quality check results are used to update production stage quality approval status
- Quality issues can be tracked and assigned to responsible users for resolution