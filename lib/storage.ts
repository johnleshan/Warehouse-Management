import { Product, Worker, Transaction, Task, TransactionType, TaskStatus, User, UserRole } from './types';

const STORAGE_KEYS = {
    PRODUCTS: 'wms_products',
    WORKERS: 'wms_workers',
    TRANSACTIONS: 'wms_transactions',
    TASKS: 'wms_tasks',
    USERS: 'wms_users',
    CURRENT_USER: 'wms_current_user',
};

const SYNC_CHANNEL = 'wms_sync';

// Seed Data
const INITIAL_PRODUCTS: Product[] = [
    { id: '1', name: 'Laptop Stand', sku: 'LPT-001', category: 'Accessories', price: 49.99, quantity: 120, minStock: 20, supplier: 'TechGear Inc.' },
    { id: '2', name: 'Wireless Mouse', sku: 'WMS-002', category: 'Electronics', price: 25.00, quantity: 45, minStock: 50, supplier: 'GadgetWorld' },
    { id: '3', name: 'Mechanical Keyboard', sku: 'KB-003', category: 'Electronics', price: 89.99, quantity: 15, minStock: 10, supplier: 'ClickyCo' },
    { id: '4', name: 'USB-C Cable', sku: 'CBL-004', category: 'Accessories', price: 9.99, quantity: 200, minStock: 30, supplier: 'CableKing' },
    { id: '5', name: 'Monitor 27"', sku: 'MON-005', category: 'Electronics', price: 299.99, quantity: 8, minStock: 5, supplier: 'ViewMax' },
];

const INITIAL_WORKERS: Worker[] = [
    { id: '1', name: 'Alice Johnson', role: 'Packer', joinedAt: new Date().toISOString() },
    { id: '2', name: 'Bob Smith', role: 'Picker', joinedAt: new Date().toISOString() },
    { id: '3', name: 'Charlie Davis', role: 'Manager', joinedAt: new Date().toISOString() },
];

const INITIAL_USERS: User[] = [
    { id: '1', username: 'admin', password: 'password123', name: 'System Admin', role: 'ADMIN', status: 'ACTIVE' },
    { id: '2', username: 'pos1', password: 'pospassword', name: 'Sales Agent One', role: 'POS_AGENT', status: 'ACTIVE' },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
    { id: '1', type: 'IN', productId: '1', quantity: 50, date: new Date(Date.now() - 86400000 * 5).toISOString(), notes: 'Initial Stock' },
    { id: '2', type: 'OUT', productId: '2', quantity: 5, date: new Date(Date.now() - 86400000 * 2).toISOString(), notes: 'Order #101' },
];

const INITIAL_TASKS: Task[] = [
    { id: '1', workerId: '1', description: 'Pack Order #101', status: 'COMPLETED', createdAt: new Date().toISOString(), completedAt: new Date().toISOString() },
    { id: '2', workerId: '2', description: 'Restock Aisle 4', status: 'PENDING', createdAt: new Date().toISOString() },
];

class StorageService {
    private channel: any;

    constructor() {
        if (typeof window !== 'undefined') {
            this.channel = new BroadcastChannel(SYNC_CHANNEL);
        }
    }

    private triggerSync() {
        if (typeof window !== 'undefined') {
            console.log('[StorageService] Triggering sync...');
            window.dispatchEvent(new Event('storage-update'));
            this.channel?.postMessage('update');
        }
    }

    // Initialize - Now seeds via API if needed
    async init() {
        try {
            // Trigger seeder in API
            await fetch('/api/users', { method: 'POST', body: JSON.stringify({}) });
            await fetch('/api/products', { method: 'POST', body: JSON.stringify({ sku: 'SEED', seed: true }) });
        } catch (e) {
            console.error('Init failed', e);
        }
    }

    // Auth (Still uses sessionStorage for the current session for performance)
    getCurrentUser(): User | null {
        if (typeof window === 'undefined') return null;
        const user = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return user ? JSON.parse(user) : null;
    }

    async login(username: string, password: string): Promise<User | null> {
        const users = await this.getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            const { password: _, ...userWithoutPassword } = user;
            sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
            return userWithoutPassword as User;
        }
        return null;
    }

    logout() {
        if (typeof window === 'undefined') return;
        sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }

    // Users
    async getUsers(): Promise<User[]> {
        const res = await fetch('/api/users');
        const data = await res.json();
        return data.map((u: any) => ({ ...u, id: u._id || u.id }));
    }

    async saveUser(user: User) {
        await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        this.triggerSync();
    }

    async deleteUser(id: string) {
        await fetch(`/api/users/${id}`, { method: 'DELETE' });
        this.triggerSync();
    }

    // Products
    async getProducts(): Promise<Product[]> {
        const res = await fetch('/api/products');
        const data = await res.json();
        // Map Mongo _id to id for frontend compatibility
        return data.map((p: any) => ({ ...p, id: p._id }));
    }

    async saveProduct(product: Product) {
        await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        this.triggerSync();
    }

    async deleteProduct(id: string) {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        this.triggerSync();
    }

    // Workers & Tasks (To be migrated as well)
    async getWorkers(): Promise<Worker[]> {
        const res = await fetch('/api/workers');
        const data = await res.json();
        return data.map((w: any) => ({ ...w, id: w._id || w.id }));
    }

    async addWorker(worker: Worker) {
        await fetch('/api/workers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(worker)
        });
        this.triggerSync();
    }

    async getTasks(): Promise<Task[]> {
        const res = await fetch('/api/tasks');
        const data = await res.json();
        return data.map((t: any) => ({ ...t, id: t._id || t.id }));
    }

    async addTask(task: Task) {
        await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
        this.triggerSync();
    }

    async updateTask(task: Task) {
        await fetch(`/api/tasks/${task.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
        this.triggerSync();
    }

    // Transactions
    async getTransactions(): Promise<Transaction[]> {
        const res = await fetch('/api/transactions');
        const data = await res.json();
        return data.map((t: any) => ({ ...t, id: t._id || t.id }));
    }

    async addTransaction(transaction: Transaction) {
        if (!transaction.performedBy) {
            const user = this.getCurrentUser();
            if (user) transaction.performedBy = user.id;
        }

        await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction)
        });

        this.triggerSync();
    }

    // Reset
    async resetStorage() {
        // In real app, we might call a special reset endpoint
        console.warn('Reset not fully implemented for Mongo yet');
    }
}


export const storage = new StorageService();
