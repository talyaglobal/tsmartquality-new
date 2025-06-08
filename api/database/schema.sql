-- TSmart Quality Management System Database Schema
-- Created: 2025-06-08
-- Description: Complete database schema with all tables, relationships, and indexes

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- COMPANIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    tax_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    last_login TIMESTAMP,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- =============================================
-- SELLERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS sellers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    contact_person VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    tax_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    UNIQUE(code, company_id)
);

-- =============================================
-- BRANDS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    description TEXT,
    logo_url VARCHAR(500),
    website VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    UNIQUE(code, company_id)
);

-- =============================================
-- PRODUCT GROUPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS product_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    description TEXT,
    parent_group_id INTEGER REFERENCES product_groups(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    UNIQUE(code, company_id)
);

-- =============================================
-- PRODUCT TYPES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS product_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    description TEXT,
    product_group_id INTEGER REFERENCES product_groups(id),
    specifications JSONB,
    quality_parameters JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    UNIQUE(code, company_id)
);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) NOT NULL,
    name VARCHAR(300) NOT NULL,
    barcode VARCHAR(100),
    qr_code VARCHAR(500),
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    seller_id INTEGER REFERENCES sellers(id),
    brand_id INTEGER REFERENCES brands(id),
    product_type_id INTEGER REFERENCES product_types(id),
    product_group_id INTEGER REFERENCES product_groups(id),
    description TEXT,
    specifications JSONB,
    
    -- Physical properties
    weight DECIMAL(10,3),
    length DECIMAL(10,3),
    width DECIMAL(10,3),
    height DECIMAL(10,3),
    volume DECIMAL(10,3),
    color VARCHAR(50),
    material VARCHAR(100),
    
    -- Business properties
    unit_price DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'USD',
    cost_price DECIMAL(12,2),
    
    -- Inventory properties
    critical_stock_amount INTEGER NOT NULL DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    reorder_point INTEGER,
    lead_time_days INTEGER,
    
    -- Quality properties
    quality_grade VARCHAR(10),
    shelf_life_days INTEGER,
    expiry_date DATE,
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    
    -- Status and metadata
    status VARCHAR(50) DEFAULT 'active',
    is_deleted BOOLEAN DEFAULT false,
    tags TEXT[],
    notes TEXT,
    
    -- Image and documents
    primary_image_url VARCHAR(500),
    images JSONB,
    documents JSONB,
    
    -- Timestamps and audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    -- Constraints
    UNIQUE(code, company_id),
    CHECK (weight >= 0),
    CHECK (volume >= 0),
    CHECK (unit_price >= 0),
    CHECK (cost_price >= 0),
    CHECK (critical_stock_amount >= 0),
    CHECK (current_stock >= 0)
);

-- =============================================
-- PRODUCT HISTORY TABLE (Audit Trail)
-- =============================================
CREATE TABLE IF NOT EXISTS product_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    field_changed VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_type VARCHAR(50) DEFAULT 'update', -- insert, update, delete, status_change
    change_reason TEXT,
    ip_address INET,
    user_agent TEXT,
    changed_by_user_id UUID REFERENCES users(id),
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- QUALITY CHECKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS quality_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    inspector_id UUID REFERENCES users(id),
    
    -- Check details
    check_type VARCHAR(100) NOT NULL, -- incoming, production, outgoing, random, scheduled
    check_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    batch_number VARCHAR(100),
    lot_number VARCHAR(100),
    sample_size INTEGER,
    
    -- Quality parameters
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, passed, failed, conditional
    overall_grade VARCHAR(10), -- A, B, C, D, F
    score DECIMAL(5,2), -- 0-100 score
    
    -- Specific checks
    visual_inspection JSONB, -- visual defects, appearance scores
    dimensional_check JSONB, -- measurements, tolerances
    functional_test JSONB, -- functionality tests
    material_analysis JSONB, -- material composition, properties
    safety_compliance JSONB, -- safety standards compliance
    
    -- Test results
    test_parameters JSONB, -- detailed test parameters and results
    measurements JSONB, -- numerical measurements
    defects_found TEXT[],
    corrective_actions TEXT[],
    
    -- Documentation
    notes TEXT,
    inspector_comments TEXT,
    images JSONB, -- inspection photos
    documents JSONB, -- inspection reports, certificates
    
    -- Compliance and standards
    standards_checked TEXT[], -- ISO, ANSI, etc.
    compliance_status VARCHAR(50), -- compliant, non_compliant, conditional
    certification_required BOOLEAN DEFAULT false,
    certificate_number VARCHAR(100),
    certificate_expiry DATE,
    
    -- Workflow
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    -- Constraints
    CHECK (score >= 0 AND score <= 100),
    CHECK (sample_size > 0)
);

-- =============================================
-- QUALITY CHECK TEMPLATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS quality_check_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    product_type_id INTEGER REFERENCES product_types(id),
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    check_type VARCHAR(100) NOT NULL,
    template_data JSONB NOT NULL, -- checklist items, parameters, thresholds
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- =============================================
-- PRODUCT CATEGORIES TABLE (for classification)
-- =============================================
CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    parent_category_id INTEGER REFERENCES product_categories(id),
    description TEXT,
    category_level INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    UNIQUE(code, company_id)
);

-- =============================================
-- PRODUCT CATEGORY MAPPING TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS product_category_mapping (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES product_categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, category_id)
);

