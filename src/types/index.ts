import { Request } from 'express';

// User Types
export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  currency: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreateInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  currency?: string;
}

export interface UserResponse {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  currency: string;
  created_at: Date;
}

// Auth Types
export interface AuthRequest extends Request {
  user?: User;  // Make it optional with ?
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

// Account Types
export interface Account {
  id: number;
  user_id: number;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'other';
  balance: number;
  currency: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AccountCreateInput {
  name: string;
  type: Account['type'];
  balance?: number;
  currency?: string;
  description?: string;
}

export interface AccountUpdateInput {
  name?: string;
  type?: Account['type'];
  balance?: number;
  description?: string;
  is_active?: boolean;
}

export type AccountInput = AccountCreateInput;

// Category Types
export interface Category {
  id: number;
  user_id: number | null;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  is_default: boolean;
  created_at: Date;
}

export interface CategoryCreateInput {
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
}

export type CategoryInput = CategoryCreateInput;

// Transaction Types
export interface Transaction {
  id: number;
  user_id: number;
  account_id: number;
  category_id: number | null;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  transaction_date: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  account_name?: string;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
}

export interface TransactionCreateInput {
  account_id: number;
  category_id?: number;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  transaction_date: string;
  notes?: string;
}

export interface TransactionUpdateInput {
  account_id?: number;
  category_id?: number | null;
  type?: 'income' | 'expense' | 'transfer';
  amount?: number;
  description?: string;
  transaction_date?: string;
  notes?: string;
}

export type TransactionInput = TransactionCreateInput;

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  accountId?: number;
  categoryId?: number;
  type?: 'income' | 'expense' | 'transfer';
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

// Budget Types
export interface Budget {
  id: number;
  user_id: number;
  category_id: number;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: Date;
  end_date: Date | null;
  alert_threshold: number;
  created_at: Date;
  updated_at: Date;
  category_name?: string;
  category_color?: string;
  spent?: number;
  remaining?: number;
  percentage_used?: number;
}

export interface BudgetCreateInput {
  category_id: number;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  alert_threshold?: number;
}

export type BudgetInput = BudgetCreateInput;

// Dashboard Types
export interface DashboardStats {
  total_balance: number;
  total_income: number;
  total_expense: number;
  net_savings: number;
  monthly_change: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export interface CategorySummary {
  category_id: number;
  category_name: string;
  category_color: string;
  total: number;
  percentage: number;
}

export interface RecentTransaction extends Transaction {
  account_name: string;
  category_name: string;
  category_color: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Database Types
export interface DatabaseClient {
  query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>;
}