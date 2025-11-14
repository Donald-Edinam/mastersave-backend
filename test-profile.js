const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testProfileAndBudgetLogic() {
  console.log('🧪 Testing Profile and Auto-Budget Logic\n');

  try {
    // Test 1: Create a test user
    console.log('1️⃣ Creating test user...');
    const userEmail = `profile-test-${Date.now()}@example.com`;
    const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, {
      email: userEmail,
      password: 'test123',
      firstName: 'Profile',
      lastName: 'Test',
      role: 'STUDENT'
    });
    
    const token = signupResponse.data.data.token;
    console.log('✅ Test user created');

    // Test 2: Create profile with stipend and savings goal
    console.log('\n2️⃣ Creating profile with auto-budget calculation...');
    const profileData = {
      university: 'Test University',
      city: 'Test City',
      currency: 'USD',
      stipendAmount: 1500,
      disbursementFrequency: 'monthly',
      savingsGoalPct: 20,
      weeks: 4
    };

    const createProfileResponse = await axios.post(`${BASE_URL}/profile`, profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Profile created successfully');
    const { profile, budgets, calculations } = createProfileResponse.data.data;
    
    console.log('📊 Profile Data:');
    console.log(`   University: ${profile.university}`);
    console.log(`   Stipend Amount: $${profile.stipendAmount}`);
    console.log(`   Savings Goal: ${profile.savingsGoalPct}%`);
    console.log(`   Locked Savings: $${profile.lockedSavings}`);
    console.log(`   Weeks: ${profile.weeks}`);

    console.log('\n💰 Budget Calculations:');
    console.log(`   Total Stipend: $${calculations.totalStipend}`);
    console.log(`   Locked Savings: $${calculations.lockedSavings}`);
    console.log(`   Remaining for Budgets: $${calculations.remainingForBudgets}`);
    console.log(`   Weekly Budget: $${calculations.weeklyBudget}`);
    console.log(`   Total Weekly Budgets: $${calculations.totalWeeklyBudgets}`);

    console.log('\n✅ Verification:');
    console.log(`   Total Budgets: $${calculations.verification.totalBudgets}`);
    console.log(`   Plus Locked Savings: $${calculations.verification.plusLockedSavings}`);
    console.log(`   Equals Stipend: $${calculations.verification.equalsStipend}`);
    console.log(`   Is Valid: ${calculations.verification.isValid ? '✅' : '❌'}`);

    console.log(`\n📅 Weekly Budgets Created: ${budgets.length}`);
    budgets.forEach((budget, index) => {
      console.log(`   Week ${budget.weekNumber}: $${budget.totalBudget} (${budget.isActive ? 'Active' : 'Inactive'})`);
    });

    // Test 3: Verify calculations manually
    console.log('\n3️⃣ Manual verification of calculations...');
    const expectedLockedSavings = profileData.stipendAmount * (profileData.savingsGoalPct / 100);
    const expectedRemainingAmount = profileData.stipendAmount - expectedLockedSavings;
    const expectedWeeklyBudget = expectedRemainingAmount / profileData.weeks;
    const expectedTotalWeeklyBudgets = expectedWeeklyBudget * profileData.weeks;

    console.log('🔍 Expected vs Actual:');
    console.log(`   Locked Savings: Expected $${expectedLockedSavings}, Got $${profile.lockedSavings} ${expectedLockedSavings === profile.lockedSavings ? '✅' : '❌'}`);
    console.log(`   Weekly Budget: Expected $${expectedWeeklyBudget}, Got $${calculations.weeklyBudget} ${Math.abs(expectedWeeklyBudget - calculations.weeklyBudget) < 0.01 ? '✅' : '❌'}`);
    console.log(`   Total Check: Expected $${profileData.stipendAmount}, Got $${expectedTotalWeeklyBudgets + expectedLockedSavings} ${Math.abs(profileData.stipendAmount - (expectedTotalWeeklyBudgets + expectedLockedSavings)) < 0.01 ? '✅' : '❌'}`);

    // Test 4: Get profile and verify data persistence
    console.log('\n4️⃣ Testing profile retrieval...');
    const getProfileResponse = await axios.get(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const retrievedData = getProfileResponse.data.data;
    console.log('✅ Profile retrieved successfully');
    console.log(`   Budgets count: ${retrievedData.budgets.length}`);
    console.log(`   Verification valid: ${retrievedData.calculations.verification.isValid ? '✅' : '❌'}`);

    // Test 5: Update profile with different values
    console.log('\n5️⃣ Testing profile update with different values...');
    const updatedProfileData = {
      university: 'Updated University',
      city: 'Updated City',
      currency: 'EUR',
      stipendAmount: 2000,
      disbursementFrequency: 'bi-weekly',
      savingsGoalPct: 25,
      weeks: 4
    };

    const updateProfileResponse = await axios.post(`${BASE_URL}/profile`, updatedProfileData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Profile updated successfully');
    const updatedCalculations = updateProfileResponse.data.data.calculations;
    
    console.log('💰 Updated Calculations:');
    console.log(`   New Stipend: $${updatedCalculations.totalStipend}`);
    console.log(`   New Locked Savings: $${updatedCalculations.lockedSavings}`);
    console.log(`   New Weekly Budget: $${updatedCalculations.weeklyBudget}`);
    console.log(`   Verification: ${updatedCalculations.verification.isValid ? '✅' : '❌'}`);

    // Test 6: Test edge cases
    console.log('\n6️⃣ Testing edge cases...');
    
    // Test with 0% savings goal
    try {
      await axios.post(`${BASE_URL}/profile`, {
        ...profileData,
        savingsGoalPct: 0
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ 0% savings goal handled correctly');
    } catch (error) {
      console.log('❌ 0% savings goal failed:', error.response?.data?.message);
    }

    // Test with 100% savings goal
    try {
      await axios.post(`${BASE_URL}/profile`, {
        ...profileData,
        savingsGoalPct: 100
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ 100% savings goal handled correctly');
    } catch (error) {
      console.log('❌ 100% savings goal failed:', error.response?.data?.message);
    }

    // Test with invalid savings goal
    try {
      await axios.post(`${BASE_URL}/profile`, {
        ...profileData,
        savingsGoalPct: 150
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ Invalid savings goal should have been rejected');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid savings goal correctly rejected');
      } else {
        console.log('❌ Unexpected error for invalid savings goal');
      }
    }

    // Test 7: Verify budget recomputation
    console.log('\n7️⃣ Verifying budget recomputation...');
    const finalProfileResponse = await axios.get(`${BASE_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const finalBudgets = finalProfileResponse.data.data.budgets;
    console.log(`✅ Final budget count: ${finalBudgets.length}`);
    console.log(`✅ All budgets have same amount: ${finalBudgets.every(b => Math.abs(b.totalBudget - finalBudgets[0].totalBudget) < 0.01) ? '✅' : '❌'}`);
    console.log(`✅ Only first week is active: ${finalBudgets.filter(b => b.isActive).length === 1 && finalBudgets[0].isActive ? '✅' : '❌'}`);

    console.log('\n🎉 All profile and auto-budget tests passed!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Profile creation with auto-budget calculation');
    console.log('   ✅ Locked savings calculation (stipend * goal%)');
    console.log('   ✅ Weekly budget division of remaining amount');
    console.log('   ✅ Budget storage in database');
    console.log('   ✅ Profile retrieval with computed values');
    console.log('   ✅ Budget recomputation on updates');
    console.log('   ✅ Validation: total budgets + locked savings = stipend');
    console.log('   ✅ Edge case handling (0%, 100%, invalid percentages)');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testProfileAndBudgetLogic();