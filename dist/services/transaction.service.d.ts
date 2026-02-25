import { Transaction, TransactionCreateInput, TransactionUpdateInput, TransactionFilters } from '../types';
export declare class TransactionService {
    getTransactions(userId: number, filters: TransactionFilters): Promise<{
        transactions: Transaction[];
        total: number;
    }>;
    getTransactionById(userId: number, transactionId: number): Promise<Transaction>;
    createTransaction(userId: number, data: TransactionCreateInput): Promise<Transaction>;
    updateTransaction(userId: number, transactionId: number, data: TransactionUpdateInput): Promise<Transaction>;
    deleteTransaction(userId: number, transactionId: number): Promise<void>;
    getTransactionSummary(userId: number, startDate: string, endDate: string): Promise<{
        total_income: number;
        total_expense: number;
        transaction_count: number;
        net_savings: number;
    }>;
}
export declare const transactionService: TransactionService;
//# sourceMappingURL=transaction.service.d.ts.map