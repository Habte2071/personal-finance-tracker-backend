"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_utils_1 = require("../utils/jwt.utils");
const database_1 = require("../config/database");
const config_1 = __importDefault(require("../config"));
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            config_1.default.warn('Authentication failed: No Bearer token');
            res.status(401).json({ success: false, message: 'Access token is required' });
            return;
        }
        const token = authHeader.substring(7);
        let decoded;
        try {
            decoded = (0, jwt_utils_1.verifyAccessToken)(token);
            config_1.default.debug('Token decoded successfully:', { userId: decoded.userId, email: decoded.email });
        }
        catch (err) {
            if (err instanceof Error) {
                if (err.name === 'TokenExpiredError') {
                    config_1.default.warn('Authentication failed: Token expired');
                    res.status(401).json({ success: false, message: 'Token expired' });
                    return;
                }
                if (err.name === 'JsonWebTokenError') {
                    config_1.default.warn('Authentication failed: Invalid token');
                    res.status(401).json({ success: false, message: 'Invalid token' });
                    return;
                }
            }
            config_1.default.warn('Authentication failed: Token verification error', err);
            res.status(401).json({ success: false, message: 'Invalid token' });
            return;
        }
        // Fetch user from database
        const result = await (0, database_1.query)(`SELECT 
         id,
         email, 
         password_hash, 
         first_name, 
         last_name, 
         currency, 
         created_at, 
         updated_at 
       FROM users 
       WHERE id = ?`, [decoded.userId]);
        if (result.rows.length === 0) {
            config_1.default.warn(`Authentication failed: User not found for id ${decoded.userId}`);
            res.status(401).json({ success: false, message: 'User not found' });
            return;
        }
        const userRow = result.rows[0];
        // Ensure all required fields are present and properly typed
        req.user = {
            id: Number(userRow.id),
            email: String(userRow.email),
            password_hash: String(userRow.password_hash),
            first_name: userRow.first_name ? String(userRow.first_name) : '',
            last_name: userRow.last_name ? String(userRow.last_name) : '',
            currency: userRow.currency ? String(userRow.currency) : 'USD',
            created_at: userRow.created_at ? new Date(userRow.created_at) : new Date(),
            updated_at: userRow.updated_at ? new Date(userRow.updated_at) : new Date(),
        };
        config_1.default.debug('✅ Authentication successful, user attached:', {
            id: req.user.id,
            email: req.user.email,
            type: typeof req.user.id
        });
        next();
    }
    catch (error) {
        config_1.default.error('❌ Unexpected authentication error:', error);
        next(error);
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.middleware.js.map