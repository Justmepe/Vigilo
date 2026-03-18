/**
 * Express Application Configuration
 * Includes security, logging, compression, and middleware setup
 */

console.log('[APP] Starting app initialization...');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

console.log('[APP] Dependencies loaded');

const routes = require('./routes');
console.log('[APP] Routes loaded');

const { errorHandler, asyncHandler } = require('./middleware/error.middleware');
console.log('[APP] Error middleware loaded');

const logger = require('./utils/logger');
console.log('[APP] Logger loaded');

const { NotFoundError } = require('./utils/errors');
console.log('[APP] Error utils loaded');

const app = express();
console.log('[APP] Express app created');

// Trust proxy (behind Nginx)
app.set('trust proxy', 1);

// Add request ID for tracking
app.use((req, res, next) => {
  req.id = uuidv4();
  next();
});

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: process.env.HELMET_CSP_ENABLED !== 'false',
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// CORS Configuration
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(origin => origin.trim());
const corsOptions = {
  origin: function(origin, callback) {
    // In development, allow all origins (including proxy requests)
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Body Parser Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Compression Middleware
app.use(compression());

// Request Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Custom morgan format for production
  morgan.token('user-id', (req) => req.user?.id || 'anonymous');
  app.use(morgan(':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms'));
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Static Files
app.use('/uploads', express.static('uploads'));
app.use('/pdfs', express.static('pdfs'));

// Request logging
app.use((req, res, next) => {
  logger.debug(`Incoming ${req.method} request`, {
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    requestId: req.id
  });
  next();
});

// API Routes
app.use('/api', routes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.API_VERSION || 'v1',
    requestId: req.id
  });
});

// 404 Handler
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.path}`));
});

// Global Error Handler (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
