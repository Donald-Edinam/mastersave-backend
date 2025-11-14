const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create or update user profile with auto-budget calculation
const createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      university,
      city,
      currency = 'USD',
      stipendAmount,
      disbursementFrequency = 'monthly',
      savingsGoalPct,
      weeks = 4
    } = req.body;

    // Validate required fields
    if (!stipendAmount || savingsGoalPct === undefined || savingsGoalPct === null) {
      return res.status(400).json({
        success: false,
        message: 'Stipend amount and savings goal percentage are required',
      });
    }

    // Validate savings goal percentage (should be between 0 and 100)
    if (savingsGoalPct < 0 || savingsGoalPct > 100) {
      return res.status(400).json({
        success: false,
        message: 'Savings goal percentage must be between 0 and 100',
      });
    }

    // Calculate locked savings: lockedSavings = totalStipend * (goal / 100)
    const lockedSavings = stipendAmount * (savingsGoalPct / 100);
    
    // Calculate remaining amount for weekly budgets
    const remainingAmount = stipendAmount - lockedSavings;
    const weeklyBudget = remainingAmount / weeks;

    // Create or update profile
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        university: university || 'Not specified',
        city: city || 'Not specified',
        currency,
        stipendAmount,
        disbursementFrequency,
        savingsGoalPct,
        lockedSavings,
        weeks,
      },
      create: {
        userId,
        university: university || 'Not specified',
        city: city || 'Not specified',
        currency,
        stipendAmount,
        disbursementFrequency,
        savingsGoalPct,
        lockedSavings,
        weeks,
      },
    });

    // Clear existing budgets for this user
    await prisma.budget.deleteMany({
      where: { userId },
    });

    // Create new weekly budgets
    const budgets = [];
    const currentDate = new Date();
    
    for (let week = 1; week <= weeks; week++) {
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() + (week - 1) * 7);
      
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      
      const budget = await prisma.budget.create({
        data: {
          userId,
          weekNumber: week,
          totalBudget: weeklyBudget,
          spentAmount: 0,
          startDate,
          endDate,
          isActive: week === 1, // Only first week is active initially
        },
      });
      
      budgets.push(budget);
    }

    // Fetch the complete profile with budgets
    const completeProfile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully with auto-budget calculation',
      data: {
        profile: completeProfile,
        budgets,
        calculations: {
          totalStipend: stipendAmount,
          lockedSavings,
          remainingForBudgets: remainingAmount,
          weeklyBudget,
          totalWeeklyBudgets: weeklyBudget * weeks,
          verification: {
            totalBudgets: weeklyBudget * weeks,
            plusLockedSavings: lockedSavings,
            equalsStipend: stipendAmount,
            isValid: Math.abs((weeklyBudget * weeks + lockedSavings) - stipendAmount) < 0.01
          }
        },
      },
    });
  } catch (error) {
    console.error('Create/Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Get user profile with budgets
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found',
      });
    }

    // Get associated budgets
    const budgets = await prisma.budget.findMany({
      where: { userId },
      orderBy: { weekNumber: 'asc' },
    });

    // Calculate verification data
    const totalWeeklyBudgets = budgets.reduce((sum, budget) => sum + budget.totalBudget, 0);
    const verification = {
      totalBudgets: totalWeeklyBudgets,
      plusLockedSavings: profile.lockedSavings,
      equalsStipend: profile.stipendAmount,
      isValid: Math.abs((totalWeeklyBudgets + profile.lockedSavings) - profile.stipendAmount) < 0.01
    };

    res.json({
      success: true,
      data: {
        profile,
        budgets,
        calculations: {
          totalStipend: profile.stipendAmount,
          lockedSavings: profile.lockedSavings,
          remainingForBudgets: profile.stipendAmount - profile.lockedSavings,
          weeklyBudget: budgets.length > 0 ? budgets[0].totalBudget : 0,
          totalWeeklyBudgets,
          verification
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = {
  createOrUpdateProfile,
  getProfile,
};