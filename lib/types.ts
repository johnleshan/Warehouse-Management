export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  quantity: number;
  minStock: number;
  supplier: string;
}

export type TransactionType = 'IN' | 'OUT';

export interface Transaction {
  id: string;
  type: TransactionType;
  productId: string;
  quantity: number;
  date: string;
  notes?: string;
  performedBy?: string; // User ID
}

export type TaskStatus = 'PENDING' | 'COMPLETED';

export interface Task {
  id: string;
  userId: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
}

export type UserRole = string; // Allow custom roles

export interface User {
  id: string;
  username: string;
  password?: string; // In a real app, this would be hashed
  name: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin?: string;
}
