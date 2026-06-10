/**
 * Winston Logger Configuration
 * Structured logging for all backend operations
 */

import winston from 'winston';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';
import { getLogContext } from './logContext.js';

// Create logs directory if it doesn't exist
// Create logs directory if it doesn't exist (with permission handling)
import fs from 'fs';
const logsDir = path.join(process.cwd(), 'logs');

function ensureLogsDirectory() {
  try {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    return true;
  } catch (error) {
    const fallbackCodes = ['EACCES', 'EROFS', 'EPERM'];
    if (fallbackCodes.includes(error.code)) {
      console.warn(
        `[Logger Warning]: Storage is read-only or restricted (${error.code}). ` +
          `Falling back gracefully to console logging.`
      );
    } else {
      console.error(`[Logger Error]: Unexpected filesystem failure: ${error.message}`);
    }
    return false;
  }
}

const isStorageWritable = ensureLogsDirectory();

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for console output
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const LOG_FORMAT = (process.env.LOG_FORMAT || 'text').toLowerCase();

const correlationFormat = winston.format((info) => {
  const ctx = getLogContext();
  Object.assign(info, ctx);
  return info;
});

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  correlationFormat(),
  winston.format.json()
);

const textFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...args } = info;
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
    }`;
  })
);

const baseFileFormat = LOG_FORMAT === 'json' ? jsonFormat : textFormat;

// Determine runtime levels: Console is dynamic, historical files maintain info baseline
const consoleLevel = process.env.LOG_LEVEL || 'info';
const fileBaselineLevel = 'info';

// Ensure the root gatekeeper allows debug logs through if requested, otherwise defaults to info
const globalGatekeeperLevel = consoleLevel === 'debug' ? 'debug' : fileBaselineLevel;

// Define transports
const activeTransports = [
  // Console transport
  new winston.transports.Console({
    level: consoleLevel,
    format:
      LOG_FORMAT === 'json'
        ? baseFileFormat
        : winston.format.combine(winston.format.colorize({ all: true }), baseFileFormat),
  }),

  // Error logs
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: winston.format.uncolorize(),
  }),

  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    level: fileBaselineLevel, // <-- Add this line
    format: winston.format.uncolorize(),
  }),

  // Daily rotate logs (requires winston-daily-rotate-file)
  new DailyRotateFile({
    filename: path.join(logsDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: fileBaselineLevel, // <-- Add this line
    maxSize: '20m',
    maxFiles: '30d',
    format: winston.format.uncolorize(),
    utc: true,
  }),
];

// Create logger instance
const logger = winston.createLogger({
  level: globalGatekeeperLevel, // <-- Change this line
  levels,
  format: baseFileFormat,
  transports: activeTransports,
  exceptionHandlers: isStorageWritable
    ? [
        new DailyRotateFile({
          filename: path.join(logsDir, 'exceptions-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          format: baseFileFormat, //  FIX: Ensures clean exception dumps
          utc: true,
        }),
      ]
    : undefined,
  rejectionHandlers: isStorageWritable
    ? [
        new DailyRotateFile({
          filename: path.join(logsDir, 'rejections-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          format: baseFileFormat, //  FIX: Ensures clean rejection dumps
          utc: true,
        }),
      ]
    : undefined,
});

export default logger;
