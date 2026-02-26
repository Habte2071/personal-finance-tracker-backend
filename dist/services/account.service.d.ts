import { Account, AccountCreateInput, AccountUpdateInput } from '../types';
export declare class AccountService {
    getAllAccounts(userId: number): Promise<Account[]>;
    getAccountById(userId: number, accountId: number): Promise<Account>;
    createAccount(userId: number, data: AccountCreateInput): Promise<Account>;
    updateAccount(userId: number, accountId: number, data: AccountUpdateInput): Promise<Account>;
    deleteAccount(userId: number, accountId: number): Promise<void>;
    updateBalance(userId: number, accountId: number, amount: number, type: 'income' | 'expense'): Promise<void>;
}
export declare const accountService: AccountService;
//# sourceMappingURL=account.service.d.ts.map