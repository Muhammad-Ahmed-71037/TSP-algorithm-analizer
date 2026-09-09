const express = require('express');
const router = express.Router();
const controller = require('../controllers/tspController');

router.post('/graph', controller.generateTSPGraph); // { cityIds }
router.post('/dynamic-programming', controller.runDynamicProgramming); // { source, destinationIds }
router.post('/greedy', controller.runGreedy); // { source, destinationIds }
router.post('/dijkstra', controller.runDijkstraTSP); // { source, destinationIds, k? }

module.exports = router;
