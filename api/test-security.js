const axios = require('axios');
const crypto = require('crypto');

const API_BASE = 'http://localhost:3000';

/**
 * Comprehensive security testing suite
 */
class SecurityTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTest(name, testFn) {
    console.log(`\n🧪 Testing: ${name}`);
    try {
      const result = await testFn();
      if (result.success) {
        console.log(`✅ PASS: ${result.message}`);
        this.results.passed++;
      } else {
        console.log(`❌ FAIL: ${result.message}`);
        this.results.failed++;
      }
      this.results.tests.push({ name, ...result });
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
      this.results.failed++;
      this.results.tests.push({ name, success: false, message: error.message });
    }
  }

  async testSecurityHeaders() {
    return this.runTest('Security Headers', async () => {
      const response = await axios.get(`${API_BASE}/ping`);
      const headers = response.headers;
      
      const requiredHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'referrer-policy'
      ];
      
      const missingHeaders = requiredHeaders.filter(header => !headers[header]);
      
      if (missingHeaders.length === 0) {
        return { success: true, message: 'All security headers present' };
      } else {
        return { success: false, message: `Missing headers: ${missingHeaders.join(', ')}` };
      }
    });
  }

  async testRateLimiting() {
    return this.runTest('Rate Limiting', async () => {
      const requests = [];
      
      // Send many requests quickly
      for (let i = 0; i < 10; i++) {
        requests.push(axios.get(`${API_BASE}/ping`).catch(err => err.response));
      }
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.some(res => res?.status === 429);
      
      if (rateLimited) {
        return { success: true, message: 'Rate limiting is working' };
      } else {
        return { success: false, message: 'Rate limiting not triggered' };
      }
    });
  }

  async testInputSanitization() {
    return this.runTest('Input Sanitization', async () => {
      const maliciousPayload = {
        name: '<script>alert("XSS")</script>',
        description: 'test" OR 1=1 --'
      };
      
      try {
        const response = await axios.post(`${API_BASE}/api/test`, maliciousPayload);
        // If we get here, check if the input was sanitized in the response
        const responseText = JSON.stringify(response.data);
        
        if (responseText.includes('<script>') || responseText.includes('OR 1=1')) {
          return { success: false, message: 'Malicious input not sanitized' };
        } else {
          return { success: true, message: 'Input appears to be sanitized' };
        }
      } catch (error) {
        if (error.response?.status === 400) {
          return { success: true, message: 'Malicious input rejected' };
        }
        return { success: false, message: `Unexpected error: ${error.message}` };
      }
    });
  }

  async testSQLInjection() {
    return this.runTest('SQL Injection Protection', async () => {
      const sqlPayloads = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "'; INSERT INTO users VALUES ('hacker', 'password'); --"
      ];
      
      for (const payload of sqlPayloads) {
        try {
          await axios.get(`${API_BASE}/api/users`, {
            params: { search: payload }
          });
        } catch (error) {
          if (error.response?.status === 400) {
            return { success: true, message: 'SQL injection attempt blocked' };
          }
        }
      }
      
      return { success: false, message: 'SQL injection protection not working' };
    });
  }

  async testXSSProtection() {
    return this.runTest('XSS Protection', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src="x" onerror="alert(\'XSS\')">'
      ];
      
      for (const payload of xssPayloads) {
        try {
          const response = await axios.post(`${API_BASE}/api/test`, {
            content: payload
          });
          
          const responseText = JSON.stringify(response.data);
          if (responseText.includes(payload)) {
            return { success: false, message: 'XSS payload not filtered' };
          }
        } catch (error) {
          if (error.response?.status === 400) {
            return { success: true, message: 'XSS attempt blocked' };
          }
        }
      }
      
      return { success: true, message: 'XSS payloads filtered or blocked' };
    });
  }

  async testCORSConfiguration() {
    return this.runTest('CORS Configuration', async () => {
      try {
        const response = await axios.options(`${API_BASE}/api/ping`, {
          headers: {
            'Origin': 'http://malicious-site.com',
            'Access-Control-Request-Method': 'GET'
          }
        });
        
        const corsHeaders = response.headers['access-control-allow-origin'];
        
        if (corsHeaders === '*') {
          return { success: false, message: 'CORS allows all origins (security risk in production)' };
        } else {
          return { success: true, message: 'CORS properly configured' };
        }
      } catch (error) {
        return { success: true, message: 'CORS request properly blocked' };
      }
    });
  }

  async testRequestSizeLimits() {
    return this.runTest('Request Size Limits', async () => {
      // Create a large payload (larger than typical limits)
      const largePayload = 'x'.repeat(50 * 1024 * 1024); // 50MB
      
      try {
        await axios.post(`${API_BASE}/api/test`, {
          data: largePayload
        });
        
        return { success: false, message: 'Large request not blocked' };
      } catch (error) {
        if (error.response?.status === 413 || error.code === 'ECONNRESET') {
          return { success: true, message: 'Large request properly blocked' };
        }
        return { success: false, message: `Unexpected error: ${error.message}` };
      }
    });
  }

  async testHealthEndpoints() {
    return this.runTest('Health Endpoints', async () => {
      try {
        const [ping, health, detailed] = await Promise.all([
          axios.get(`${API_BASE}/ping`),
          axios.get(`${API_BASE}/health`),
          axios.get(`${API_BASE}/health/detailed`)
        ]);
        
        if (ping.status === 200 && health.status === 200 && detailed.status === 200) {
          return { success: true, message: 'All health endpoints responding' };
        } else {
          return { success: false, message: 'Some health endpoints not responding correctly' };
        }
      } catch (error) {
        return { success: false, message: `Health endpoints error: ${error.message}` };
      }
    });
  }

  async testSecurityEndpoint() {
    return this.runTest('Security Status Endpoint', async () => {
      try {
        const response = await axios.get(`${API_BASE}/security/status`);
        
        if (response.status === 200 && response.data.security && response.data.features) {
          return { success: true, message: 'Security status endpoint working' };
        } else {
          return { success: false, message: 'Security status endpoint not configured correctly' };
        }
      } catch (error) {
        return { success: false, message: `Security endpoint error: ${error.message}` };
      }
    });
  }

  async testMetricsEndpoint() {
    return this.runTest('Metrics Endpoint', async () => {
      try {
        const response = await axios.get(`${API_BASE}/metrics`);
        
        if (response.status === 200 || response.status === 404) {
          return { success: true, message: 'Metrics endpoint responding (enabled or properly disabled)' };
        } else {
          return { success: false, message: 'Metrics endpoint not configured correctly' };
        }
      } catch (error) {
        if (error.response?.status === 404) {
          return { success: true, message: 'Metrics endpoint properly disabled' };
        }
        return { success: false, message: `Metrics endpoint error: ${error.message}` };
      }
    });
  }

  async testHTTPSRedirection() {
    return this.runTest('HTTPS Headers', async () => {
      try {
        const response = await axios.get(`${API_BASE}/ping`);
        const hstsHeader = response.headers['strict-transport-security'];
        
        // In development, HSTS might not be set, which is OK
        if (process.env.NODE_ENV === 'production' && !hstsHeader) {
          return { success: false, message: 'HSTS header missing in production' };
        }
        
        return { success: true, message: 'HTTPS headers configured appropriately for environment' };
      } catch (error) {
        return { success: false, message: `HTTPS headers test error: ${error.message}` };
      }
    });
  }

  async runAllTests() {
    console.log('🔒 Starting Comprehensive Security Test Suite');
    console.log('='.repeat(50));

    // Test if server is running
    try {
      await axios.get(`${API_BASE}/ping`);
      console.log('✅ Server is running, proceeding with tests...');
    } catch (error) {
      console.log('❌ Server is not running. Please start the server first.');
      return;
    }

    // Run all security tests
    await this.testSecurityHeaders();
    await this.testRateLimiting();
    await this.testInputSanitization();
    await this.testSQLInjection();
    await this.testXSSProtection();
    await this.testCORSConfiguration();
    await this.testRequestSizeLimits();
    await this.testHealthEndpoints();
    await this.testSecurityEndpoint();
    await this.testMetricsEndpoint();
    await this.testHTTPSRedirection();

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('🏁 Security Test Suite Complete');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📊 Total:  ${this.results.passed + this.results.failed}`);
    
    const successRate = Math.round((this.results.passed / (this.results.passed + this.results.failed)) * 100);
    console.log(`🎯 Success Rate: ${successRate}%`);

    if (this.results.failed > 0) {
      console.log('\n⚠️  Failed Tests:');
      this.results.tests
        .filter(test => !test.success)
        .forEach(test => console.log(`   - ${test.name}: ${test.message}`));
    }

    if (successRate >= 80) {
      console.log('\n🎉 Security hardening appears to be working well!');
    } else {
      console.log('\n⚠️  Security configuration needs attention.');
    }
  }
}

// Run the tests
const tester = new SecurityTester();
tester.runAllTests().catch(console.error);