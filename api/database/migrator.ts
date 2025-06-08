import { Pool, PoolClient } from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface Migration {
  version: string;
  name: string;
  description: string;
  filePath: string;
  checksum: string;
}

export interface MigrationResult {
  version: string;
  success: boolean;
  executionTimeMs: number;
  error?: string;
}

export class DatabaseMigrator {
  private pool: Pool;
  private migrationsDir: string;

  constructor(pool: Pool, migrationsDir?: string) {
    this.pool = pool;
    this.migrationsDir = migrationsDir || path.join(__dirname, 'migrations');
  }

  /**
   * Initialize migration tracking table
   */
  private async initializeMigrationTable(client: PoolClient): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        version VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        execution_time_ms INTEGER,
        checksum VARCHAR(64),
        success BOOLEAN DEFAULT true
      );
      
      CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);
      CREATE INDEX IF NOT EXISTS idx_schema_migrations_executed_at ON schema_migrations(executed_at);
    `;

    await client.query(createTableSQL);
  }

  /**
   * Get list of available migration files
   */
  private async getAvailableMigrations(): Promise<Migration[]> {
    const migrations: Migration[] = [];

    if (!fs.existsSync(this.migrationsDir)) {
      console.warn(`Migrations directory not found: ${this.migrationsDir}`);
      return migrations;
    }

    const files = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const filePath = path.join(this.migrationsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract migration info from file header comments
      const versionMatch = content.match(/-- Migration:\s*(\w+)/);
      const nameMatch = content.match(/-- Description:\s*(.+)/);
      
      if (versionMatch) {
        const version = versionMatch[1];
        const name = nameMatch ? nameMatch[1].trim() : file.replace('.sql', '');
        const checksum = crypto.createHash('sha256').update(content).digest('hex');

        migrations.push({
          version,
          name,
          description: name,
          filePath,
          checksum
        });
      }
    }

    return migrations;
  }

  /**
   * Get list of executed migrations
   */
  private async getExecutedMigrations(client: PoolClient): Promise<Set<string>> {
    try {
      const result = await client.query(
        'SELECT version FROM schema_migrations WHERE success = true ORDER BY executed_at'
      );
      return new Set(result.rows.map(row => row.version));
    } catch (error) {
      // If table doesn't exist yet, return empty set
      return new Set();
    }
  }

  /**
   * Execute a single migration
   */
  private async executeMigration(client: PoolClient, migration: Migration): Promise<MigrationResult> {
    const startTime = Date.now();
    
    try {
      console.log(`Executing migration ${migration.version}: ${migration.name}`);
      
      // Read and execute the migration file
      let sql = fs.readFileSync(migration.filePath, 'utf8');
      
      // If this is the initial schema migration, include the main schema content
      if (migration.version === '001') {
        const schemaPath = path.join(__dirname, 'schema.sql');
        if (fs.existsSync(schemaPath)) {
          const schemaContent = fs.readFileSync(schemaPath, 'utf8');
          // Insert schema content before the migration record
          sql = sql.replace(
            '-- Execute the main schema',
            `-- Execute the main schema\n${schemaContent}`
          );
        }
      }

      // Execute the migration
      await client.query(sql);
      
      const executionTimeMs = Date.now() - startTime;
      
      console.log(`✅ Migration ${migration.version} completed in ${executionTimeMs}ms`);
      
      return {
        version: migration.version,
        success: true,
        executionTimeMs
      };
    } catch (error: any) {
      const executionTimeMs = Date.now() - startTime;
      
      console.error(`❌ Migration ${migration.version} failed:`, error.message);
      
      // Record failed migration
      try {
        await client.query(
          `INSERT INTO schema_migrations (version, name, description, execution_time_ms, checksum, success) 
           VALUES ($1, $2, $3, $4, $5, false)
           ON CONFLICT (version) DO UPDATE SET
           executed_at = CURRENT_TIMESTAMP,
           execution_time_ms = $4,
           success = false`,
          [migration.version, migration.name, migration.description, executionTimeMs, migration.checksum]
        );
      } catch (recordError) {
        console.error('Failed to record migration failure:', recordError);
      }
      
      return {
        version: migration.version,
        success: false,
        executionTimeMs,
        error: error.message
      };
    }
  }

  /**
   * Run all pending migrations
   */
  async migrate(): Promise<MigrationResult[]> {
    const client = await this.pool.connect();
    const results: MigrationResult[] = [];

    try {
      // Start transaction
      await client.query('BEGIN');

      // Initialize migration table
      await this.initializeMigrationTable(client);

      // Get available and executed migrations
      const availableMigrations = await this.getAvailableMigrations();
      const executedMigrations = await this.getExecutedMigrations(client);

      console.log(`Found ${availableMigrations.length} available migrations`);
      console.log(`${executedMigrations.size} migrations already executed`);

      // Filter pending migrations
      const pendingMigrations = availableMigrations.filter(
        migration => !executedMigrations.has(migration.version)
      );

      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations to execute');
        await client.query('COMMIT');
        return results;
      }

      console.log(`Executing ${pendingMigrations.length} pending migrations...`);

      // Execute pending migrations
      for (const migration of pendingMigrations) {
        const result = await this.executeMigration(client, migration);
        results.push(result);

        if (!result.success) {
          // Stop on first failure
          await client.query('ROLLBACK');
          throw new Error(`Migration ${migration.version} failed: ${result.error}`);
        }
      }

      // Commit all migrations
      await client.query('COMMIT');
      console.log('✅ All migrations executed successfully');

    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error('❌ Migration process failed:', error.message);
      throw error;
    } finally {
      client.release();
    }

    return results;
  }

  /**
   * Get migration status
   */
  async getStatus(): Promise<{
    available: Migration[];
    executed: string[];
    pending: Migration[];
  }> {
    const client = await this.pool.connect();
    
    try {
      await this.initializeMigrationTable(client);
      
      const availableMigrations = await this.getAvailableMigrations();
      const executedMigrations = await this.getExecutedMigrations(client);
      
      const pending = availableMigrations.filter(
        migration => !executedMigrations.has(migration.version)
      );

      return {
        available: availableMigrations,
        executed: Array.from(executedMigrations),
        pending
      };
    } finally {
      client.release();
    }
  }

  /**
   * Create a new migration file template
   */
  static createMigrationFile(
    migrationsDir: string,
    version: string,
    name: string,
    description: string
  ): string {
    const fileName = `${version}_${name.toLowerCase().replace(/\s+/g, '_')}.sql`;
    const filePath = path.join(migrationsDir, fileName);
    
    const template = `-- Migration: ${version}
