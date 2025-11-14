const express = require('express');
const { testDbConnection } = require('../controllers/testDbController');

const router = express.Router();

router.get('/', testDbConnection);

module.exports = router;