export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: "credit" | "debit";
  subcategory: string;
  date: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subcategory {
  id: string;
  userId: string;
  name: string;
  type: "credit" | "debit";
  isDefault: boolean;
}

export interface Budget {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  limit: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export const DEFAULT_CREDIT_SUBCATEGORIES = [
  "Salary", "Bonus", "Gift", "Refund", "Investment Return", "Other"
];

export const DEFAULT_DEBIT_SUBCATEGORIES = [
  "Food", "Travel", "Shopping", "Bills", "Health", "Entertainment", "Education", "Other"
];
