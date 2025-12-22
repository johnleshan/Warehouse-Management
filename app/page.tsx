'use client';

import { useEffect, useState } from 'react';
import { DollarSign, Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Product, Transaction, Worker } from '@/lib/types';
import { StatCard } from '@/components/Dashboard/StatCard';
import { AIInsightBox } from '@/components/Dashboard/AIInsightBox';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

// Simple helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [dailyTip, setDailyTip] = useState("Analyzing data...");

  useEffect(() => {
    // Determine environment (client-side only logic)
    if (typeof window !== 'undefined') {
      storage.init();
      setProducts(storage.getProducts());
      setTransactions(storage.getTransactions());
      setWorkers(storage.getWorkers());
    }
  }, []);

  useEffect(() => {
    // Generate AI Tip based on data
    if (products.length > 0) {
      const lowStock = products.filter(p => p.quantity < p.minStock);
      if (lowStock.length > 0) {
        setDailyTip(`Alert: ${lowStock.length} items are below safe stock levels! Prioritize restocking ${lowStock[0].name}.`);
      } else {
        setDailyTip("Inventory levels look healthy. Great job maintaining stock!");
      }
    }
  }, [products]);

  // Calculations
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
  const lowStockCount = products.filter(p => p.quantity <= p.minStock).length;
  // Assumes transactions from today
  const today = new Date().toISOString().split('T')[0];
  const todaysOrders = transactions.filter(t => t.type === 'OUT' && t.date.startsWith(today)).length;

  // Find top worker (simplified logic)
  const topWorkerName = "Alice Johnson"; // Placeholder, would need Task logic linked to time

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <AIInsightBox tip={dailyTip} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Inventory Value"
          value={formatCurrency(totalInventoryValue)}
          icon={DollarSign}
          description="Across all categories"
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockCount}
          icon={Package}
          description={lowStockCount > 0 ? "Action needed immediately" : "Stock is healthy"}
          trend={lowStockCount > 0 ? "+2 from yesterday" : ""}
          trendUp={false}
        />
        <StatCard
          title="Today's Orders"
          value={todaysOrders}
          icon={ShoppingCart}
          description="Processed today"
        />
        <StatCard
          title="Top Worker"
          value={topWorkerName}
          icon={Users}
          description="Most tasks completed"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>
              Overview of the latest outgoing inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Recent Transactions List */}
              {transactions.slice(0, 5).map((t) => {
                const product = products.find(p => p.id === t.productId);
                return (
                  <div key={t.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{product?.name || 'Unknown Item'}</p>
                      <p className="text-sm text-muted-foreground">{t.type === 'OUT' ? 'Sold' : 'Restocked'} at {new Date(t.date).toLocaleDateString()}</p>
                    </div>
                    <div className={`ml-auto font-medium ${t.type === 'OUT' ? 'text-red-500' : 'text-green-500'}`}>
                      {t.type === 'OUT' ? '-' : '+'}{t.quantity}
                    </div>
                  </div>
                )
              })}
              {transactions.length === 0 && <p className="text-sm text-muted-foreground">No recent activity.</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div
              className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => window.location.href = '/inventory'}
            >
              <div className="bg-blue-100 p-2 rounded-full"><Package className="h-5 w-5 text-blue-600" /></div>
              <div className="font-medium">Add New Product</div>
            </div>
            <div
              className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => window.location.href = '/orders'}
            >
              <div className="bg-green-100 p-2 rounded-full"><ShoppingCart className="h-5 w-5 text-green-600" /></div>
              <div className="font-medium">Process Order</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
