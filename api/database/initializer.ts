import { DatabaseConnection } from './connection';
import { PoolClient } from 'pg';
import bcrypt from 'bcrypt';

export interface InitializationOptions {
  runMigrations?: boolean;
  skipSeedData?: boolean;
  createSampleData?: boolean;
  adminEmail?: string;
  adminPassword?: string;
  companyName?: string;
}

export interface InitializationResult {
  success: boolean;
  migrationsRun: number;
  seedDataCreated: boolean;
  sampleDataCreated: boolean;
  adminUserCreated: boolean;
  errors: string[];
  duration: number;
}

export class DatabaseInitializer {
  private db: DatabaseConnection;
  private logger: any;

  constructor(db: DatabaseConnection, logger?: any) {
    this.db = db;
    this.logger = logger || console;
  }

  /**
   * Initialize database with schema, migrations, and seed data
   */
  async initialize(options: InitializationOptions = {}): Promise<InitializationResult> {
    const startTime = Date.now();
    const result: InitializationResult = {
      success: false,
      migrationsRun: 0,
      seedDataCreated: false,
      sampleDataCreated: false,
      adminUserCreated: false,
      errors: [],
      duration: 0
    };

    try {
      this.logger.info('Starting database initialization...');

      // Ensure database connection is initialized
      await this.db.initialize();

      // Run migrations if requested
      if (options.runMigrations !== false) {
        await this.runMigrations(result);
      }

      // Create seed data if requested
      if (!options.skipSeedData) {
        await this.createSeedData(result, options);
      }

      // Create sample data if requested
      if (options.createSampleData) {
        await this.createSampleData(result);
      }

      result.success = result.errors.length === 0;
      result.duration = Date.now() - startTime;

      if (result.success) {
        this.logger.info('Database initialization completed successfully', {
          migrationsRun: result.migrationsRun,
          seedDataCreated: result.seedDataCreated,
          sampleDataCreated: result.sampleDataCreated,
          duration: result.duration
        });
      } else {
        this.logger.error('Database initialization completed with errors', {
          errors: result.errors,
          duration: result.duration
        });
      }

    } catch (error: any) {
      result.errors.push(error.message);
      result.success = false;
      result.duration = Date.now() - startTime;
      
      this.logger.error('Database initialization failed', {
        error: error.message,
        duration: result.duration
      });
    }

    return result;
  }

  /**
   * Run database migrations
   */
  private async runMigrations(result: InitializationResult): Promise<void> {
    try {
      this.logger.info('Running database migrations...');
      
      const migrationResults = await this.db.migrate();
      result.migrationsRun = migrationResults ? migrationResults.length : 0;
      
      const failedMigrations = migrationResults ? migrationResults.filter((m: any) => !m.success) : [];
      if (failedMigrations.length > 0) {
        result.errors.push(`${failedMigrations.length} migrations failed`);
      }
      
    } catch (error: any) {
      result.errors.push(`Migration failed: ${error.message}`);
    }
  }

  /**
   * Create essential seed data
   */
  private async createSeedData(result: InitializationResult, options: InitializationOptions): Promise<void> {
    try {
      this.logger.info('Creating seed data...');
      
      await this.db.transaction(async (client: PoolClient) => {
        // Create default company if not exists
        await this.createDefaultCompany(client, options.companyName);
        
        // Create admin user if not exists
        const adminCreated = await this.createAdminUser(client, options);
        result.adminUserCreated = adminCreated;
        
        // Create default reference data
        await this.createDefaultReferenceData(client);
        
        // Create system settings
        await this.createSystemSettings(client);
        
        result.seedDataCreated = true;
      });
      
    } catch (error: any) {
      result.errors.push(`Seed data creation failed: ${error.message}`);
    }
  }

