"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginatedResponse = exports.errorResponse = exports.successResponse = void 0;
const successResponse = (res, data, message = 'Success', statusCode = 200, meta) => {
    const response = {
        success: true,
        message,
        data,
        meta,
    };
    return res.status(statusCode).json(response);
};
exports.successResponse = successResponse;
const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, errors) => {
    const response = {
        success: false,
        message,
        errors,
    };
    return res.status(statusCode).json(response);
};
exports.errorResponse = errorResponse;
const paginatedResponse = (res, data, total, page, limit, message = 'Success') => {
    const totalPages = Math.ceil(total / limit);
    return (0, exports.successResponse)(res, data, message, 200, {
        page,
        limit,
        total,
        totalPages,
    });
};
exports.paginatedResponse = paginatedResponse;
//# sourceMappingURL=apiResponse.utils.js.map