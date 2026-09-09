/**
 * server.js
 * ---------------------------------------------------------------------------
 * Entry point for the Intelligent Graph Algorithm Analyzer backend.
 *
 * Responsibilities of this backend (see README "Architecture"):
 *   - Serve the cleaned worldcities.csv dataset (search/filter/paginate).
 *   - Build weighted nearest-neighbor graphs from selected cities.
 *   - Execute Dijkstra / Prim / Floyd-Warshall deterministically.
 *   - Proxy AI requests to OpenAI so the API key never reaches the browser.
 *
 * No database is used: the dataset is static (loaded once from CSV) and
 * every other computation is stateless and cheap enough to redo per
 * request, which keeps the architecture simple and easy to explain in a
 * viva.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const citiesRoutes = require('./routes/cities');
const graphRoutes = require('./routes/graph');
const algorithmRoutes = require('./routes/algorithms');
const tspRoutes = require('./routes/tsp');
const aiRoutes = require('./routes/ai');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: '1mb' }));

// General API rate limit (separate, stricter limit applies to /api/ai/*).
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', generalLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'intelligent-graph-algorithm-analyzer-api' });
});

app.use('/api/cities', citiesRoutes);
app.use('/api/graph', graphRoutes);
app.use('/api/algorithm', algorithmRoutes);
app.use('/api/tsp', tspRoutes);
app.use('/api/ai', aiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// Note: cities/graph/algorithm controllers are synchronous, so Express 4
// automatically forwards thrown AppErrors to errorHandler. The AI
// controllers are async and are wrapped with asyncHandler in routes/ai.js
// so their rejected promises also reach errorHandler.
process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('[Unhandled Rejection]', reason);
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Intelligent Graph Algorithm Analyzer API running on http://localhost:${PORT}`);
  if (!process.env.OPENAI_API_KEY) {
    // eslint-disable-next-line no-console
    console.warn('  ⚠ OPENAI_API_KEY not set - AI features will return a 503 until configured in server/.env');
  }
});

module.exports = app;
