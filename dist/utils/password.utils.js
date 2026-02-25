"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = 10;
const hashPassword = async (password) => {
    return bcrypt_1.default.hash(password, SALT_ROUNDS);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
    try {
        // Normalize hash format if needed (handle $2b$ vs $2a$)
        const normalizedHash = hash.startsWith('$2y$')
            ? '$2a$' + hash.slice(4)
            : hash;
        return await bcrypt_1.default.compare(password, normalizedHash);
    }
    catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};
exports.comparePassword = comparePassword;
//# sourceMappingURL=password.utils.js.map