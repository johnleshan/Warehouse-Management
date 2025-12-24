'use client';

import { useEffect, useState, useCallback } from 'react';
import { DollarSign, Package, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { Product, Transaction, Worker, User } from '@/lib/types';
import { useStorageSync } from '@/hooks/useStorageSync';
import { StatCard } from '@/components/Dashboard/StatCard';
import { AIInsightBox } from '@/components/Dashboard/AIInsightBox';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

import Link from 'next/link';

// Simple helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount).replace('KES', 'Ksh');
};

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dailyTip, setDailyTip] = useState("Analyzing data...");
  const [isUrgent, setIsUrgent] = useState(false);

  const reloadData = useCallback(async () => {
    await storage.init();
    const [p, t, w, u] = await Promise.all([
      storage.getProducts(),
      storage.getTransactions(),
      storage.getWorkers(),
      storage.getUsers()
    ]);

    setProducts(p);
    setTransactions([...t].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
    setWorkers(w);
    setUsers(u);
  }, []);

  useStorageSync(reloadData);

  useEffect(() => {
    reloadData();
  }, []);

  useEffect(() => {
    // Generate AI Tip based on data
    if (products.length > 0) {
      const outOfStock = products.filter(p => p.quantity === 0);
      const lowStock = products.filter(p => p.quantity > 0 && p.quantity < p.minStock);

      if (outOfStock.length > 0) {
        setIsUrgent(true);
        setDailyTip(`CRITICAL: ${outOfStock.length} items are completely SOLD OUT! (e.g., ${outOfStock[0].name}). Immediate restock required to prevent loss of sales.`);
      } else if (lowStock.length > 0) {
        setIsUrgent(false);
        setDailyTip(`Staff Alert: ${lowStock[0].name} is running thin (${lowStock[0].quantity} remaining). Consider restocking soon.`);
      } else {
        setIsUrgent(false);
        setDailyTip("Warehouse optimization is at 100%. All stock levels are currently healthy.");
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
  const topWorkerName = workers[0]?.name || "Calculating...";

  return (
    <div className="flex flex-col gap-8 pb-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight gradient-text">Command Center</h1>
        <p className="text-muted-foreground text-lg">Intelligent oversight for your warehouse operations.</p>
      </header>

      <AIInsightBox tip={dailyTip} isUrgent={isUrgent} />

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Inventory Value"
          value={formatCurrency(totalInventoryValue)}
          icon={DollarSign}
          description="Total capital in stock"
          className="premium-card border-none bg-blue-500/5 shadow-none"
        />
        <StatCard
          title="Stock Alerts"
          value={lowStockCount}
          icon={Package}
          description={lowStockCount > 0 ? "Depleted stock items" : "All levels healthy"}
          trend={lowStockCount > 0 ? `+${lowStockCount} critical` : ""}
          trendUp={false}
          className="premium-card border-none bg-amber-500/5 shadow-none"
        />
        <StatCard
          title="Daily Throughput"
          value={todaysOrders}
          icon={ShoppingCart}
          description="Outgoing orders today"
          className="premium-card border-none bg-green-500/5 shadow-none"
        />
        <StatCard
          title="Pulse Check"
          value={topWorkerName}
          icon={Users}
          description="Lead performer this shift"
          className="premium-card border-none bg-indigo-500/5 shadow-none"
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7 mt-4 lg:mt-0">
        <Card className="col-span-1 lg:col-span-4 premium-card shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle>Activity Ledger</CardTitle>
            <CardDescription>Real-time transaction log with identity tracking.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Recent Transactions List */}
              {transactions.slice(0, 6).map((t) => {
                const product = products.find(p => p.id === t.productId);
                const performer = users.find(u => u.id === t.performedBy);
                return (
                  <div key={t.id} className="flex items-center group transition-all hover:bg-muted/20 p-2 rounded-lg -mx-2">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 ${t.type === 'OUT' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {t.type === 'OUT' ? <ShoppingCart className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-semibold leading-none">{product?.name || 'Inventory Update'}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.type === 'OUT' ? 'Outgoing' : 'Incoming'} • <span className="font-medium text-foreground">{performer?.name || 'System'}</span> • {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className={`text-sm font-bold ${t.type === 'OUT' ? 'text-red-500' : 'text-green-500'}`}>
                      {t.type === 'OUT' ? '-' : '+'}{t.quantity}
                    </div>
                  </div>
                )
              })}
              {transactions.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No recent transactions recorded.</p>}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3 premium-card shadow-sm border-primary/10">
          <CardHeader>
            <CardTitle>Direct Actions</CardTitle>
            <CardDescription>Immediate operational controls.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/inventory" className="flex items-center gap-4 p-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-all border border-blue-500/10 group">
              <div className="bg-blue-500 p-2 rounded-lg shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform"><Package className="h-5 w-5 text-white" /></div>
              <div className="font-semibold text-blue-600 dark:text-blue-400">Catalogue Manager</div>
            </Link>
            <Link href="/orders" className="flex items-center gap-4 p-4 rounded-xl bg-green-500/10 hover:bg-green-500/20 transition-all border border-green-500/10 group">
              <div className="bg-green-500 p-2 rounded-lg shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform"><ShoppingCart className="h-5 w-5 text-white" /></div>
              <div className="font-semibold text-green-600 dark:text-green-400">Order Gateway</div>
            </Link>
            <Link href="/pos" className="flex items-center gap-4 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all border border-primary/20 group">
              <div className="bg-primary p-2 rounded-lg shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform"><TrendingUp className="h-5 w-5 text-white" /></div>
              <div className="font-semibold text-primary">Retail Terminal</div>
            </Link>
            <Link href="/users" className="flex items-center gap-4 p-4 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 transition-all border border-slate-500/10 group">
              <div className="bg-slate-500 p-2 rounded-lg shadow-lg shadow-slate-500/20 group-hover:scale-110 transition-transform"><Users className="h-5 w-5 text-white" /></div>
              <div className="font-semibold text-slate-600 dark:text-slate-400">Staff directory</div>
            </Link>

            <div className="mt-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span>System Diagnostics</span>
                <span className="text-red-500">{typeof window !== 'undefined' ? window.location.origin : '...'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-background/50 rounded-lg">Products: <span className="font-bold">{products.length}</span></div>
                <div className="p-2 bg-background/50 rounded-lg">Logs: <span className="font-bold">{transactions.length}</span></div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full text-[10px] h-8 font-black uppercase tracking-widest"
                onClick={() => {
                  if (confirm("DANGER: This will wipe all current transactions and reset to factory data. Proceed?")) {
                    storage.resetStorage();
                    window.location.reload();
                  }
                }}
              >
                Clear & Factory Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