  /**
   * Create sample data for testing
   */
  private async createSampleData(result: InitializationResult): Promise<void> {
    try {
      this.logger.info('Creating sample data...');
      
      await this.db.transaction(async (client: PoolClient) => {
        // Create sample products
        await this.createSampleProducts(client);
        
        // Create sample quality checks
        await this.createSampleQualityChecks(client);
        
        result.sampleDataCreated = true;
      });
      
    } catch (error: any) {
      result.errors.push(`Sample data creation failed: ${error.message}`);
    }
  }

  /**
   * Create default company
   */
  private async createDefaultCompany(client: PoolClient, companyName?: string): Promise<void> {
    const name = companyName || 'TalYa Smart Quality';
    const code = 'TALYA';
    
    await client.query(`
      INSERT INTO companies (id, name, code, address, email, is_active) 
      VALUES (1001, $1, $2, 'Istanbul, Turkey', 'info@talyasmart.com', true)
      ON CONFLICT (id) DO NOTHING
    `, [name, code]);
    
    this.logger.debug('Default company created/verified');
  }

  /**
   * Create admin user
   */
  private async createAdminUser(client: PoolClient, options: InitializationOptions): Promise<boolean> {
    const email = options.adminEmail || 'admin@talyasmart.com';
    const password = options.adminPassword || 'admin123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await client.query(`
      INSERT INTO users (
        id, username, name, surname, email, password, company_id, role, 
        is_active, email_verified, created_by
      ) VALUES (
        '00000000-0000-0000-0000-000000000001',
        'admin',
        'System',
        'Administrator', 
        $1,
        $2,
        1001,
        'admin',
        true,
        true,
        '00000000-0000-0000-0000-000000000001'
      ) ON CONFLICT (id) DO NOTHING
      RETURNING id
    `, [email, hashedPassword]);
    
    const created = (result.rowCount || 0) > 0;
    
    if (created) {
      this.logger.info('Admin user created', { email });
    } else {
      this.logger.debug('Admin user already exists');
    }
    
    return created;
  }

  /**
   * Create default reference data
   */
  private async createDefaultReferenceData(client: PoolClient): Promise<void> {
    const adminId = '00000000-0000-0000-0000-000000000001';
    
    // Create default sellers
    await client.query(`
      INSERT INTO sellers (id, name, code, company_id, contact_person, is_active, created_by) VALUES
      (1, 'Default Supplier', 'SUP001', 1001, 'Contact Person', true, $1),
      (2, 'Premium Suppliers Ltd.', 'SUP002', 1001, 'Sales Manager', true, $1)
      ON CONFLICT (id) DO NOTHING
    `, [adminId]);

    // Create default brands  
    await client.query(`
      INSERT INTO brands (id, name, code, company_id, description, is_active, created_by) VALUES
      (1, 'TalYa Quality', 'TQ001', 1001, 'Premium quality products', true, $1),
      (2, 'Standard Brand', 'STD001', 1001, 'Standard quality products', true, $1)
      ON CONFLICT (id) DO NOTHING
    `, [adminId]);

    // Create default product groups
    await client.query(`
      INSERT INTO product_groups (id, name, code, company_id, description, is_active, created_by) VALUES
      (1, 'Electronics', 'ELEC', 1001, 'Electronic products and components', true, $1),
      (2, 'Mechanical Parts', 'MECH', 1001, 'Mechanical components and parts', true, $1),
      (3, 'Raw Materials', 'RAW', 1001, 'Raw materials and supplies', true, $1)
      ON CONFLICT (id) DO NOTHING
    `, [adminId]);

    // Create default product types
    await client.query(`
      INSERT INTO product_types (id, name, code, company_id, product_group_id, description, is_active, created_by) VALUES
      (1, 'Electronic Components', 'COMP', 1001, 1, 'Electronic components and circuits', true, $1),
      (2, 'Mechanical Components', 'MCOMP', 1001, 2, 'Mechanical parts and assemblies', true, $1),
      (3, 'Raw Material Items', 'RMAT', 1001, 3, 'Basic raw materials', true, $1)
      ON CONFLICT (id) DO NOTHING
    `, [adminId]);

    // Create default product categories
    await client.query(`
      INSERT INTO product_categories (id, name, code, company_id, description, is_active, created_by) VALUES
      (1, 'Quality Grade A', 'QGA', 1001, 'Highest quality grade products', true, $1),
      (2, 'Quality Grade B', 'QGB', 1001, 'Standard quality grade products', true, $1),
      (3, 'Quality Grade C', 'QGC', 1001, 'Basic quality grade products', true, $1)
      ON CONFLICT (id) DO NOTHING
    `, [adminId]);

    this.logger.debug('Default reference data created/verified');
  }

  /**
   * Create system settings
   */
  private async createSystemSettings(client: PoolClient): Promise<void> {
    const settings = [
      { company_id: 1001, key: 'default_currency', value: 'USD', type: 'string', description: 'Default currency for pricing' },
      { company_id: 1001, key: 'quality_check_retention_days', value: '365', type: 'number', description: 'Days to retain quality check records' },
      { company_id: 1001, key: 'auto_quality_check', value: 'true', type: 'boolean', description: 'Automatically create quality checks for new products' },
      { company_id: 1001, key: 'notification_email', value: 'quality@talyasmart.com', type: 'string', description: 'Email for quality notifications' },
      { company_id: null, key: 'system_version', value: '1.0.0', type: 'string', description: 'Current system version' },
      { company_id: null, key: 'maintenance_mode', value: 'false', type: 'boolean', description: 'System maintenance mode' },
      { company_id: null, key: 'max_file_upload_size', value: '10485760', type: 'number', description: 'Maximum file upload size in bytes (10MB)' }
    ];

    for (const setting of settings) {
      await client.query(`
        INSERT INTO system_settings (company_id, setting_key, setting_value, setting_type, description, is_system_wide) 
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (setting_key, company_id) DO NOTHING
      `, [
        setting.company_id,
        setting.key,
        setting.value,
        setting.type,
        setting.description,
        setting.company_id === null
      ]);
    }

    this.logger.debug('System settings created/verified');
  }

  /**
   * Create sample products for testing
   */
  private async createSampleProducts(client: PoolClient): Promise<void> {
    const adminId = '00000000-0000-0000-0000-000000000001';
    
    const sampleProducts = [
      {
        code: 'SAMPLE001',
        name: 'Electronic Component Sample',
        description: 'Sample electronic component for testing',
        seller_id: 1,
        brand_id: 1,
        product_type_id: 1,
        critical_stock_amount: 50,
        weight: 0.1,
        unit_price: 25.99
      },
      {
        code: 'SAMPLE002',
        name: 'Mechanical Part Sample',
        description: 'Sample mechanical part for testing',
        seller_id: 2,
        brand_id: 2,
        product_type_id: 2,
        critical_stock_amount: 25,
        weight: 1.5,
        unit_price: 45.50
      },
      {
        code: 'SAMPLE003',
        name: 'Raw Material Sample',
        description: 'Sample raw material for testing',
        seller_id: 1,
        brand_id: 1,
        product_type_id: 3,
        critical_stock_amount: 100,
        weight: 0.5,
        unit_price: 12.75
      }
    ];

    for (const product of sampleProducts) {
      await client.query(`
        INSERT INTO products (
          code, name, description, company_id, seller_id, brand_id, product_type_id,
          critical_stock_amount, weight, unit_price, current_stock, status, created_by
        ) VALUES ($1, $2, $3, 1001, $4, $5, $6, $7, $8, $9, $10, 'active', $11)
        ON CONFLICT (code, company_id) DO NOTHING
      `, [
        product.code, product.name, product.description, product.seller_id,
        product.brand_id, product.product_type_id, product.critical_stock_amount,
        product.weight, product.unit_price, product.critical_stock_amount * 2, adminId
      ]);
    }

    this.logger.debug('Sample products created/verified');
  }

  /**
   * Create sample quality checks
   */
  private async createSampleQualityChecks(client: PoolClient): Promise<void> {
    const adminId = '00000000-0000-0000-0000-000000000001';
    
    // Get sample product IDs
    const productsResult = await client.query(`
      SELECT id FROM products 
      WHERE company_id = 1001 AND code IN ('SAMPLE001', 'SAMPLE002') 
      LIMIT 2
    `);

    for (const product of productsResult.rows) {
      await client.query(`
        INSERT INTO quality_checks (
          product_id, company_id, inspector_id, check_type, status, 
          overall_grade, score, notes, created_by
        ) VALUES ($1, 1001, $2, 'incoming', 'passed', 'A', 95.5, 
                 'Sample quality check for testing purposes', $2)
      `, [product.id, adminId]);
    }

    this.logger.debug('Sample quality checks created/verified');
  }

  /**
   * Check if database is properly initialized
   */
  async isInitialized(): Promise<boolean> {
    try {
      // Check if key tables exist and have data
      const checks = [
        'SELECT COUNT(*) as count FROM companies WHERE id = 1001',
        'SELECT COUNT(*) as count FROM users WHERE role = \'admin\'',
        'SELECT COUNT(*) as count FROM sellers WHERE company_id = 1001',
        'SELECT COUNT(*) as count FROM brands WHERE company_id = 1001'
      ];

      for (const check of checks) {
        const result = await this.db.query(check);
        if (parseInt(result.rows[0].count) === 0) {
          return false;
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get initialization status
   */
  async getStatus(): Promise<{
    tablesExist: boolean;
    migrationStatus: any;
    hasAdminUser: boolean;
    hasDefaultCompany: boolean;
    hasReferenceData: boolean;
    sampleDataExists: boolean;
  }> {
    try {
      const migrationStatus = await this.db.getMigrationStatus();
      
      const adminResult = await this.db.query(
        'SELECT COUNT(*) as count FROM users WHERE role = $1', ['admin']
      );
      
      const companyResult = await this.db.query(
        'SELECT COUNT(*) as count FROM companies WHERE id = $1', [1001]
      );
      
      const sellersResult = await this.db.query(
        'SELECT COUNT(*) as count FROM sellers WHERE company_id = $1', [1001]
      );
      
      const sampleResult = await this.db.query(
        'SELECT COUNT(*) as count FROM products WHERE code LIKE $1', ['SAMPLE%']
      );

      return {
        tablesExist: migrationStatus.executed.length > 0,
        migrationStatus,
        hasAdminUser: parseInt(adminResult.rows[0].count) > 0,
        hasDefaultCompany: parseInt(companyResult.rows[0].count) > 0,
        hasReferenceData: parseInt(sellersResult.rows[0].count) > 0,
        sampleDataExists: parseInt(sampleResult.rows[0].count) > 0
      };
    } catch (error: any) {
      throw new Error(`Failed to get initialization status: ${error.message}`);
    }
  }

  /**
   * Reset database (dangerous - use with caution)
   */
  async reset(confirmationCode: string): Promise<void> {
    if (confirmationCode !== 'CONFIRM_RESET_DATABASE') {
      throw new Error('Invalid confirmation code');
    }

    this.logger.warn('⚠️  RESETTING DATABASE - ALL DATA WILL BE LOST');
    
    await this.db.transaction(async (client: PoolClient) => {
      // Drop all tables in reverse dependency order
      const dropTables = [
        'audit_logs',
        'user_sessions',
        'product_category_mapping',
        'quality_check_templates',
        'quality_checks',
        'product_history',
        'products',
        'product_categories',
        'product_types',
        'product_groups',
        'brands',
        'sellers',
        'system_settings',
        'users',
        'companies',
        'schema_migrations'
      ];

      for (const table of dropTables) {
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
      }
      
      // Drop functions
      await client.query('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE');
      await client.query('DROP FUNCTION IF EXISTS audit_trigger_function() CASCADE');
    });

    this.logger.warn('Database reset completed');
  }
}