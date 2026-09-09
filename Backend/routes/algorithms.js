const express = require('express');
const router = express.Router();
const controller = require('../controllers/algorithmController');

router.post('/dijkstra', controller.runDijkstra); // { cityIds, k, source, destination }
router.post('/prim', controller.runPrim); // { cityIds, k, source(start) }
router.post('/floyd-warshall', controller.runFloydWarshall); // { cityIds, k, source?, destination? }

module.exports = router;
