#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Test configuration
const LOCAL_URL = 'http://localhost:3002';
const VERCEL_URL = process.argv[2] || 'https://your-project.vercel.app';

console.log('🧪 TSmart Quality API Deployment Test\n');

// Test endpoints
const endpoints = [
  { method: 'GET', path: '/api/health', name: 'Health Check' },
  { 
    method: 'POST', 
    path: '/api/auth/login', 
    name: 'Authentication',
    body: JSON.stringify({ email: 'batuhan@talyasmart.com', password: '123456' })
  },
  { method: 'GET', path: '/api/products', name: 'Products List' },
  { method: 'GET', path: '/api/products/123', name: 'Product Details' },
  { 
    method: 'POST', 
    path: '/api/products', 
    name: 'Create Product',
    body: JSON.stringify({
      code: 'TEST001',
      name: 'Test Product',
      sellerId: 1,
      brandId: 2,
      criticalStockAmount: 10
    })
  },
  { method: 'GET', path: '/api/quality-checks', name: 'Quality Checks' },
  { method: 'GET', path: '/api/users/me', name: 'User Profile' }
];

// Helper function to make HTTP requests
function makeRequest(url, options, postData = null) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    
    const req = lib.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Test function
async function testEndpoint(baseUrl, endpoint) {
  try {
    const url = baseUrl + endpoint.path;
    const options = {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TSmart-API-Test/1.0'
      }
    };
    
    console.log(`Testing ${endpoint.name}...`);
    console.log(`  ${endpoint.method} ${endpoint.path}`);
    
    const response = await makeRequest(url, options, endpoint.body);
    
    const statusIcon = response.statusCode < 400 ? '✅' : '❌';
    console.log(`  ${statusIcon} Status: ${response.statusCode}`);
    
    try {
      const jsonData = JSON.parse(response.body);
      console.log(`  📄 Response:`, JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log(`  📄 Response: ${response.body.substring(0, 200)}...`);
    }
    
    console.log('');
    return response.statusCode < 400;
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}\n`);
    return false;
  }
}

// Main test function
async function runTests(baseUrl) {
  console.log(`🔗 Testing API at: ${baseUrl}\n`);
  
  let passed = 0;
  let total = endpoints.length;
  
  for (const endpoint of endpoints) {
    const success = await testEndpoint(baseUrl, endpoint);
    if (success) passed++;
  }
  
  console.log('📊 Test Results:');
  console.log(`  ✅ Passed: ${passed}/${total}`);
  console.log(`  ❌ Failed: ${total - passed}/${total}`);
  console.log(`  📈 Success Rate: ${Math.round((passed / total) * 100)}%\n`);
  
  return passed === total;
}

// Run tests
async function main() {
  console.log('Starting API tests...\n');
  
  // Test local deployment if available
  if (process.argv.includes('--local')) {
    console.log('🏠 Testing Local Deployment');
    console.log('=' .repeat(50));
    await runTests(LOCAL_URL);
  }
  
  // Test Vercel deployment
  if (process.argv[2] && process.argv[2].startsWith('http')) {
    console.log('☁️  Testing Vercel Deployment');
    console.log('=' .repeat(50));
    await runTests(VERCEL_URL);
  } else {
    console.log('💡 Usage:');
    console.log('  node test-deployment.js https://your-project.vercel.app');
    console.log('  node test-deployment.js --local  # Test local server');
    console.log('');
    console.log('🔗 Example Vercel URLs to test:');
    console.log('  https://tsmartquality-api.vercel.app');
    console.log('  https://your-project-name.vercel.app');
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Test interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main().catch(console.error);