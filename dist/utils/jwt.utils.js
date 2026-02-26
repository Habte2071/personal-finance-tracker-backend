"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
const generateAccessToken = (payload) => {
    // Ensure userId is stored as number in token
    return jsonwebtoken_1.default.sign({ userId: payload.userId, email: payload.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign({ userId: payload.userId, email: payload.email }, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    // Ensure userId is returned as number
    return {
        userId: typeof decoded.userId === 'string' ? parseInt(decoded.userId, 10) : decoded.userId,
        email: decoded.email
    };
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
    return {
        userId: typeof decoded.userId === 'string' ? parseInt(decoded.userId, 10) : decoded.userId,
        email: decoded.email
    };
};
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=jwt.utils.js.map