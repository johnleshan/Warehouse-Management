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

export interface Worker {
  id: string;
  name: string;
  role: string;
  joinedAt: string;
}

export type TransactionType = 'IN' | 'OUT';

export interface Transaction {
  id: string;
  type: TransactionType;
  productId: string;
  quantity: number;
  date: string;
  notes?: string;
}

export type TaskStatus = 'PENDING' | 'COMPLETED';

export interface Task {
  id: string;
  workerId: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
}
