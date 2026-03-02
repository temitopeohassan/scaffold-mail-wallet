import winston from 'winston';

const logLevel = process.env['LOG_LEVEL'] || 'info';
const isVercel = process.env['VERCEL'] === '1';

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

// File transports only when not on Vercel (serverless has read-only filesystem)
if (!isVercel) {
  transports.push(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  );
}

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ethereum-wallet-backend' },
  transports,
});