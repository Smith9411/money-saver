export type TransactionType = 'expense' | 'income';

export type TransactionCategory =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'housing'
  | 'leisure'
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'other';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string; // ISO format or YYYY-MM-DD
  merchant?: string;
  note?: string;
  items?: ReceiptItem[]; // Détail des articles du ticket de caisse
  isRecurring?: boolean; // Paiement récurrent mensuel
  recurringDay?: number; // Jour du mois (1-31)
}

export interface UpcomingPayment {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  dayOfMonth: number;
  daysRemaining: number;
  category: TransactionCategory;
}

export type TimePeriod = 'week' | 'month' | 'year';

export interface PeriodStats {
  totalExpense: number;
  totalIncome: number;
  savingsRate: number;
  netBalance: number;
  transactionsCount: number;
}

export interface ChartDataPoint {
  label: string;
  expense: number;
  income: number;
  fullDate?: string;
}

export interface CategoryBudget {
  category: TransactionCategory;
  name: string;
  spent: number;
  budget: number;
  percentage: number;
  iconName: string;
  color: string;
}

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  selected: boolean;
  category: TransactionCategory;
}

export interface ParsedReceipt {
  merchant: string;
  date: string;
  items: ReceiptItem[];
  imageUri?: string;
}
