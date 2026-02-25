"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const index_1 = __importDefault(require("./config/index"));
const database_1 = __importStar(require("./config/database"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security middleware
app.use((0, helmet_1.default)());
// CORS configuration
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Request logging
app.use((req, res, next) => {
    index_1.default.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    next();
});
// Health check endpoint - Basic server health
app.get('/health', (req, res) => {
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
app.get('/health/db', async (req, res) => {
    try {
        const start = Date.now();
        // MySQL functions: NOW(), VERSION(), DATABASE()
        const result = await (0, database_1.query)('SELECT NOW() as current_time, VERSION() as db_version, DATABASE() as db_name');
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
    }
    catch (error) {
        index_1.default.error('Database health check failed:', error);
        res.status(503).json({
            success: false,
            message: 'Database connection failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
// Detailed system health check
app.get('/health/detailed', async (req, res) => {
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
            responseTime: null,
        },
    };
    try {
        const start = Date.now();
        await (0, database_1.query)('SELECT 1');
        const duration = Date.now() - start;
        healthcheck.database.status = 'up';
        healthcheck.database.connected = true;
        healthcheck.database.responseTime = `${duration}ms`;
    }
    catch (error) {
        healthcheck.success = false;
        healthcheck.database.status = 'down';
        healthcheck.database.connected = false;
        index_1.default.error('Database check failed in detailed health:', error);
    }
    const statusCode = healthcheck.database.connected ? 200 : 503;
    res.status(statusCode).json(healthcheck);
});
// API routes
app.use('/api/v1', routes_1.default);
// Handle 404
app.use(error_middleware_1.notFoundHandler);
// Global error handler
app.use(error_middleware_1.errorHandler);
// Test database connection on startup using pool events – cast to any to avoid overload errors
database_1.default.on('connection', () => {
    index_1.default.info('✅ MySQL pool connected');
});
database_1.default.on('error', (err) => {
    index_1.default.error('❌ MySQL pool error:', err);
});
// Immediate database test
index_1.default.info('🔍 Testing MySQL connection...');
// Query to test connection and get database info
(0, database_1.query)('SELECT NOW() as time, DATABASE() as db, VERSION() as version')
    .then((result) => {
    const row = result.rows[0];
    index_1.default.info('✅ MySQL connected successfully!');
    index_1.default.info(`   Database: ${row.db}`);
    index_1.default.info(`   Server Time: ${row.time}`);
    index_1.default.info(`   Version: ${row.version.substring(0, 50)}...`);
    index_1.default.info('');
    // Start server only after DB is confirmed
    startServer();
})
    .catch((error) => {
    index_1.default.error('❌ MySQL connection failed!');
    index_1.default.error(`   Error: ${error.message}`);
    index_1.default.error('');
    index_1.default.error('Please check:');
    index_1.default.error('   1. MySQL is running');
    index_1.default.error('   2. Database credentials in .env file');
    index_1.default.error('   3. Database "personal_finance_db" exists');
    index_1.default.error('');
    process.exit(1);
});
function startServer() {
    const server = app.listen(PORT, () => {
        index_1.default.info(`🚀 Server running on port ${PORT}`);
        index_1.default.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
        index_1.default.info('');
        index_1.default.info('📍 Available endpoints:');
        index_1.default.info(`   Health:        http://localhost:${PORT}/health`);
        index_1.default.info(`   Database:      http://localhost:${PORT}/health/db`);
        index_1.default.info(`   Detailed:      http://localhost:${PORT}/health/detailed`);
        index_1.default.info('');
        index_1.default.info('✨ Server is ready!');
    });
    // Handle server errors
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            index_1.default.error(`❌ Port ${PORT} is already in use!`);
            index_1.default.error(`   Please stop the other process or change PORT in .env`);
        }
        else {
            index_1.default.error('❌ Server error:', error);
        }
        process.exit(1);
    });
}
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    index_1.default.error('Unhandled Rejection:', err);
    process.exit(1);
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    index_1.default.error('Uncaught Exception:', err);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=index.js.map