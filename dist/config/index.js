"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Simple logger – no dependencies
const logger = {
    info: (message, meta) => console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date().toISOString(), service: 'personal-finance-api' })),
    error: (message, meta) => console.error(JSON.stringify({ level: 'error', message, ...meta, timestamp: new Date().toISOString(), service: 'personal-finance-api' })),
    warn: (message, meta) => console.warn(JSON.stringify({ level: 'warn', message, ...meta, timestamp: new Date().toISOString(), service: 'personal-finance-api' })),
    debug: (message, meta) => console.debug(JSON.stringify({ level: 'debug', message, ...meta, timestamp: new Date().toISOString(), service: 'personal-finance-api' })),
};
exports.default = logger;
//# sourceMappingURL=index.js.map