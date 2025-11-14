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

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints for managing students and viewing analytics
 */

// Apply authentication and admin role check to all admin routes
router.use(verifyToken);
router.use(requireAdmin);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         stats:
 *                           type: object
 *                           properties:
 *                             totalStudents:
 *                               type: integer
 *                               description: Total number of students
 *                             totalTransactions:
 *                               type: integer
 *                               description: Total number of transactions
 *                             totalBudgets:
 *                               type: integer
 *                               description: Total number of budgets
 *                             activeNudges:
 *                               type: integer
 *                               description: Number of unread nudges
 *                             totalSpending:
 *                               type: number
 *                               format: float
 *                               description: Total spending across all students
 *                         recentTransactions:
 *                           type: array
 *                           items:
 *                             allOf:
 *                               - $ref: '#/components/schemas/Transaction'
 *                               - type: object
 *                                 properties:
 *                                   user:
 *                                     type: object
 *                                     properties:
 *                                       firstName:
 *                                         type: string
 *                                       lastName:
 *                                         type: string
 *                                       email:
 *                                         type: string
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/dashboard', getDashboardStats);

/**
 * @swagger
 * /admin/students:
 *   get:
 *     summary: Get all students
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         students:
 *                           type: array
 *                           items:
 *                             allOf:
 *                               - $ref: '#/components/schemas/User'
 *                               - type: object
 *                                 properties:
 *                                   profile:
 *                                     $ref: '#/components/schemas/Profile'
 *                                   transactions:
 *                                     type: array
 *                                     items:
 *                                       $ref: '#/components/schemas/Transaction'
 *                                   budgets:
 *                                     type: array
 *                                     items:
 *                                       $ref: '#/components/schemas/Budget'
 *                                   _count:
 *                                     type: object
 *                                     properties:
 *                                       transactions:
 *                                         type: integer
 *                                       budgets:
 *                                         type: integer
 *                                       nudges:
 *                                         type: integer
 *                         total:
 *                           type: integer
 *                           description: Total number of students
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/students', getAllStudents);

/**
 * @swagger
 * /admin/students/{studentId}:
 *   get:
 *     summary: Get specific student details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         student:
 *                           allOf:
 *                             - $ref: '#/components/schemas/User'
 *                             - type: object
 *                               properties:
 *                                 profile:
 *                                   $ref: '#/components/schemas/Profile'
 *                                 transactions:
 *                                   type: array
 *                                   items:
 *                                     $ref: '#/components/schemas/Transaction'
 *                                 budgets:
 *                                   type: array
 *                                   items:
 *                                     $ref: '#/components/schemas/Budget'
 *                                 nudges:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       id:
 *                                         type: string
 *                                       message:
 *                                         type: string
 *                                       isRead:
 *                                         type: boolean
 *                                       createdAt:
 *                                         type: string
 *                                         format: date-time
 *                                       rule:
 *                                         type: object
 *                                         properties:
 *                                           title:
 *                                             type: string
 *                                           description:
 *                                             type: string
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/students/:studentId', getStudentById);

/**
 * @swagger
 * /admin/students/{studentId}/profile:
 *   put:
 *     summary: Update student profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               university:
 *                 type: string
 *                 example: "Updated University"
 *               city:
 *                 type: string
 *                 example: "Updated City"
 *               currency:
 *                 type: string
 *                 example: "EUR"
 *               stipendAmount:
 *                 type: number
 *                 format: float
 *                 example: 2000
 *               disbursementFrequency:
 *                 type: string
 *                 example: "bi-weekly"
 *               savingsGoalPct:
 *                 type: number
 *                 format: float
 *                 example: 25
 *               lockedSavings:
 *                 type: number
 *                 format: float
 *                 example: 500
 *               weeks:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       200:
 *         description: Student profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         profile:
 *                           $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/students/:studentId/profile', updateStudentProfile);

module.exports = router;