const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const testDbConnection = async (req, res) => {
    try {
        // Test the database connection by fetching the test user
        const testUser = await prisma.user.findFirst({
            where: {
                email: 'test@example.com'
            },
            include: {
                profile: true,
                transactions: true,
                budgets: true,
            }
        });

        if (!testUser) {
            return res.status(404).json({
                success: false,
                message: 'Test user not found. Run seed script first.',
            });
        }

        res.json({
            success: true,
            message: 'Database connection successful!',
            data: {
                user: testUser,
                totalUsers: await prisma.user.count(),
                totalTransactions: await prisma.transaction.count(),
                totalBudgets: await prisma.budget.count(),
            }
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
};

module.exports = {
    testDbConnection
};