// Simple logger – no dependencies
const logger = {
  info: (message: string, meta?: any) => console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date().toISOString(), service: 'personal-finance-api' })),
  error: (message: string, meta?: any) => console.error(JSON.stringify({ level: 'error', message, ...meta, timestamp: new Date().toISOString(), service: 'personal-finance-api' })),
  warn: (message: string, meta?: any) => console.warn(JSON.stringify({ level: 'warn', message, ...meta, timestamp: new Date().toISOString(), service: 'personal-finance-api' })),
  debug: (message: string, meta?: any) => console.debug(JSON.stringify({ level: 'debug', message, ...meta, timestamp: new Date().toISOString(), service: 'personal-finance-api' })),
};

export default logger;