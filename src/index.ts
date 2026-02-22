import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import logger from './config';
import { query } from './config/database';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS – allow frontend with credentials
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());
app.use(helmet());

// API Routes
app.use('/api/v1', routes);

// Health checks
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/health/db', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ database: 'connected', timestamp: new Date().toISOString() });
  } catch (error: any) {
    res.status(500).json({ database: 'disconnected', error: error.message });
  }
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Database connection and server start
(async () => {
  try {
    const dbResult = await query('SELECT NOW() as time, current_database() as db');
    const row = dbResult.rows[0] as { time: string; db: string };
    logger.info('✅ PostgreSQL connected', { database: row.db, time: row.time });

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📍 API Base: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    logger.error('❌ Database connection failed', error);
    process.exit(1);
  }
})();