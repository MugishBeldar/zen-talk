import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './user.js';
import chatRoutes from './chatRoutes.js';
import { createSuccessResponse } from '../utils/errors.js';
import { checkDatabaseHealth } from '../config/database.js';

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: dbHealth.status,
        memory: 'OK'
      }
    };

    // Check memory usage
    const memUsage = process.memoryUsage();
    if (memUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
      health.checks.memory = 'WARNING';
    }

    const statusCode = health.checks.database === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * API info endpoint
 */
router.get('/', (req, res) => {
  const response = createSuccessResponse({
    name: 'ZenTalk API',
    version: '1.0.0',
    description: 'Authentication and User Management API',
    endpoints: {
      auth: '/api/auth',
      user: '/api/user',
      chats: '/api/chats',
      health: '/api/health'
    },
    documentation: '/api/docs'
  }, 'ZenTalk API is running');
  
  res.json(response);
});

/**
 * Mount route modules
 */
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/chats', chatRoutes);

export default router;
