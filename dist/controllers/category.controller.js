"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategorySchema = exports.categorySchema = exports.categoryController = exports.CategoryController = void 0;
const zod_1 = require("zod");
const category_service_1 = require("../services/category.service");
const apiResponse_utils_1 = require("../utils/apiResponse.utils");
const error_middleware_1 = require("../middleware/error.middleware");
const error_middleware_2 = require("../middleware/error.middleware");
const config_1 = __importDefault(require("../config"));
const categorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Category name is required'),
        type: zod_1.z.enum(['income', 'expense']),
        color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        icon: zod_1.z.string().optional(),
    }),
});
exports.categorySchema = categorySchema;
const updateCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        type: zod_1.z.enum(['income', 'expense']).optional(),
        color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        icon: zod_1.z.string().optional(),
    }),
});
exports.updateCategorySchema = updateCategorySchema;
class CategoryController {
    getAll = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        if (!req.user)
            throw new error_middleware_2.AppError('Unauthorized', 401);
        const { type } = req.query;
        const categories = await category_service_1.categoryService.getAllCategories(req.user.id, type);
        (0, apiResponse_utils_1.successResponse)(res, categories, 'Categories retrieved successfully');
    });
    getById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        if (!req.user)
            throw new error_middleware_2.AppError('Unauthorized', 401);
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0)
            throw new error_middleware_2.AppError('Invalid category ID', 400);
        const category = await category_service_1.categoryService.getCategoryById(req.user.id, id);
        (0, apiResponse_utils_1.successResponse)(res, category, 'Category retrieved successfully');
    });
    create = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        if (!req.user)
            throw new error_middleware_2.AppError('Unauthorized', 401);
        const data = req.body;
        const category = await category_service_1.categoryService.createCategory(req.user.id, data);
        (0, apiResponse_utils_1.successResponse)(res, category, 'Category created successfully', 201);
    });
    update = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        config_1.default.debug('Update category request received');
        // CRITICAL: Check if req.user exists (same pattern as transaction)
        if (!req.user) {
            config_1.default.error('update: req.user is undefined');
            throw new error_middleware_2.AppError('Unauthorized', 401);
        }
        const userId = req.user.id; // This is line that was failing - req.user was undefined
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0)
            throw new error_middleware_2.AppError('Invalid category ID', 400);
        const data = req.body;
        config_1.default.debug('Updating category:', { userId, categoryId: id, data });
        const category = await category_service_1.categoryService.updateCategory(userId, id, data);
        (0, apiResponse_utils_1.successResponse)(res, category, 'Category updated successfully');
    });
    delete = (0, error_middleware_1.asyncHandler)(async (req, res) => {
        if (!req.user)
            throw new error_middleware_2.AppError('Unauthorized', 401);
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0)
            throw new error_middleware_2.AppError('Invalid category ID', 400);
        await category_service_1.categoryService.deleteCategory(req.user.id, id);
        (0, apiResponse_utils_1.successResponse)(res, null, 'Category deleted successfully');
    });
}
exports.CategoryController = CategoryController;
exports.categoryController = new CategoryController();
//# sourceMappingURL=category.controller.js.map