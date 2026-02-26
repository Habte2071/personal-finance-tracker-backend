import { Budget, BudgetCreateInput } from '../types';
export declare class BudgetService {
    getAllBudgets(userId: number): Promise<Budget[]>;
    getBudgetById(userId: number, budgetId: number): Promise<Budget>;
    createBudget(userId: number, data: BudgetCreateInput): Promise<Budget>;
    updateBudget(userId: number, budgetId: number, data: Partial<BudgetCreateInput>): Promise<Budget>;
    deleteBudget(userId: number, budgetId: number): Promise<void>;
    getBudgetAlerts(userId: number): Promise<Budget[]>;
}
export declare const budgetService: BudgetService;
//# sourceMappingURL=budget.service.d.ts.map