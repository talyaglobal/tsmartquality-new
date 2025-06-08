#!/usr/bin/env node

/**
 * Database System Integration Test
 * Tests the complete database implementation including:
 * - Connection management
 * - Schema creation via migrations
 * - Seed data initialization
 * - Basic CRUD operations
 * - Health monitoring
 */

const { 
  initializeDatabase, 
  checkDatabaseHealth, 
  getDatabaseMetrics,
  executeQuery,
  closeDatabaseConnections,
  resetDatabase
} = require('./database/index');

const { Logger } = require('./startup');

async function runDatabaseTests() {
  console.log('\n🧪 Starting Database System Integration Tests\n');
  console.log('================================================');

  let testsPassed = 0;
  let testsTotal = 0;
  let db = null;

  try {
    // Test 1: Database Initialization
    testsTotal++;
    console.log('\n1️⃣  Testing Database Initialization...');
    
    try {
      db = await initializeDatabase();
      console.log('✅ Database initialized successfully');
      testsPassed++;
    } catch (error) {
      console.error('❌ Database initialization failed:', error.message);
    }

    // Test 2: Health Check
    testsTotal++;
    console.log('\n2️⃣  Testing Health Check...');
    
    try {
      const health = await checkDatabaseHealth();
      if (health.status === 'healthy') {
        console.log(`✅ Database health check passed (latency: ${health.latency}ms)`);
        console.log(`   Pool stats: ${JSON.stringify(health.poolStats)}`);
        testsPassed++;
      } else {
        console.error('❌ Database health check failed:', health.error);
      }
    } catch (error) {
      console.error('❌ Health check error:', error.message);
    }

    // Test 3: Schema Validation
    testsTotal++;
    console.log('\n3️⃣  Testing Schema Validation...');
    
    try {
      const tables = [
        'companies', 'users', 'sellers', 'brands', 'product_groups',
        'product_types', 'product_categories', 'products', 'quality_checks',
        'product_history', 'system_settings', 'schema_migrations'
      ];

      for (const table of tables) {
        const result = await executeQuery(
          `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = $1`,
          [table]
        );
        
        if (parseInt(result.rows[0].count) === 0) {
          throw new Error(`Table ${table} not found`);
        }
      }
      
      console.log(`✅ All ${tables.length} required tables exist`);
      testsPassed++;
    } catch (error) {
      console.error('❌ Schema validation failed:', error.message);
    }

    // Test 4: Seed Data Verification
    testsTotal++;
    console.log('\n4️⃣  Testing Seed Data...');
    
    try {
      const checks = [
        { table: 'companies', expected: 1, condition: "id = 1001" },
        { table: 'users', expected: 1, condition: "role = 'admin'" },
        { table: 'sellers', expected: 2, condition: "company_id = 1001" },
        { table: 'brands', expected: 2, condition: "company_id = 1001" },
        { table: 'product_groups', expected: 3, condition: "company_id = 1001" },
        { table: 'system_settings', expected: 7, condition: "1=1" }
      ];

      for (const check of checks) {
        const result = await executeQuery(
          `SELECT COUNT(*) as count FROM ${check.table} WHERE ${check.condition}`
        );
        
        const count = parseInt(result.rows[0].count);
        if (count < check.expected) {
          throw new Error(`${check.table}: expected at least ${check.expected}, got ${count}`);
        }
      }
      
      console.log('✅ All seed data properly created');
      testsPassed++;
    } catch (error) {
      console.error('❌ Seed data verification failed:', error.message);
    }

    // Test 5: CRUD Operations
    testsTotal++;
    console.log('\n5️⃣  Testing Basic CRUD Operations...');
    
    try {
      // Test INSERT
      const insertResult = await executeQuery(`
        INSERT INTO products (
          code, name, description, company_id, seller_id, brand_id, 
          product_type_id, critical_stock_amount, weight, unit_price, 
          current_stock, status, created_by
        ) VALUES (
          'TEST001', 'Test Product', 'Test product for validation', 1001, 1, 1,
          1, 10, 0.5, 19.99, 20, 'active', 
          '00000000-0000-0000-0000-000000000001'
        ) RETURNING id
      `);
      
      if (insertResult.rows.length === 0) {
        throw new Error('Insert operation failed');
      }
      
      const testProductId = insertResult.rows[0].id;
      
      // Test SELECT
      const selectResult = await executeQuery(
        'SELECT * FROM products WHERE id = $1', [testProductId]
      );
      
      if (selectResult.rows.length === 0) {
        throw new Error('Select operation failed');
      }
      
      // Test UPDATE
      await executeQuery(
        'UPDATE products SET name = $1 WHERE id = $2', 
        ['Updated Test Product', testProductId]
      );
      
      // Test DELETE
      await executeQuery(
        'DELETE FROM products WHERE id = $1', [testProductId]
      );
      
      console.log('✅ CRUD operations completed successfully');
      testsPassed++;
    } catch (error) {
      console.error('❌ CRUD operations failed:', error.message);
    }

    // Test 6: Performance Metrics
    testsTotal++;
    console.log('\n6️⃣  Testing Performance Metrics...');
    
    try {
      const metrics = await getDatabaseMetrics();
      
      if (metrics.queryStats && metrics.connectionStats) {
        console.log(`✅ Performance metrics available:`);
        console.log(`   Total queries: ${metrics.queryStats.totalQueries}`);
        console.log(`   Successful queries: ${metrics.queryStats.successfulQueries}`);
        console.log(`   Average duration: ${metrics.queryStats.averageDuration}ms`);
        console.log(`   Active connections: ${metrics.connectionStats.totalCount}`);
        testsPassed++;
      } else {
        throw new Error('Performance metrics not available');
      }
    } catch (error) {
      console.error('❌ Performance metrics test failed:', error.message);
    }

    // Test 7: Transaction Support
    testsTotal++;
    console.log('\n7️⃣  Testing Transaction Support...');
    
    try {
      const { executeTransaction } = require('./database/index');
      
      const result = await executeTransaction(async (client) => {
        await client.query('SELECT 1 as test');
        return { success: true };
      });
      
      if (result.success) {
        console.log('✅ Transaction support working correctly');
        testsPassed++;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('❌ Transaction test failed:', error.message);
    }

  } catch (error) {
    console.error('\n💥 Critical test failure:', error.message);
  }

  // Results Summary
  console.log('\n================================================');
  console.log('🏁 Database Tests Summary');
  console.log('================================================');
  console.log(`Tests Passed: ${testsPassed}/${testsTotal}`);
  console.log(`Success Rate: ${Math.round((testsPassed/testsTotal) * 100)}%`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 All database tests passed! System is ready for production.');
  } else {
    console.log(`⚠️  ${testsTotal - testsPassed} test(s) failed. Please review issues above.`);
  }

  // Cleanup
  try {
    await closeDatabaseConnections();
    console.log('\n🧹 Database connections closed cleanly');
  } catch (error) {
    console.error('Warning: Failed to close connections:', error.message);
  }

  return testsPassed === testsTotal;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runDatabaseTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}

module.exports = { runDatabaseTests };