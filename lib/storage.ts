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

    private get<T>(key: string): T[] {
        if (typeof window === 'undefined') return [];
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : [];
    }

    private set<T>(key: string, data: T[]): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(key, JSON.stringify(data));
    }

    // Initialize with seed data if empty
    init() {
        if (typeof window === 'undefined') return;
        if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) this.set(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        if (!localStorage.getItem(STORAGE_KEYS.WORKERS)) this.set(STORAGE_KEYS.WORKERS, INITIAL_WORKERS);
        if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) this.set(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
        if (!localStorage.getItem(STORAGE_KEYS.TASKS)) this.set(STORAGE_KEYS.TASKS, INITIAL_TASKS);
        if (!localStorage.getItem(STORAGE_KEYS.USERS)) this.set(STORAGE_KEYS.USERS, INITIAL_USERS);
    }

    resetStorage() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
        localStorage.removeItem(STORAGE_KEYS.WORKERS);
        localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
        localStorage.removeItem(STORAGE_KEYS.TASKS);
        localStorage.removeItem(STORAGE_KEYS.USERS);
        this.init();
        this.triggerSync();
    }

    // Auth
    getCurrentUser(): User | null {
        if (typeof window === 'undefined') return null;
        const user = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return user ? JSON.parse(user) : null;
    }

    login(username: string, password: string): User | null {
        const users = this.getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
            return userWithoutPassword as User;
        }
        return null;
    }

    logout() {
        if (typeof window === 'undefined') return;
        sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }

    // Users (Admin Only)
    getUsers(): User[] { return this.get(STORAGE_KEYS.USERS); }
    saveUser(user: User) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === user.id);
        if (index >= 0) users[index] = user;
        else users.push(user);
        this.set(STORAGE_KEYS.USERS, users);
        this.triggerSync();
    }
    deleteUser(id: string) {
        const users = this.getUsers().filter(u => u.id !== id);
        this.set(STORAGE_KEYS.USERS, users);
        this.triggerSync();
    }

    // Products
    getProducts(): Product[] { return this.get(STORAGE_KEYS.PRODUCTS); }
    saveProduct(product: Product) {
        const products = this.getProducts();
        const index = products.findIndex(p => p.id === product.id);
        if (index >= 0) products[index] = product;
        else products.push(product);
        this.set(STORAGE_KEYS.PRODUCTS, products);
        this.triggerSync();
    }
    deleteProduct(id: string) {
        const products = this.getProducts().filter(p => p.id !== id);
        this.set(STORAGE_KEYS.PRODUCTS, products);
        this.triggerSync();
    }

    // Workers
    getWorkers(): Worker[] { return this.get(STORAGE_KEYS.WORKERS); }
    addWorker(worker: Worker) {
        const workers = this.getWorkers();
        workers.push(worker);
        this.set(STORAGE_KEYS.WORKERS, workers);
        this.triggerSync();
    }

    // Transactions
    getTransactions(): Transaction[] { return this.get(STORAGE_KEYS.TRANSACTIONS); }
    addTransaction(transaction: Transaction) {
        const transactions = this.getTransactions();

        // Auto-assign performedBy if not set
        if (!transaction.performedBy) {
            const user = this.getCurrentUser();
            if (user) transaction.performedBy = user.id;
        }

        transactions.push(transaction);
        this.set(STORAGE_KEYS.TRANSACTIONS, transactions);

        // Update Product Quantity
        const products = this.getProducts();
        const productIndex = products.findIndex(p => p.id === transaction.productId);
        if (productIndex >= 0) {
            if (transaction.type === 'IN') products[productIndex].quantity += transaction.quantity;
            else products[productIndex].quantity -= transaction.quantity;
            this.set(STORAGE_KEYS.PRODUCTS, products);
        }

        this.triggerSync();
    }

    // Tasks
    getTasks(): Task[] { return this.get(STORAGE_KEYS.TASKS); }
    addTask(task: Task) {
        const tasks = this.getTasks();
        tasks.push(task);
        this.set(STORAGE_KEYS.TASKS, tasks);
        this.triggerSync();
    }
    updateTask(task: Task) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === task.id);
        if (index >= 0) tasks[index] = task;
        this.set(STORAGE_KEYS.TASKS, tasks);
        this.triggerSync();
    }
}

export const storage = new StorageService();
