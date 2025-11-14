const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication Endpoints...\n');

    // Test data
    const testUser = {
      email: 'testauth@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      password: 'testpassword123',
      university: 'Test University',
      city: 'Test City',
      totalStipend: 1500,
      savingsGoalPct: 25
    };

    // 1. Test Signup
    console.log('1️⃣ Testing Signup...');
    try {
      const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, testUser);
      console.log('✅ Signup successful');
      console.log('Token received:', signupResponse.data.data.token ? 'Yes' : 'No');
      console.log('User ID:', signupResponse.data.data.user.id);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ User already exists, continuing with login test...');
      } else {
        console.log('❌ Signup failed:', error.response?.data?.message || error.message);
        return;
      }
    }

    // 2. Test Login
    console.log('\n2️⃣ Testing Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful');
    const token = loginResponse.data.data.token;
    console.log('Token received:', token ? 'Yes' : 'No');

    // 3. Test Protected Route (GET /auth/me)
    console.log('\n3️⃣ Testing Protected Route (/auth/me)...');
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ Protected route access successful');
    console.log('User email:', meResponse.data.data.user.email);

    // 4. Test Invalid Token
    console.log('\n4️⃣ Testing Invalid Token...');
    try {
      await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
          Authorization: 'Bearer invalid-token'
        }
      });
      console.log('❌ Should have failed with invalid token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid token correctly rejected');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message);
      }
    }

    // 5. Test No Token
    console.log('\n5️⃣ Testing No Token...');
    try {
      await axios.get(`${BASE_URL}/auth/me`);
      console.log('❌ Should have failed with no token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ No token correctly rejected');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message);
      }
    }

    console.log('\n🎉 All authentication tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Install axios if not present
const { execSync } = require('child_process');
try {
  require('axios');
} catch (e) {
  console.log('Installing axios for testing...');
  execSync('npm install axios', { stdio: 'inherit' });
}

testAuth();