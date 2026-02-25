"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const index_1 = __importDefault(require("../config/index"));
const validate = (schema) => {
    return (req, res, next) => {
        try {
            // CRITICAL: Store user before validation
            const user = req.user;
            const result = schema.safeParse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            if (!result.success) {
                const errors = result.error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors,
                });
                return;
            }
            // Assign validated data
            req.body = result.data.body;
            req.query = result.data.query;
            req.params = result.data.params;
            // CRITICAL: Restore user if it was lost during validation
            if (user && !req.user) {
                req.user = user;
            }
            next();
        }
        catch (error) {
            index_1.default.error('Unexpected validation error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during validation',
            });
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validation.middleware.js.map