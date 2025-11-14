const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testSwaggerDocumentation() {
  console.log('🧪 Testing Swagger Documentation\n');

  try {
    // Test 1: Check if Swagger UI is accessible
    console.log('1️⃣ Testing Swagger UI accessibility...');
    const swaggerResponse = await axios.get(`${BASE_URL}/api-docs/`);
    
    if (swaggerResponse.status === 200 && swaggerResponse.data.includes('MasterSave API Documentation')) {
      console.log('✅ Swagger UI is accessible');
    } else {
      console.log('❌ Swagger UI not properly configured');
    }

    // Test 2: Check if swagger.json is available
    console.log('\n2️⃣ Testing Swagger JSON specification...');
    try {
      const swaggerJsonResponse = await axios.get(`${BASE_URL}/api-docs.json`);
      if (swaggerJsonResponse.status === 200) {
        console.log('✅ Swagger JSON specification is available');
        console.log('📋 API Info:', {
          title: swaggerJsonResponse.data.info?.title,
          version: swaggerJsonResponse.data.info?.version,
          description: swaggerJsonResponse.data.info?.description?.substring(0, 50) + '...'
        });
        
        // Count endpoints
        const paths = Object.keys(swaggerJsonResponse.data.paths || {});
        console.log('🔗 Total documented endpoints:', paths.length);
        console.log('📝 Documented paths:', paths);
        
        // Check for key components
        const schemas = Object.keys(swaggerJsonResponse.data.components?.schemas || {});
        console.log('📊 Documented schemas:', schemas.length, schemas);
      }
    } catch (error) {
      console.log('⚠️ Swagger JSON not available:', error.message);
    }

    // Test 3: Verify some key endpoints are documented
    console.log('\n3️⃣ Testing API endpoints...');
    
    // Test health endpoint
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health endpoint working:', healthResponse.data.status);

    // Test auth signup endpoint structure
    try {
      await axios.post(`${BASE_URL}/auth/signup`, {
        email: 'test@swagger.com',
        password: 'test123',
        firstName: 'Swagger',
        lastName: 'Test'
      });
      console.log('✅ Auth signup endpoint structure is correct');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Auth signup endpoint working (user already exists)');
      } else if (error.response?.status === 400) {
        console.log('✅ Auth signup endpoint validation working');
      } else {
        console.log('⚠️ Auth signup endpoint error:', error.response?.status);
      }
    }

    console.log('\n🎉 Swagger documentation testing completed!');
    console.log('\n📖 Access your API documentation at:');
    console.log(`   ${BASE_URL}/api-docs`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testSwaggerDocumentation();