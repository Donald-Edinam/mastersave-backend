const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MasterSave API',
      version: '1.0.0',
      description: 'A comprehensive financial management API for students with role-based access control',
      contact: {
        name: 'MasterSave Team',
        email: 'support@mastersave.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique user identifier',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            firstName: {
              type: 'string',
              description: 'User first name',
            },
            lastName: {
              type: 'string',
              description: 'User last name',
            },
            role: {
              type: 'string',
              enum: ['STUDENT', 'ADMIN'],
              description: 'User role',
            },
            provider: {
              type: 'string',
              description: 'Authentication provider',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp',
            },
          },
        },
        Profile: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique profile identifier',
            },
            userId: {
              type: 'string',
              description: 'Associated user ID',
            },
            university: {
              type: 'string',
              description: 'University name',
            },
            city: {
              type: 'string',
              description: 'City name',
            },
            currency: {
              type: 'string',
              description: 'Preferred currency',
            },
            stipendAmount: {
              type: 'number',
              format: 'float',
              description: 'Monthly stipend amount',
            },
            disbursementFrequency: {
              type: 'string',
              description: 'How often stipend is received',
            },
            savingsGoalPct: {
              type: 'number',
              format: 'float',
              description: 'Savings goal percentage',
            },
            lockedSavings: {
              type: 'number',
              format: 'float',
              description: 'Amount in locked savings',
            },
            weeks: {
              type: 'integer',
              description: 'Number of weeks in budget cycle',
            },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique transaction identifier',
            },
            userId: {
              type: 'string',
              description: 'Associated user ID',
            },
            category: {
              type: 'string',
              description: 'Transaction category',
            },
            amount: {
              type: 'number',
              format: 'float',
              description: 'Transaction amount',
            },
            description: {
              type: 'string',
              description: 'Transaction description',
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'Transaction date',
            },
          },
        },
        Budget: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique budget identifier',
            },
            userId: {
              type: 'string',
              description: 'Associated user ID',
            },
            weekNumber: {
              type: 'integer',
              description: 'Week number in budget cycle',
            },
            totalBudget: {
              type: 'number',
              format: 'float',
              description: 'Total budget amount',
            },
            spentAmount: {
              type: 'number',
              format: 'float',
              description: 'Amount already spent',
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Budget period start date',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'Budget period end date',
            },
            isActive: {
              type: 'boolean',
              description: 'Whether budget is currently active',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            error: {
              type: 'string',
              description: 'Detailed error information',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              description: 'Success message',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [__dirname + '/../routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi,
};