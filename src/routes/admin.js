const express = require('express');
const { requireAdmin } = require('../middlewares/roleMiddleware');
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  getAllStudents,
  getStudentById,
  getDashboardStats,
  updateStudentProfile,
} = require('../controllers/adminController');

const router = express.Router();

// Apply authentication and admin role check to all admin routes
router.use(verifyToken);
router.use(requireAdmin);

// GET /api/admin/dashboard - Get dashboard statistics
router.get('/dashboard', getDashboardStats);

// GET /api/admin/students - Get all students
router.get('/students', getAllStudents);

// GET /api/admin/students/:studentId - Get specific student
router.get('/students/:studentId', getStudentById);

// PUT /api/admin/students/:studentId/profile - Update student profile
router.put('/students/:studentId/profile', updateStudentProfile);

module.exports = router;