-- Quality Assurance Database Schema
-- This schema defines the tables for managing quality checks and assurance

-- Quality Checks Table
CREATE TABLE IF NOT EXISTS production_quality_checks (
    id SERIAL PRIMARY KEY,
    production_stage_id INT REFERENCES production_stages(id),
    checked_by INT REFERENCES users(id),
    check_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    passed BOOLEAN,
    notes TEXT,
    status BOOLEAN DEFAULT TRUE,
    company_id INT REFERENCES companies(id),
    created_by INT REFERENCES users(id),
    updated_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Quality Check Items Table (for detailed check parameters)
CREATE TABLE IF NOT EXISTS quality_check_items (
    id SERIAL PRIMARY KEY,
    quality_check_id INT REFERENCES production_quality_checks(id),
    parameter VARCHAR(255) NOT NULL,
    expected_value TEXT,
    actual_value TEXT,
    unit_of_measure VARCHAR(50),
    passed BOOLEAN,
    notes TEXT,
    status BOOLEAN DEFAULT TRUE,
    company_id INT REFERENCES companies(id),
    created_by INT REFERENCES users(id),
    updated_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Quality Templates Table (for reusable quality check templates)
CREATE TABLE IF NOT EXISTS quality_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    product_type_id INT REFERENCES product_types(id),
    status BOOLEAN DEFAULT TRUE,
    company_id INT REFERENCES companies(id),
    created_by INT REFERENCES users(id),
    updated_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Quality Template Items Table (parameters for templates)
CREATE TABLE IF NOT EXISTS quality_template_items (
    id SERIAL PRIMARY KEY,
    template_id INT REFERENCES quality_templates(id),
    parameter VARCHAR(255) NOT NULL,
    expected_value TEXT,
    unit_of_measure VARCHAR(50),
    importance VARCHAR(50) DEFAULT 'required', -- required, recommended, optional
    notes TEXT,
    status BOOLEAN DEFAULT TRUE,
    company_id INT REFERENCES companies(id),
    created_by INT REFERENCES users(id),
    updated_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Product Quality Checks (not tied to production)
CREATE TABLE IF NOT EXISTS product_quality_checks (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id),
    lot_number VARCHAR(100),
    batch_number VARCHAR(100),
    checked_by INT REFERENCES users(id),
    check_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    passed BOOLEAN,
    notes TEXT,
    status BOOLEAN DEFAULT TRUE,
    company_id INT REFERENCES companies(id),
    created_by INT REFERENCES users(id),
    updated_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Product Quality Check Items
CREATE TABLE IF NOT EXISTS product_quality_check_items (
    id SERIAL PRIMARY KEY,
    quality_check_id INT REFERENCES product_quality_checks(id),
    parameter VARCHAR(255) NOT NULL,
    expected_value TEXT,
    actual_value TEXT,
    unit_of_measure VARCHAR(50),
    passed BOOLEAN,
    notes TEXT,
    status BOOLEAN DEFAULT TRUE,
    company_id INT REFERENCES companies(id),
    created_by INT REFERENCES users(id),
    updated_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Quality Issues Table
CREATE TABLE IF NOT EXISTS quality_issues (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    product_id INT REFERENCES products(id),
    lot_number VARCHAR(100),
    batch_number VARCHAR(100),
    production_order_id INT REFERENCES production_orders(id),
    severity VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
    status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
    reported_by INT REFERENCES users(id),
    assigned_to INT REFERENCES users(id),
    resolution TEXT,
    resolution_date TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    company_id INT REFERENCES companies(id),
    created_by INT REFERENCES users(id),
    updated_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Quality Issue Comments
CREATE TABLE IF NOT EXISTS quality_issue_comments (
    id SERIAL PRIMARY KEY,
    issue_id INT REFERENCES quality_issues(id),
    comment TEXT NOT NULL,
    status BOOLEAN DEFAULT TRUE,
    company_id INT REFERENCES companies(id),
    created_by INT REFERENCES users(id),
    updated_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quality_checks_stage_id ON production_quality_checks(production_stage_id);
CREATE INDEX IF NOT EXISTS idx_quality_checks_company_id ON production_quality_checks(company_id);
CREATE INDEX IF NOT EXISTS idx_quality_checks_passed ON production_quality_checks(passed);
CREATE INDEX IF NOT EXISTS idx_quality_check_items_check_id ON quality_check_items(quality_check_id);
CREATE INDEX IF NOT EXISTS idx_quality_templates_company_id ON quality_templates(company_id);
CREATE INDEX IF NOT EXISTS idx_quality_template_items_template_id ON quality_template_items(template_id);
CREATE INDEX IF NOT EXISTS idx_product_quality_checks_product_id ON product_quality_checks(product_id);
CREATE INDEX IF NOT EXISTS idx_product_quality_checks_company_id ON product_quality_checks(company_id);
CREATE INDEX IF NOT EXISTS idx_product_quality_check_items_check_id ON product_quality_check_items(quality_check_id);
CREATE INDEX IF NOT EXISTS idx_quality_issues_product_id ON quality_issues(product_id);
CREATE INDEX IF NOT EXISTS idx_quality_issues_production_order_id ON quality_issues(production_order_id);
CREATE INDEX IF NOT EXISTS idx_quality_issues_status ON quality_issues(status);
CREATE INDEX IF NOT EXISTS idx_quality_issues_company_id ON quality_issues(company_id);
CREATE INDEX IF NOT EXISTS idx_quality_issue_comments_issue_id ON quality_issue_comments(issue_id);