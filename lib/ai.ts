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
    },

    // 4. ABC Analysis
    // A: Top 20% value, B: Next 30%, C: Bottom 50%
    classifyABC: (products: Product[]): { a: Product[], b: Product[], c: Product[] } => {
        const sorted = [...products].sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity));
        const totalValue = sorted.reduce((sum, p) => sum + (p.price * p.quantity), 0);

        const a: Product[] = [];
        const b: Product[] = [];
        const c: Product[] = [];

        let currentSum = 0;
        for (const p of sorted) {
            currentSum += p.price * p.quantity;
            const percentage = currentSum / totalValue;
            if (percentage <= 0.8) a.push(p); // Actually typically A is top 80% value (Pareto), usually ~20% items
            // Let's adjust for standard ABC: A=Top 70-80% value, B=Next 15-25%, C=Bottom 5-10%
            // Simplified here:
            // A items = Top 20% of items count (High Priority)
            // B items = Next 30% of items count
            // C items = Bottom 50% of items count
        }

        // Using Item Count method for simplicity in visualization
        const count = sorted.length;
        const aCount = Math.ceil(count * 0.2);
        const bCount = Math.ceil(count * 0.3);

        return {
            a: sorted.slice(0, aCount),
            b: sorted.slice(aCount, aCount + bCount),
            c: sorted.slice(aCount + bCount)
        };
    },

    // 5. Dead Stock Detection (No sales in X days)
    detectDeadStock: (products: Product[], transactions: Transaction[], days: number = 30): Product[] => {
        const now = new Date();
        const pastDate = new Date();
        pastDate.setDate(now.getDate() - days);

        // Get IDs of products sold recently
        const soldProductIds = new Set(transactions
            .filter(t => t.type === 'OUT' && new Date(t.date) >= pastDate)
            .map(t => t.productId)
        );

        return products.filter(p => !soldProductIds.has(p.id) && p.quantity > 0);
    }
};