-- Description: ${description}
-- Created: ${new Date().toISOString().split('T')[0]}
-- Dependencies: [List any dependent migrations here]

-- Your migration SQL goes here


-- Record this migration
INSERT INTO schema_migrations (version, name, description, checksum) 
VALUES ('${version}', '${name}', '${description}', 
        encode(digest('${version}_${name}', 'sha256'), 'hex'))
ON CONFLICT (version) DO NOTHING;
`;

    fs.writeFileSync(filePath, template, 'utf8');
    console.log(`Created migration file: ${filePath}`);
    
    return filePath;
  }

  /**
   * Rollback last migration (dangerous - use with caution)
   */
  async rollbackLast(): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(
        'SELECT version FROM schema_migrations WHERE success = true ORDER BY executed_at DESC LIMIT 1'
      );
      
      if (result.rows.length === 0) {
        console.log('No migrations to rollback');
        return;
      }

      const lastVersion = result.rows[0].version;
      console.warn(`⚠️  Rolling back migration ${lastVersion}`);
      console.warn('This operation is dangerous and may cause data loss!');
      
      // Mark migration as not executed (we don't actually rollback the schema changes)
      await client.query(
        'DELETE FROM schema_migrations WHERE version = $1',
        [lastVersion]
      );
      
      console.log(`Migration ${lastVersion} marked as not executed`);
      console.log('Note: Schema changes were not automatically reversed');
      
    } finally {
      client.release();
    }
  }
}