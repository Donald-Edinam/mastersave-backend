const express = require('express');
const { testDbConnection } = require('../controllers/testDbController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Database Testing
 *   description: Database connection testing endpoints
 */

/**
 * @swagger
 * /test-db:
 *   get:
 *     summary: Test database connection
 *     tags: [Database Testing]
 *     responses:
 *       200:
 *         description: Database connection successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Database connection successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     database:
 *                       type: string
 *                       description: Database name
 *       500:
 *         description: Database connection failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', testDbConnection);

module.exports = router;