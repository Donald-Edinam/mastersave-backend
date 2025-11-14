const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testRoleBasedAuth() {
    console.log('🧪 Testing Role-Based Authentication System\n');

    try {
        // Test 1: Create an admin user
        console.log('1️⃣ Creating admin user...');
        const adminSignup = await axios.post(`${BASE_URL}/auth/signup`, {
            email: 'admin@test.com',
            password: 'admin123',
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN'
        });
        console.log('✅ Admin created:', adminSignup.data.data.user.role);
        const adminToken = adminSignup.data.data.token;

        // Test 2: Create a student user
        console.log('\n2️⃣ Creating student user...');
        const studentSignup = await axios.post(`${BASE_URL}/auth/signup`, {
            email: 'student@test.com',
            password: 'student123',
            firstName: 'Student',
            lastName: 'User',
            role: 'STUDENT',
            university: 'Test University',
            city: 'Test City',
            currency: 'USD',
            stipendAmount: 1500,
            disbursementFrequency: 'monthly',
            savingsGoalPct: 20
        });
        console.log('✅ Student created:', studentSignup.data.data.user.role);
        const studentToken = studentSignup.data.data.token;

        // Test 3: Admin accessing admin dashboard
        console.log('\n3️⃣ Admin accessing dashboard...');
        const adminDashboard = await axios.get(`${BASE_URL}/admin/dashboard`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Admin dashboard access successful');
        console.log('📊 Dashboard stats:', adminDashboard.data.data.stats);

        // Test 4: Admin getting all students
        console.log('\n4️⃣ Admin getting all students...');
        const allStudents = await axios.get(`${BASE_URL}/admin/students`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Admin can view students:', allStudents.data.data.total, 'students found');

        // Test 5: Student trying to access admin routes (should fail)
        console.log('\n5️⃣ Student trying to access admin dashboard (should fail)...');
        try {
            await axios.get(`${BASE_URL}/admin/dashboard`, {
                headers: { Authorization: `Bearer ${studentToken}` }
            });
            console.log('❌ ERROR: Student should not have access to admin routes!');
        } catch (error) {
            if (error.response?.status === 403) {
                console.log('✅ Correctly blocked student from admin routes');
                console.log('🔒 Error:', error.response.data.error);
            } else {
                console.log('❌ Unexpected error:', error.response?.data || error.message);
            }
        }

        // Test 6: Student accessing their own profile
        console.log('\n6️⃣ Student accessing their profile...');
        const studentProfile = await axios.get(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        console.log('✅ Student can access their profile');
        console.log('👤 Student info:', {
            name: `${studentProfile.data.data.user.firstName} ${studentProfile.data.data.user.lastName}`,
            role: studentProfile.data.data.user.role,
            university: studentProfile.data.data.user.profile?.university
        });

        // Test 7: Login with role verification
        console.log('\n7️⃣ Testing login with role verification...');
        const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@test.com',
            password: 'admin123'
        });
        console.log('✅ Admin login successful, role:', adminLogin.data.data.user.role);

        const studentLogin = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'student@test.com',
            password: 'student123'
        });
        console.log('✅ Student login successful, role:', studentLogin.data.data.user.role);

        console.log('\n🎉 All role-based authentication tests passed!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testRoleBasedAuth();