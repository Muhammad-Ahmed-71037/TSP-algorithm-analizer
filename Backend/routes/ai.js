const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const controller = require('../controllers/aiController');
const aiTspService = require('../services/aiTspService');

// AI calls cost money and take time - rate-limit them independently of the
// general API limiter so a runaway frontend loop can't rack up API usage.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many AI requests. Please wait a moment before trying again.' },
});

router.use(aiLimiter);

router.post('/explain', asyncHandler(controller.explain));
router.post('/tutor', asyncHandler(controller.tutor));
router.post('/compare', asyncHandler(controller.compare));
router.post('/performance', asyncHandler(controller.performance));
router.post('/tsp-solve', asyncHandler(aiTspService.solve));

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

module.exports = router;
