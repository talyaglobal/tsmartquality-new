const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testAuthEndpoints() {
  try {
    console.log('Testing Authentication System...\n');

    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    try {
      const healthResponse = await axios.get('http://localhost:3000/health');
      console.log('✅ Health check:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
      return;
    }

    // Test 2: Register a new user
    console.log('\n2. Testing user registration...');
    const registerData = {
      username: 'testuser',
      name: 'Test',
      surname: 'User',
      email: 'test@example.com',
      password: 'TestPassword123!',
      companyId: 1,
      role: 'user'
    };

    try {
      const registerResponse = await axios.post(`${API_BASE}/users/register`, registerData);
      console.log('✅ User registration successful');
      console.log('   User ID:', registerResponse.data.data.user.id);
    } catch (error) {
      console.log('❌ Registration failed:', error.response?.data?.message || error.message);
    }

    // Test 3: Login with valid credentials
    console.log('\n3. Testing login...');
    const loginData = {
      email: 'test@example.com',
      password: 'TestPassword123!'
    };

    let accessToken = null;
    let refreshToken = null;

    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, loginData);
      console.log('✅ Login successful');
      
      if (loginResponse.data.mfaRequired) {
        console.log('   MFA required - this is expected for new devices');
        accessToken = loginResponse.data.tempToken;
      } else {
        accessToken = loginResponse.data.tokens.accessToken;
        refreshToken = loginResponse.data.tokens.refreshToken;
        console.log('   Access token received');
        console.log('   Refresh token received');
      }
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message || error.message);
    }

    // Test 4: Access protected endpoint
    if (accessToken) {
      console.log('\n4. Testing protected endpoint access...');
      try {
        const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        console.log('✅ Protected endpoint access successful');
        console.log('   User role:', profileResponse.data.user.role);
      } catch (error) {
        console.log('❌ Protected endpoint access failed:', error.response?.data?.message || error.message);
      }
    }

    // Test 5: Access without token (should fail)
    console.log('\n5. Testing unauthorized access...');
    try {
      await axios.get(`${API_BASE}/auth/profile`);
      console.log('❌ Unauthorized access should have failed');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Unauthorized access correctly blocked');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    // Test 6: Token refresh (if we have a refresh token)
    if (refreshToken) {
      console.log('\n6. Testing token refresh...');
      try {
        const refreshResponse = await axios.post(`${API_BASE}/auth/refresh`, {
          refreshToken: refreshToken
        });
        console.log('✅ Token refresh successful');
        console.log('   New access token received');
      } catch (error) {
        console.log('❌ Token refresh failed:', error.response?.data?.message || error.message);
      }
    }

    // Test 7: Invalid login credentials
    console.log('\n7. Testing invalid credentials...');
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: 'test@example.com',
        password: 'WrongPassword123!'
      });
      console.log('❌ Invalid credentials should have failed');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid credentials correctly rejected');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 Authentication system testing completed!');

  } catch (error) {
    console.error('Test suite failed:', error.message);
  }
}

// Run the tests if server is available
axios.get('http://localhost:3000/ping')
  .then(() => {
    console.log('Server is running, starting tests...\n');
    testAuthEndpoints();
  })
  .catch(() => {
    console.log('❌ Server is not running on localhost:3000');
    console.log('Please start the server with: npm run dev');
  });