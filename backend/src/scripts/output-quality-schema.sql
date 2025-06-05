-- Output Quality Integration Schema
-- This schema defines the tables for linking production outputs with quality checks

-- Output Quality Checks Table (for linking outputs and quality checks)
CREATE TABLE IF NOT EXISTS output_quality_checks (
    id SERIAL PRIMARY KEY,
    production_output_id INT REFERENCES production_outputs(id),
    quality_check_id INT REFERENCES production_quality_checks(id),
    status BOOLEAN DEFAULT TRUE,
    company_id INT REFERENCES companies(id),
    created_by INT REFERENCES users(id),
    updated_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_output_quality_checks_output_id ON output_quality_checks(production_output_id);
CREATE INDEX IF NOT EXISTS idx_output_quality_checks_check_id ON output_quality_checks(quality_check_id);
CREATE INDEX IF NOT EXISTS idx_output_quality_checks_company_id ON output_quality_checks(company_id);

-- Add quality status column to production_outputs if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'production_outputs' 
                   AND column_name = 'quality_status') THEN
        ALTER TABLE production_outputs ADD COLUMN quality_status VARCHAR(50) DEFAULT 'pending_inspection';
    END IF;
END$$;