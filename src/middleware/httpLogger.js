const morgan = require('morgan');
const logger = require('../config/logger');

// Create a stream object for Morgan to write to our logger
const stream = {
  write: (message) => logger.http(message.trim()),
};

// Skip logging during tests unless explicitly enabled
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'test' && !process.env.ENABLE_LOGGING;
};

// Morgan middleware configuration
const httpLogger = morgan(
  // Define the format (combined is Apache Common Log format)
  process.env.NODE_ENV === 'production'
    ? 'combined'
    : ':method :url :status :res[content-length] - :response-time ms',
  {
    stream,
    skip,
  }
);

module.exports = httpLogger;