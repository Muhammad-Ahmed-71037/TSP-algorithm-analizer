const express = require('express');
const router = express.Router();
const controller = require('../controllers/citiesController');

router.get('/', controller.getCities); // GET /api/cities?search=&country=&sortBy=&order=&page=&pageSize=
router.get('/stats', controller.getStats); // GET /api/cities/stats
router.get('/countries', controller.getCountries); // GET /api/cities/countries
router.get('/corridor', controller.getCorridor); // GET /api/cities/corridor?source=&destination=&count=
router.post('/batch', controller.getCitiesBatch); // POST /api/cities/batch { ids: [] }

module.exports = router;
