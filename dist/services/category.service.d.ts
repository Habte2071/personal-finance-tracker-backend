import { Category, CategoryCreateInput } from '../types';
export declare class CategoryService {
    getAllCategories(userId: number, type?: 'income' | 'expense'): Promise<Category[]>;
    getCategoryById(userId: number, categoryId: number): Promise<Category>;
    createCategory(userId: number, data: CategoryCreateInput): Promise<Category>;
    updateCategory(userId: number, categoryId: number, data: Partial<CategoryCreateInput>): Promise<Category>;
    deleteCategory(userId: number, categoryId: number): Promise<void>;
}
export declare const categoryService: CategoryService;
//# sourceMappingURL=category.service.d.ts.map