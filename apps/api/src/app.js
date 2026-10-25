import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { requestLogger } from './middleware/requestLogger.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

import tasksRouter from './routes/tasks.js';
import submissionsRouter from './routes/submissions.js';
import evaluationsRouter from './routes/evaluations.js';
import receiptsRouter from './routes/receipts.js';
import configRouter from './routes/config.js';

export function createApp() {
  const app = express();

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: false, // allow frontend interactions during dev
    crossOriginEmbedderPolicy: false
  }));

  // CORS
  const allowedOrigins = [
    config.frontendUrl,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('CORS origin blocked by security policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
  }));

  // Body parser
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));

  // Request ID and structured request logger
  app.use(requestLogger);

  // Rate limiter
  app.use('/api/', apiRateLimiter);

  // Health check endpoint
  app.get('/api/v1/health', (req, res) => {
    res.json({
      success: true,
      service: 'AgentReceipt API',
      version: '1.0.0',
      status: 'healthy',
      mode: config.appMode,
      timestamp: new Date().toISOString()
    });
  });

  // Versioned API routes
  app.use('/api/v1/tasks', tasksRouter);
  app.use('/api/v1/submissions', submissionsRouter);
  app.use('/api/v1/evaluations', evaluationsRouter);
  app.use('/api/v1/receipts', receiptsRouter);
  app.use('/api/v1/config', configRouter);

  // 404 handler
  app.use(notFoundHandler);

  // Centralized error handler
  app.use(errorHandler);

  return app;
}
