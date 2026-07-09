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

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: "HH:mm:ss" }), printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`))
    })
  );
}

export default logger;
