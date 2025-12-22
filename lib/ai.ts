import { Product, Transaction, Worker, Task } from './types';

export const AI = {
    // 1. Burn Rate: (Start - Current) / Days. Simplified to Average Daily Sales.
    calculateBurnRate: (transactions: Transaction[], productId: string, days: number = 7): number => {
        const now = new Date();
        const pastDate = new Date();
        pastDate.setDate(now.getDate() - days);

        const sales = transactions.filter(t =>
            t.type === 'OUT' &&
            t.productId === productId &&
            new Date(t.date) >= pastDate
        );

        const totalSold = sales.reduce((sum, t) => sum + t.quantity, 0);
        return Number((totalSold / days).toFixed(2));
    },

    // 2. Reorder Point: Daily Sales * Lead Time (Assumed 3 days for prototype)
    calculateReorderPoint: (burnRate: number, leadTimeDays: number = 3): number => {
        return Math.ceil(burnRate * leadTimeDays);
    },

    // 3. Efficiency Score: Tasks / Hours (or Tasks / Day since join)
    calculateWorkerEfficiency: (worker: Worker, tasks: Task[]): number => {
        const completedTasks = tasks.filter(t => t.workerId === worker.id && t.status === 'COMPLETED').length;
        if (completedTasks === 0) return 0;

        // Simplified: Tasks per active day (since joined)
        const joined = new Date(worker.joinedAt);
        const now = new Date();
        const daysActive = Math.max(1, Math.floor((now.getTime() - joined.getTime()) / (1000 * 3600 * 24)));

        return Number((completedTasks / daysActive).toFixed(2));
    },

    // Predict stockout date
    predictStockout: (product: Product, burnRate: number): string | null => {
        if (burnRate <= 0) return null; // No sales
        const daysLeft = product.quantity / burnRate;
        if (daysLeft > 365) return '> 1 Year';

        const date = new Date();
        date.setDate(date.getDate() + Math.ceil(daysLeft));
        return date.toLocaleDateString();
    }
};