-- =============================================
-- USER SESSIONS TABLE (for session management)
-- =============================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SYSTEM SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    is_system_wide BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES users(id),
    UNIQUE(setting_key, company_id)
);

-- =============================================
-- AUDIT LOG TABLE (General audit trail)
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    changed_fields TEXT[],
    user_id UUID REFERENCES users(id),
    company_id INTEGER REFERENCES companies(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_code_company ON products(code, company_id);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type_id);
CREATE INDEX IF NOT EXISTS idx_products_group ON products(product_group_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_not_deleted ON products(is_deleted) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Product history indexes
CREATE INDEX IF NOT EXISTS idx_product_history_product ON product_history(product_id);
CREATE INDEX IF NOT EXISTS idx_product_history_date ON product_history(change_date);
CREATE INDEX IF NOT EXISTS idx_product_history_user ON product_history(changed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_product_history_field ON product_history(field_changed);

-- Quality checks indexes
CREATE INDEX IF NOT EXISTS idx_quality_checks_product ON quality_checks(product_id);
CREATE INDEX IF NOT EXISTS idx_quality_checks_company ON quality_checks(company_id);
CREATE INDEX IF NOT EXISTS idx_quality_checks_inspector ON quality_checks(inspector_id);
CREATE INDEX IF NOT EXISTS idx_quality_checks_date ON quality_checks(check_date);
CREATE INDEX IF NOT EXISTS idx_quality_checks_status ON quality_checks(status);
CREATE INDEX IF NOT EXISTS idx_quality_checks_type ON quality_checks(check_type);

-- Companies indexes
CREATE INDEX IF NOT EXISTS idx_companies_code ON companies(code);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active);

-- Sellers and Brands indexes
CREATE INDEX IF NOT EXISTS idx_sellers_company ON sellers(company_id);
CREATE INDEX IF NOT EXISTS idx_sellers_code_company ON sellers(code, company_id);
CREATE INDEX IF NOT EXISTS idx_brands_company ON brands(company_id);
CREATE INDEX IF NOT EXISTS idx_brands_code_company ON brands(code, company_id);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_groups_updated_at BEFORE UPDATE ON product_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_types_updated_at BEFORE UPDATE ON product_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quality_checks_updated_at BEFORE UPDATE ON quality_checks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quality_check_templates_updated_at BEFORE UPDATE ON quality_check_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON product_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB := '{}';
    new_data JSONB := '{}';
    changed_fields TEXT[] := '{}';
BEGIN
    IF TG_OP = 'INSERT' THEN
        new_data := to_jsonb(NEW);
        INSERT INTO audit_logs (table_name, record_id, action, new_data, user_id, company_id)
        VALUES (TG_TABLE_NAME, NEW.id::TEXT, TG_OP, new_data, 
                COALESCE(NEW.created_by, NEW.updated_by), 
                CASE WHEN TG_TABLE_NAME = 'companies' THEN NEW.id ELSE NEW.company_id END);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
        -- Get changed fields (simplified)
        SELECT array_agg(key) INTO changed_fields
        FROM jsonb_each(old_data) o
        JOIN jsonb_each(new_data) n ON o.key = n.key
        WHERE o.value IS DISTINCT FROM n.value;
        
        INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, changed_fields, user_id, company_id)
        VALUES (TG_TABLE_NAME, NEW.id::TEXT, TG_OP, old_data, new_data, changed_fields,
                COALESCE(NEW.updated_by, NEW.created_by),
                CASE WHEN TG_TABLE_NAME = 'companies' THEN NEW.id ELSE NEW.company_id END);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        INSERT INTO audit_logs (table_name, record_id, action, old_data, user_id, company_id)
        VALUES (TG_TABLE_NAME, OLD.id::TEXT, TG_OP, old_data,
                COALESCE(OLD.updated_by, OLD.created_by),
                CASE WHEN TG_TABLE_NAME = 'companies' THEN OLD.id ELSE OLD.company_id END);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Enable audit triggers for important tables
CREATE TRIGGER audit_companies AFTER INSERT OR UPDATE OR DELETE ON companies FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON products FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_quality_checks AFTER INSERT OR UPDATE OR DELETE ON quality_checks FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE companies IS 'Master table for company information and multi-tenancy';
COMMENT ON TABLE users IS 'User accounts with authentication and authorization details';
COMMENT ON TABLE products IS 'Main products table with comprehensive product information';
COMMENT ON TABLE product_history IS 'Audit trail for all product changes';
COMMENT ON TABLE quality_checks IS 'Quality control checks and inspections';
COMMENT ON TABLE quality_check_templates IS 'Reusable templates for quality checks';
COMMENT ON TABLE sellers IS 'Supplier/seller information';
COMMENT ON TABLE brands IS 'Product brand information';
COMMENT ON TABLE product_groups IS 'Hierarchical product groupings';
COMMENT ON TABLE product_types IS 'Product type definitions with specifications';
COMMENT ON TABLE product_categories IS 'Product categorization system';
COMMENT ON TABLE user_sessions IS 'Active user session management';
COMMENT ON TABLE system_settings IS 'Application configuration settings';
COMMENT ON TABLE audit_logs IS 'System-wide audit trail for all changes';

-- Schema creation completed
SELECT 'TSmart Quality Management System database schema created successfully' AS status;