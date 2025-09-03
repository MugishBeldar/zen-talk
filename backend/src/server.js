import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { connectDatabase, createIndexes } from './config/database.js';
import { config } from './config/index.js';
import routes from './routes/index.js';
import socketService from './services/socketService.js';
import redisService from './services/redisService.js';
import {
  requestId,
  errorHandler,
  notFound,
  unhandledRejectionHandler,
  uncaughtExceptionHandler,
  gracefulShutdownHandler
} from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Handle unhandled promise rejections and uncaught exceptions
unhandledRejectionHandler();
uncaughtExceptionHandler();

// Create Express app and HTTP server
const app = express();
const server = createServer(app);

// Trust proxy if configured
if (config.development.trustProxy) {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet(config.security.helmet));

// CORS middleware
app.use(cors(config.cors));

// Request logging
if (config.logging.enableMorganLogging) {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Request ID middleware
app.use(requestId);

// Rate limiting
if (process.env.ENABLE_RATE_LIMITING !== 'false') {
  app.use('/api', apiLimiter);
}

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Create database indexes
    await createIndexes();

    // Connect to Redis
    await redisService.connect();

    // Initialize Socket.IO
    socketService.initialize(server);

    // Start HTTP server
    server.listen(config.env.PORT, () => {
      console.log(`
🚀 ZenTalk Backend Server Started!
📍 Environment: ${config.env.NODE_ENV}
🌐 Port: ${config.env.PORT}
📊 Database: Connected to MongoDB
🔒 Security: Enabled
⚡ Rate Limiting: ${process.env.ENABLE_RATE_LIMITING !== 'false' ? 'Enabled' : 'Disabled'}
📝 Logging: ${config.logging.enableMorganLogging ? 'Enabled' : 'Disabled'}

API Endpoints:
🔐 Authentication: http://localhost:${config.env.PORT}/api/auth
👤 User Management: http://localhost:${config.env.PORT}/api/user
💬 Chat & Messaging: http://localhost:${config.env.PORT}/api/chats
🔌 Socket.IO: ws://localhost:${config.env.PORT}
❤️ Health Check: http://localhost:${config.env.PORT}/api/health
      `);
    });

    // Setup graceful shutdown
    gracefulShutdownHandler(server);

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;