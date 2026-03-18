/**
 * Logging Utility for Application Logging
 */

const fs = require('fs');
const path = require('path');
const winston = require('winston');

const logDir = process.env.LOG_DIR || './logs';

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
      let meta = '';
      if (Object.keys(metadata).length > 0) {
        meta = JSON.stringify(metadata);
      }
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${meta}`;
    })
  ),
  defaultMeta: { service: 'safety-manager-api' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...metadata }) => {
          let meta = '';
          if (Object.keys(metadata).length > 0) {
            meta = ` ${JSON.stringify(metadata)}`;
          }
          return `${timestamp} [${level}]: ${message}${meta}`;
        })
      )
    }),
    // Error log file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 14
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 14
    })
  ]
});

// Log unhandled exceptions
logger.exceptions.handle(
  new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') })
);

// Log unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

module.exports = logger;
