"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const database_1 = require("../config/database");
const error_middleware_1 = require("../middleware/error.middleware");
const password_utils_1 = require("../utils/password.utils");
const jwt_utils_1 = require("../utils/jwt.utils");
class AuthService {
    async register(data) {
        const { email, password, first_name, last_name, currency = 'USD' } = data;
        // Check if user exists
        const existing = await (0, database_1.query)('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.rows.length > 0) {
            throw new error_middleware_1.AppError('Email already registered', 400);
        }
        const hashedPassword = await (0, password_utils_1.hashPassword)(password);
        // Insert user – id is auto-generated
        const result = await (0, database_1.query)(`INSERT INTO users (email, password_hash, first_name, last_name, currency, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`, [email, hashedPassword, first_name, last_name, currency]);
        const insertId = result.insertId;
        if (!insertId) {
            throw new error_middleware_1.AppError('User creation failed', 500);
        }
        const user = await this.findUserById(insertId);
        if (!user)
            throw new error_middleware_1.AppError('User creation failed', 500);
        const accessToken = (0, jwt_utils_1.generateAccessToken)({ userId: user.id, email: user.email });
        const refreshToken = (0, jwt_utils_1.generateRefreshToken)({ userId: user.id, email: user.email });
        return {
            user: this.formatUserResponse(user),
            accessToken,
            refreshToken,
        };
    }
    async login(data) {
        const { email, password } = data;
        const result = await (0, database_1.query)('SELECT * FROM users WHERE email = ?', [email]);
        if (result.rows.length === 0) {
            throw new error_middleware_1.AppError('Invalid email or password', 401);
        }
        const user = result.rows[0];
        const isValidPassword = await (0, password_utils_1.comparePassword)(password, user.password_hash);
        if (!isValidPassword) {
            throw new error_middleware_1.AppError('Invalid email or password', 401);
        }
        const accessToken = (0, jwt_utils_1.generateAccessToken)({ userId: user.id, email: user.email });
        const refreshToken = (0, jwt_utils_1.generateRefreshToken)({ userId: user.id, email: user.email });
        return {
            user: this.formatUserResponse(user),
            accessToken,
            refreshToken,
        };
    }
    async refreshToken(refreshToken) {
        try {
            const decoded = (0, jwt_utils_1.verifyRefreshToken)(refreshToken);
            const user = await this.findUserById(decoded.userId);
            if (!user)
                throw new error_middleware_1.AppError('User not found', 401);
            const newAccessToken = (0, jwt_utils_1.generateAccessToken)({ userId: user.id, email: user.email });
            const newRefreshToken = (0, jwt_utils_1.generateRefreshToken)({ userId: user.id, email: user.email });
            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            };
        }
        catch (error) {
            throw new error_middleware_1.AppError('Invalid refresh token', 401);
        }
    }
    async findUserById(id) {
        const result = await (0, database_1.query)('SELECT * FROM users WHERE id = ?', [id]);
        return result.rows[0] || null;
    }
    formatUserResponse(user) {
        return {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            currency: user.currency,
            created_at: user.created_at,
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map