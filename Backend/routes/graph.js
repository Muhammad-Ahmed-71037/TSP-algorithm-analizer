const express = require('express');
const router = express.Router();
const controller = require('../controllers/graphController');

router.post('/', controller.generateGraph); // POST /api/graph { cityIds, k }

module.exports = router;
