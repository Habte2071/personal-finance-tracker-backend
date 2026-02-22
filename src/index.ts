import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import logger from './config/index';
import pool, { query } from './config/database';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check endpoint - Basic server health
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT,
    uptime: process.uptime(),
  });
});

// Database health check endpoint
app.get('/health/db', async (req: Request, res: Response) => {
  try {
    const start = Date.now();
    // MySQL functions: NOW(), VERSION(), DATABASE()
    const result = await query('SELECT NOW() as current_time, VERSION() as db_version, DATABASE() as db_name');
    const duration = Date.now() - start;

    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      data: {
        connected: true,
        responseTime: `${duration}ms`,
        currentTime: result.rows[0].current_time,
        version: result.rows[0].db_version,
        database: result.rows[0].db_name,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Database health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Detailed system health check
app.get('/health/detailed', async (req: Request, res: Response) => {
  const healthcheck = {
    success: true,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    server: {
      status: 'up',
      port: PORT,
      uptime: `${Math.floor(process.uptime())} seconds`,
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
    },
    database: {
      status: 'checking...',
      connected: false,
      responseTime: null as string | null,
    },
  };

  try {
    const start = Date.now();
    await query('SELECT 1');
    const duration = Date.now() - start;
    
    healthcheck.database.status = 'up';
    healthcheck.database.connected = true;
    healthcheck.database.responseTime = `${duration}ms`;
  } catch (error) {
    healthcheck.success = false;
    healthcheck.database.status = 'down';
    healthcheck.database.connected = false;
    logger.error('Database check failed in detailed health:', error);
  }

  const statusCode = healthcheck.database.connected ? 200 : 503;
  res.status(statusCode).json(healthcheck);
});

// API routes
app.use('/api/v1', routes);

// Handle 404
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Test database connection on startup using pool events – cast to any to avoid overload errors
(pool as any).on('connection', () => {
  logger.info('✅ MySQL pool connected');
});

(pool as any).on('error', (err: Error) => {
  logger.error('❌ MySQL pool error:', err);
});

// Immediate database test
logger.info('🔍 Testing MySQL connection...');

// Query to test connection and get database info
query('SELECT NOW() as time, DATABASE() as db, VERSION() as version')
  .then((result) => {
    const row = result.rows[0] as { time: string; db: string; version: string };
    logger.info('✅ MySQL connected successfully!');
    logger.info(`   Database: ${row.db}`);
    logger.info(`   Server Time: ${row.time}`);
    logger.info(`   Version: ${row.version.substring(0, 50)}...`);
    logger.info('');
    
    // Start server only after DB is confirmed
    startServer();
  })
  .catch((error) => {
    logger.error('❌ MySQL connection failed!');
    logger.error(`   Error: ${error.message}`);
    logger.error('');
    logger.error('Please check:');
    logger.error('   1. MySQL is running');
    logger.error('   2. Database credentials in .env file');
    logger.error('   3. Database "personal_finance_db" exists');
    logger.error('');
    process.exit(1);
  });

function startServer() {
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info('');
    logger.info('📍 Available endpoints:');
    logger.info(`   Health:        http://localhost:${PORT}/health`);
    logger.info(`   Database:      http://localhost:${PORT}/health/db`);
    logger.info(`   Detailed:      http://localhost:${PORT}/health/detailed`);
    logger.info('');
    logger.info('✨ Server is ready!');
  });

  // Handle server errors
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`❌ Port ${PORT} is already in use!`);
      logger.error(`   Please stop the other process or change PORT in .env`);
    } else {
      logger.error('❌ Server error:', error);
    }
    process.exit(1);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

export default app;