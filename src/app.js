const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('express-async-errors');
require('dotenv').config();

const healthRoutes = require('./routes/health');
const testDbRoutes = require('./routes/testDb');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/health', healthRoutes);
app.use('/test-db', testDbRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;