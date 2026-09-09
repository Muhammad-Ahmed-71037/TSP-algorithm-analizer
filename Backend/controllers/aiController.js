const aiService = require('../services/aiService');
const { AppError } = require('../middleware/errorHandler');

async function explain(req, res) {
  const { context } = req.body;
  if (!context || typeof context !== 'object') {
    throw new AppError('Missing algorithm result context for AI explanation.');
  }
  const explanation = await aiService.explainResult(context);
  res.json({ explanation });
}

async function tutor(req, res) {
  const { question, context } = req.body;
  if (!question || typeof question !== 'string' || !question.trim()) {
    throw new AppError('A question is required to ask the AI tutor.');
  }
  if (question.length > 1000) {
    throw new AppError('Question is too long (max 1000 characters).');
  }
  const answer = await aiService.tutorAnswer(question.trim(), context);
  res.json({ answer });
}

async function compare(req, res) {
  const { results } = req.body;
  if (!Array.isArray(results) || results.length < 2) {
    throw new AppError('Provide at least 2 algorithm results to compare.');
  }
  const comparison = await aiService.compareResults(results);
  res.json({ comparison });
}

async function performance(req, res) {
  const { metrics } = req.body;
  if (!metrics || typeof metrics !== 'object') {
    throw new AppError('Missing performance metrics for AI analysis.');
  }
  const analysis = await aiService.explainPerformance(metrics);
  res.json({ analysis });
}

module.exports = { explain, tutor, compare, performance };
