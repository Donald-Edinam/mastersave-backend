const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        profile: true,
        transactions: {
          orderBy: { date: 'desc' },
          take: 5, // Last 5 transactions per student
        },
        budgets: {
          where: { isActive: true },
        },
        _count: {
          select: {
            transactions: true,
            budgets: true,
            nudges: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Remove passwords from response
    const studentsWithoutPasswords = students.map(student => {
      const { password, ...studentWithoutPassword } = student;
      return studentWithoutPassword;
    });

    res.json({
      success: true,
      data: {
        students: studentsWithoutPasswords,
        total: studentsWithoutPasswords.length,
      },
    });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await prisma.user.findUnique({
      where: { 
        id: studentId,
        role: 'STUDENT',
      },
      include: {
        profile: true,
        transactions: {
          orderBy: { date: 'desc' },
        },
        budgets: {
          orderBy: { startDate: 'desc' },
        },
        nudges: {
          include: {
            rule: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Remove password from response
    const { password, ...studentWithoutPassword } = student;

    res.json({
      success: true,
      data: {
        student: studentWithoutPassword,
      },
    });
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalTransactions,
      totalBudgets,
      activeNudges,
      recentTransactions,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.transaction.count(),
      prisma.budget.count(),
      prisma.nudge.count({ where: { isRead: false } }),
      prisma.transaction.findMany({
        take: 10,
        orderBy: { date: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    // Calculate total spending
    const totalSpending = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalTransactions,
          totalBudgets,
          activeNudges,
          totalSpending: totalSpending._sum.amount || 0,
        },
        recentTransactions,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Update student profile (admin can modify student profiles)
const updateStudentProfile = async (req, res) => {
  try {
    const { studentId } = req.params;
    const updateData = req.body;

    // Verify student exists
    const student = await prisma.user.findUnique({
      where: { 
        id: studentId,
        role: 'STUDENT',
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Update profile
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: studentId },
      update: updateData,
      create: {
        userId: studentId,
        ...updateData,
      },
    });

    res.json({
      success: true,
      message: 'Student profile updated successfully',
      data: {
        profile: updatedProfile,
      },
    });
  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  getDashboardStats,
  updateStudentProfile,
};