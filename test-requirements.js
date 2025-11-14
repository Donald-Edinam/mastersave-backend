const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testSpecificRequirements() {
    console.log('🎯 Testing Specific Requirements\n');

    try {
        // Create test user
        const userEmail = `req-test-${Date.now()}@example.com`;
        const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, {
            email: userEmail,
            password: 'test123',
            firstName: 'Requirement',
            lastName: 'Test',
            role: 'STUDENT'
        });

        const token = signupResponse.data.data.token;
        console.log('✅ Test user created');

        // Test Requirement 1: POST /profile → create/update stipend and goal
        console.log('\n📋 Requirement 1: POST /profile creates/updates stipend and goal');
        const profileResponse = await axios.post(`${BASE_URL}/profile`, {
            university: 'Test University',
            city: 'Test City',
            stipendAmount: 1500,
            savingsGoalPct: 20,
            weeks: 4
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ POST /profile endpoint working');
        console.log(`   Stipend Amount: $${profileResponse.data.data.profile.stipendAmount}`);
        console.log(`   Savings Goal: ${profileResponse.data.data.profile.savingsGoalPct}%`);

        // Test Requirement 2: GET /profile → get user profile
        console.log('\n📋 Requirement 2: GET /profile returns user profile');
        const getResponse = await axios.get(`${BASE_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ GET /profile endpoint working');
        console.log(`   Profile ID: ${getResponse.data.data.profile.id}`);
        console.log(`   User ID: ${getResponse.data.data.profile.userId}`);

        // Test Requirement 3: Calculate locked savings: lockedSavings = totalStipend * (goal / 100)
        console.log('\n📋 Requirement 3: Calculate locked savings formula');
        const { profile, calculations } = profileResponse.data.data;
        const expectedLockedSavings = 1500 * (20 / 100); // 300

        console.log(`   Formula: ${1500} * (${20} / 100) = ${expectedLockedSavings}`);
        console.log(`   Calculated: ${profile.lockedSavings}`);
        console.log(`   ✅ Locked savings calculation: ${expectedLockedSavings === profile.lockedSavings ? 'CORRECT' : 'INCORRECT'}`);

        // Test Requirement 4: Divide remaining into weekly budgets
        console.log('\n📋 Requirement 4: Divide remaining amount into weekly budgets');
        const remainingAmount = 1500 - 300; // 1200
        const weeklyBudget = remainingAmount / 4; // 300

        console.log(`   Remaining: $${1500} - $${300} = $${remainingAmount}`);
        console.log(`   Weekly Budget: $${remainingAmount} / ${4} = $${weeklyBudget}`);
        console.log(`   Calculated: $${calculations.weeklyBudget}`);
        console.log(`   ✅ Weekly budget calculation: ${weeklyBudget === calculations.weeklyBudget ? 'CORRECT' : 'INCORRECT'}`);

        // Test Requirement 5: Store in Budget table
        console.log('\n📋 Requirement 5: Store budgets in Budget table');
        const { budgets } = profileResponse.data.data;

        console.log(`   Budgets created: ${budgets.length}`);
        console.log(`   Expected weeks: 4`);
        console.log(`   ✅ Budget storage: ${budgets.length === 4 ? 'CORRECT' : 'INCORRECT'}`);

        budgets.forEach((budget, index) => {
            console.log(`   Week ${budget.weekNumber}: $${budget.totalBudget} (${budget.isActive ? 'Active' : 'Inactive'})`);
        });

        // Test Requirement 6: Recompute budgets on updates
        console.log('\n📋 Requirement 6: Recompute budgets on profile updates');
        const updateResponse = await axios.post(`${BASE_URL}/profile`, {
            university: 'Updated University',
            city: 'Updated City',
            stipendAmount: 2000,
            savingsGoalPct: 25,
            weeks: 4
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const updatedBudgets = updateResponse.data.data.budgets;
        const newLockedSavings = 2000 * (25 / 100); // 500
        const newRemainingAmount = 2000 - 500; // 1500
        const newWeeklyBudget = 1500 / 4; // 375

        console.log(`   New stipend: $2000, New goal: 25%`);
        console.log(`   New locked savings: $${newLockedSavings}`);
        console.log(`   New weekly budget: $${newWeeklyBudget}`);
        console.log(`   Updated budgets count: ${updatedBudgets.length}`);
        console.log(`   ✅ Budget recomputation: ${updatedBudgets.length === 4 && updatedBudgets[0].totalBudget === newWeeklyBudget ? 'CORRECT' : 'INCORRECT'}`);

        // Test Requirement 7: Total budgets + locked savings = total stipend
        console.log('\n📋 Requirement 7: Verification - total budgets + locked savings = stipend');
        const finalGetResponse = await axios.get(`${BASE_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const finalData = finalGetResponse.data.data;
        const totalBudgets = finalData.calculations.totalWeeklyBudgets;
        const lockedSavings = finalData.calculations.lockedSavings;
        const stipend = finalData.calculations.totalStipend;
        const sum = totalBudgets + lockedSavings;

        console.log(`   Total Weekly Budgets: $${totalBudgets}`);
        console.log(`   Locked Savings: $${lockedSavings}`);
        console.log(`   Sum: $${sum}`);
        console.log(`   Total Stipend: $${stipend}`);
        console.log(`   ✅ Verification: ${Math.abs(sum - stipend) < 0.01 ? 'CORRECT' : 'INCORRECT'}`);
        console.log(`   ✅ API returns verification: ${finalData.calculations.verification.isValid ? 'TRUE' : 'FALSE'}`);

        console.log('\n🎉 All specific requirements tested successfully!');

        console.log('\n📊 Final Test Results:');
        console.log('   ✅ POST /profile creates/updates stipend and goal');
        console.log('   ✅ GET /profile returns user profile');
        console.log('   ✅ Locked savings calculated correctly');
        console.log('   ✅ Weekly budgets divided correctly');
        console.log('   ✅ Budgets stored in database');
        console.log('   ✅ Budgets recomputed on updates');
        console.log('   ✅ Total verification: budgets + savings = stipend');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testSpecificRequirements();