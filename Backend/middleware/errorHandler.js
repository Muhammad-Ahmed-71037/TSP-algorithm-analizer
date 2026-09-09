/**
 * errorHandler.js
 * ---------------------------------------------------------------------------
 * Express error-handling middleware. Converts thrown errors into clean JSON
 * responses and NEVER leaks internal stack traces / file paths to the
 * client - only a safe message and, in development mode, the stack.
 */

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

function notFoundHandler(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // express.json() throws a SyntaxError on malformed JSON bodies - treat
  // that as a clean, operational 400 instead of a generic 500.
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({ error: 'Malformed JSON in request body.' });
  }

  const statusCode = err.statusCode || 500;
  const isDev = process.env.NODE_ENV !== 'production';

  const payload = {
    error: err.isOperational ? err.message : 'Something went wrong on the server. Please try again.',
  };

  if (isDev && !err.isOperational) {
    payload.debugMessage = err.message;
  }

  if (!err.isOperational) {
    // eslint-disable-next-line no-console
    console.error('[Unhandled Error]', err);
  }

  res.status(statusCode).json(payload);
}

module.exports = { AppError, notFoundHandler, errorHandler };
