const express = require('express');
const { createOrUpdateProfile, getProfile } = require('../controllers/profileController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management with auto-budget calculation
 */

/**
 * @swagger
 * /profile:
 *   post:
 *     summary: Create or update user profile with auto-budget calculation
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stipendAmount
 *               - savingsGoalPct
 *             properties:
 *               university:
 *                 type: string
 *                 example: "University of Example"
 *               city:
 *                 type: string
 *                 example: "Example City"
 *               currency:
 *                 type: string
 *                 default: "USD"
 *                 example: "USD"
 *               stipendAmount:
 *                 type: number
 *                 format: float
 *                 example: 1500
 *                 description: "Total monthly stipend amount"
 *               disbursementFrequency:
 *                 type: string
 *                 default: "monthly"
 *                 example: "monthly"
 *               savingsGoalPct:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 20
 *                 description: "Percentage of stipend to lock as savings (0-100)"
 *               weeks:
 *                 type: integer
 *                 default: 4
 *                 example: 4
 *                 description: "Number of weeks to divide remaining budget into"
 *     responses:
 *       200:
 *         description: Profile updated successfully with auto-budget calculation
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
 *                         budgets:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Budget'
 *                         calculations:
 *                           type: object
 *                           properties:
 *                             totalStipend:
 *                               type: number
 *                               format: float
 *                               description: "Total stipend amount"
 *                             lockedSavings:
 *                               type: number
 *                               format: float
 *                               description: "Amount locked for savings"
 *                             remainingForBudgets:
 *                               type: number
 *                               format: float
 *                               description: "Amount available for weekly budgets"
 *                             weeklyBudget:
 *                               type: number
 *                               format: float
 *                               description: "Budget per week"
 *                             totalWeeklyBudgets:
 *                               type: number
 *                               format: float
 *                               description: "Sum of all weekly budgets"
 *                             verification:
 *                               type: object
 *                               properties:
 *                                 totalBudgets:
 *                                   type: number
 *                                   format: float
 *                                 plusLockedSavings:
 *                                   type: number
 *                                   format: float
 *                                 equalsStipend:
 *                                   type: number
 *                                   format: float
 *                                 isValid:
 *                                   type: boolean
 *                                   description: "Whether total budgets + locked savings = stipend"
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authMiddleware, createOrUpdateProfile);

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile with computed budget values
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *                           allOf:
 *                             - $ref: '#/components/schemas/Profile'
 *                             - type: object
 *                               properties:
 *                                 user:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: string
 *                                     email:
 *                                       type: string
 *                                     firstName:
 *                                       type: string
 *                                     lastName:
 *                                       type: string
 *                                     role:
 *                                       type: string
 *                         budgets:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Budget'
 *                         calculations:
 *                           type: object
 *                           properties:
 *                             totalStipend:
 *                               type: number
 *                               format: float
 *                             lockedSavings:
 *                               type: number
 *                               format: float
 *                             remainingForBudgets:
 *                               type: number
 *                               format: float
 *                             weeklyBudget:
 *                               type: number
 *                               format: float
 *                             totalWeeklyBudgets:
 *                               type: number
 *                               format: float
 *                             verification:
 *                               type: object
 *                               properties:
 *                                 totalBudgets:
 *                                   type: number
 *                                   format: float
 *                                 plusLockedSavings:
 *                                   type: number
 *                                   format: float
 *                                 equalsStipend:
 *                                   type: number
 *                                   format: float
 *                                 isValid:
 *                                   type: boolean
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authMiddleware, getProfile);

module.exports = router;