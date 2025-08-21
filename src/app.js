require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');

const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API version and health check
app.get('/', (req, res) => {
  res.json({
    message: 'Social Media API',
    version: API_VERSION,
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use(`/${API_VERSION}/users`, userRoutes);
app.use(`/${API_VERSION}/posts`, postRoutes);
app.use(`/${API_VERSION}/posts`, commentRoutes);

// 404 handler
app.use('*', notFound);

// Error handling middleware
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync database models
    await sequelize.sync({ force: false });
    console.log('Database models synchronized.');

    // Start server
    app.listen(PORT, () => {
      console.log(`
🚀 Social Media API Server is running!
📍 Server: http://localhost:${PORT}
📖 API Version: ${API_VERSION}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Health Check: http://localhost:${PORT}/health
📚 API Base URL: http://localhost:${PORT}/${API_VERSION}
      `);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await sequelize.close();
  process.exit(0);
});

// Only start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = app;