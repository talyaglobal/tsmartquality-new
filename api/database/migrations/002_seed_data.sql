-- Migration: 002_seed_data
-- Description: Insert essential seed data
-- Created: 2025-06-08
-- Dependencies: 001_initial_schema

-- Insert default company
INSERT INTO companies (id, name, code, address, email, is_active) 
VALUES (1001, 'TalYa Smart Quality', 'TALYA', 'Istanbul, Turkey', 'info@talyasmart.com', true)
ON CONFLICT (id) DO NOTHING;

-- Insert system admin user
INSERT INTO users (
    id, username, name, surname, email, password, company_id, role, is_active, email_verified
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin',
    'System',
    'Administrator', 
    'admin@talyasmart.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    1001,
    'admin',
    true,
    true
) ON CONFLICT (id) DO NOTHING;

-- Insert default sellers
INSERT INTO sellers (id, name, code, company_id, contact_person, is_active, created_by) VALUES
(1, 'Default Supplier', 'SUP001', 1001, 'Contact Person', true, '00000000-0000-0000-0000-000000000001'),
(2, 'Premium Suppliers Ltd.', 'SUP002', 1001, 'Sales Manager', true, '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Insert default brands  
INSERT INTO brands (id, name, code, company_id, description, is_active, created_by) VALUES
(1, 'TalYa Quality', 'TQ001', 1001, 'Premium quality products', true, '00000000-0000-0000-0000-000000000001'),
(2, 'Standard Brand', 'STD001', 1001, 'Standard quality products', true, '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Insert default product groups
INSERT INTO product_groups (id, name, code, company_id, description, is_active, created_by) VALUES
(1, 'Electronics', 'ELEC', 1001, 'Electronic products and components', true, '00000000-0000-0000-0000-000000000001'),
(2, 'Mechanical Parts', 'MECH', 1001, 'Mechanical components and parts', true, '00000000-0000-0000-0000-000000000001'),
(3, 'Raw Materials', 'RAW', 1001, 'Raw materials and supplies', true, '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Insert default product types
INSERT INTO product_types (id, name, code, company_id, product_group_id, description, is_active, created_by) VALUES
(1, 'Electronic Components', 'COMP', 1001, 1, 'Electronic components and circuits', true, '00000000-0000-0000-0000-000000000001'),
(2, 'Mechanical Components', 'MCOMP', 1001, 2, 'Mechanical parts and assemblies', true, '00000000-0000-0000-0000-000000000001'),
(3, 'Raw Material Items', 'RMAT', 1001, 3, 'Basic raw materials', true, '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Insert default product categories
INSERT INTO product_categories (id, name, code, company_id, description, is_active, created_by) VALUES
(1, 'Quality Grade A', 'QGA', 1001, 'Highest quality grade products', true, '00000000-0000-0000-0000-000000000001'),
(2, 'Quality Grade B', 'QGB', 1001, 'Standard quality grade products', true, '00000000-0000-0000-0000-000000000001'),
(3, 'Quality Grade C', 'QGC', 1001, 'Basic quality grade products', true, '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (company_id, setting_key, setting_value, setting_type, description, is_system_wide) VALUES
(1001, 'default_currency', 'USD', 'string', 'Default currency for pricing', false),
(1001, 'quality_check_retention_days', '365', 'number', 'Days to retain quality check records', false),
(1001, 'auto_quality_check', 'true', 'boolean', 'Automatically create quality checks for new products', false),
(1001, 'notification_email', 'quality@talyasmart.com', 'string', 'Email for quality notifications', false),
(NULL, 'system_version', '1.0.0', 'string', 'Current system version', true),
(NULL, 'maintenance_mode', 'false', 'boolean', 'System maintenance mode', true),
(NULL, 'max_file_upload_size', '10485760', 'number', 'Maximum file upload size in bytes (10MB)', true)
ON CONFLICT (setting_key, company_id) DO NOTHING;

-- Insert sample quality check template
INSERT INTO quality_check_templates (
    id, name, product_type_id, company_id, check_type, template_data, is_active, created_by
) VALUES (
    uuid_generate_v4(),
    'Standard Electronic Component Check',
    1,
    1001,
    'incoming',
    '{
        "checklist": [
            {"item": "Visual Inspection", "required": true, "type": "boolean"},
            {"item": "Dimensional Check", "required": true, "type": "measurement"},
            {"item": "Electrical Test", "required": true, "type": "test"},
            {"item": "Packaging Condition", "required": false, "type": "boolean"}
        ],
        "parameters": [
            {"name": "Length", "unit": "mm", "min_value": 0, "max_value": 1000},
            {"name": "Width", "unit": "mm", "min_value": 0, "max_value": 1000},
            {"name": "Resistance", "unit": "ohm", "min_value": 0, "max_value": 10000}
        ],
        "pass_criteria": {
            "min_score": 80,
            "required_items": ["Visual Inspection", "Dimensional Check"]
        }
    }',
    true,
    '00000000-0000-0000-0000-000000000001'
);

-- Record this migration
INSERT INTO schema_migrations (version, name, description, checksum) 
VALUES ('002', 'seed_data', 'Insert essential seed data for system operation', 
        encode(digest('002_seed_data', 'sha256'), 'hex'))
ON CONFLICT (version) DO NOTHING;