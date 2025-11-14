require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'hashedpassword123',
      provider: 'email',
      profile: {
        create: {
          university: 'Test University',
          city: 'Test City',
          totalStipend: 1000.0,
          savingsGoalPct: 20.0,
          lockedSavings: 0.0,
          weeks: 4,
        },
      },
    },
    include: {
      profile: true,
    },
  });

  // Create a sample rule
  const sampleRule = await prisma.rule.create({
    data: {
      title: 'Budget Alert',
      description: 'Alert when 80% of budget is spent',
      triggerType: 'spending_threshold',
      thresholdPct: 80.0,
      messageTemplate: 'You have spent {percentage}% of your budget!',
      isActive: true,
    },
  });

  // Create a sample transaction
  await prisma.transaction.create({
    data: {
      userId: testUser.id,
      category: 'Food',
      amount: 25.50,
      description: 'Lunch at campus cafeteria',
    },
  });

  // Create a sample budget
  await prisma.budget.create({
    data: {
      userId: testUser.id,
      weekNumber: 1,
      totalBudget: 200.0,
      spentAmount: 25.50,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      isActive: true,
    },
  });

  console.log('Seed data created successfully!');
  console.log('Test user:', testUser);
  console.log('Sample rule:', sampleRule);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });