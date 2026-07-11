import winston from "winston";
import fs from "fs";

const LOG_DIR = "logs";
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR);

const { combine, timestamp, printf, colorize, errors } = winston.format;

const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack }) => `${timestamp} [${level.toUpperCase()}] ${stack || message}`)
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: fileFormat,
  transports: [
    new winston.transports.File({ filename: `${LOG_DIR}/error.log`, level: "error" }),
    new winston.transports.File({ filename: `${LOG_DIR}/combined.log` })
  ],
  exceptionHandlers: [new winston.transports.File({ filename: `${LOG_DIR}/exceptions.log` })],
  rejectionHandlers: [new winston.transports.File({ filename: `${LOG_DIR}/rejections.log` })]
});

// Render (and most PaaS hosts) capture stdout/stderr for the Logs tab — they
// do NOT read from local files, and local disk is wiped on every redeploy
// anyway. Console output must always be enabled, in every environment,
// or production logs become invisible (which is what was happening here).
logger.add(
  new winston.transports.Console({
    format: combine(timestamp({ format: "HH:mm:ss" }), printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`))
  })
);

export default logger;