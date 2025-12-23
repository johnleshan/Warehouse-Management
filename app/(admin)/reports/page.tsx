'use client';

import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/lib/storage';
import { AI } from '@/lib/ai';
import { Product, Transaction, Worker, Task, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { useStorageSync } from '@/hooks/useStorageSync';

export default function ReportsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    const reloadData = useCallback(() => {
        storage.init();
        setProducts(storage.getProducts());
        setTransactions(storage.getTransactions());
        setWorkers(storage.getWorkers());
        setTasks(storage.getTasks());
        setUsers(storage.getUsers());
    }, []);

    useStorageSync(reloadData);

    useEffect(() => {
        reloadData();
    }, [reloadData]);

    // 1. Burn Rate Analysis
    const burnRateData = products.map((p: Product) => {
        const rate = AI.calculateBurnRate(transactions, p.id);
        return {
            name: p.name,
            burnRate: rate,
            stock: p.quantity,
            stockoutDate: AI.predictStockout(p, rate)
        };
    }).sort((a, b) => b.burnRate - a.burnRate).slice(0, 10);

    // 2. Sales Over Time (Last 7 Days)
    const getSalesData = () => {
        const days = 7;
        const data = [];
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(now.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const count = transactions.filter((t: Transaction) =>
                t.type === 'OUT' && t.date.startsWith(dateStr)
            ).reduce((sum: number, t: Transaction) => sum + t.quantity, 0);

            data.push({ date: date.toLocaleDateString(), sales: count });
        }
        return data;
    };
    const salesData = getSalesData();

    // 3. Worker Efficiency
    const workerEfficiencyData = workers.map((w: Worker) => ({
        name: w.name,
        efficiency: AI.calculateWorkerEfficiency(w, tasks)
    })).sort((a: any, b: any) => b.efficiency - a.efficiency);

    // 4. User Activity Analysis
    const userActivityData = users.map((u: User) => {
        const userTransactions = transactions.filter((t: Transaction) => t.performedBy === u.id);
        const sales = userTransactions.filter((t: Transaction) => t.type === 'OUT').reduce((sum: number, t: Transaction) => sum + t.quantity, 0);
        const receives = userTransactions.filter((t: Transaction) => t.type === 'IN').reduce((sum: number, t: Transaction) => sum + t.quantity, 0);
        return {
            name: u.name,
            role: u.role,
            sales,
            receives,
            total: sales + receives
        };
    }).sort((a: any, b: any) => b.total - a.total);

    // 5. Optimization Data
    const abcAnalysis = AI.classifyABC(products);
    const deadStock = AI.detectDeadStock(products, transactions);

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981'];

    return (
        <div className="flex flex-col gap-8 pb-10">
            <header className="flex flex-col gap-2">
                <h1 className="text-4xl font-extrabold tracking-tight gradient-text">Smart Analytics</h1>
                <p className="text-muted-foreground text-lg">AI-driven insights and operational performance tracking.</p>
            </header>

            <Tabs defaultValue="forecasting" className="w-full">
                <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-muted/50 p-1 text-muted-foreground">
                    <TabsTrigger value="forecasting" className="rounded-lg px-6 py-2">Forecasting</TabsTrigger>
                    <TabsTrigger value="financials" className="rounded-lg px-6 py-2">Sales Velocity</TabsTrigger>
                    <TabsTrigger value="users" className="rounded-lg px-6 py-2">User Performance</TabsTrigger>
                    <TabsTrigger value="workers" className="rounded-lg px-6 py-2">Worker Stats</TabsTrigger>
                    <TabsTrigger value="optimization" className="rounded-lg px-6 py-2">Optimization</TabsTrigger>
                </TabsList>

                <TabsContent value="forecasting" className="space-y-6 mt-6">
                    <Card className="premium-card shadow-sm">
                        <CardHeader>
                            <CardTitle>Inventory Burn Rate</CardTitle>
                            <CardDescription>Daily sales velocity versus existing stock buffers.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={burnRateData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="top" height={36} />
                                    <Bar dataKey="burnRate" fill="#3b82f6" name="Avg Daily Sales" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="stock" fill="#10b981" name="Current Stock" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="premium-card shadow-sm">
                        <CardHeader>
                            <CardTitle>AI Restock Recommendations</CardTitle>
                            <CardDescription>Predicted stockout timelines based on current trajectory.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-b-2">
                                        <TableHead className="font-bold">Product</TableHead>
                                        <TableHead className="font-bold">Burn Rate</TableHead>
                                        <TableHead className="font-bold">Est. Stockout</TableHead>
                                        <TableHead className="font-bold">Priority</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {burnRateData.filter(d => d.stockoutDate && d.stockoutDate !== '> 1 Year').map((item, idx) => (
                                        <TableRow key={idx} className="group transition-colors hover:bg-muted/30">
                                            <TableCell className="font-semibold">{item.name}</TableCell>
                                            <TableCell>{item.burnRate} units/day</TableCell>
                                            <TableCell className="text-red-600 font-bold">{item.stockoutDate}</TableCell>
                                            <TableCell>
                                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase">Critical</span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {burnRateData.every(d => !d.stockoutDate || d.stockoutDate === '> 1 Year') && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-10">No immediate stockouts predicted.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="financials" className="mt-6">
                    <Card className="premium-card shadow-sm">
                        <CardHeader>
                            <CardTitle>Sales Over Time</CardTitle>
                            <CardDescription>Visualizing unit throughput over the last 7 production days.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="users" className="space-y-6 mt-6">
                    <Card className="premium-card shadow-sm">
                        <CardHeader>
                            <CardTitle>User Activity Distribution</CardTitle>
                            <CardDescription>Total transactions performed per system user (Sales vs Receiving).</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={userActivityData} layout="vertical" margin={{ left: 40, right: 40, top: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fontWeight: 600 }} width={120} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="sales" stackId="a" fill="#3b82f6" name="Sales (OUT)" radius={[4, 0, 0, 4]} />
                                    <Bar dataKey="receives" stackId="a" fill="#10b981" name="Receiving (IN)" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="premium-card shadow-sm">
                        <CardHeader>
                            <CardTitle>Detailed Agent Metrics</CardTitle>
                            <CardDescription>Individual breakdown of agent contributions and operational impact.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-b-2">
                                        <TableHead className="font-bold">Agent Name</TableHead>
                                        <TableHead className="font-bold">Role</TableHead>
                                        <TableHead className="font-bold">Total Sales</TableHead>
                                        <TableHead className="font-bold">Stock Received</TableHead>
                                        <TableHead className="font-bold">Activity Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userActivityData.map((user, idx) => (
                                        <TableRow key={idx} className="group transition-colors hover:bg-muted/30">
                                            <TableCell className="font-semibold">{user.name}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {user.role}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-mono">{user.sales} units</TableCell>
                                            <TableCell className="font-mono">{user.receives} units</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden w-20">
                                                        <div
                                                            className="h-full bg-blue-500"
                                                            style={{ width: `${Math.min((user.total / (transactions.length || 1)) * 100 * 5, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold">{user.total}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>


                <TabsContent value="workers" className="mt-6">
                    <Card className="premium-card shadow-sm">
                        <CardHeader>
                            <CardTitle>Worker Efficiency Leaderboard</CardTitle>
                            <CardDescription>Relative performance based on tasks completed per active shift.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={workerEfficiencyData} layout="vertical" margin={{ left: 40, right: 40, top: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fontWeight: 600 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff' }}
                                    />
                                    <Bar dataKey="efficiency" radius={[0, 8, 8, 0]}>
                                        {workerEfficiencyData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="optimization" className="space-y-6 mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="premium-card">
                            <CardHeader>
                                <CardTitle>ABC Analysis (Value Pareto)</CardTitle>
                                <CardDescription>Inventory categorized by total tied-up capital.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-4 w-4 rounded-full bg-green-500 shadow-lg shadow-green-500/20" />
                                            <span className="font-bold text-sm tracking-tight">Category A (High Value)</span>
                                        </div>
                                        <span className="font-black text-lg">{abcAnalysis.a.length} <span className="text-[10px] text-muted-foreground uppercase">items</span></span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-4 w-4 rounded-full bg-amber-500 shadow-lg shadow-amber-500/20" />
                                            <span className="font-bold text-sm tracking-tight">Category B (Medium)</span>
                                        </div>
                                        <span className="font-black text-lg">{abcAnalysis.b.length} <span className="text-[10px] text-muted-foreground uppercase">items</span></span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-4 w-4 rounded-full bg-slate-400 shadow-lg shadow-slate-400/20" />
                                            <span className="font-bold text-sm tracking-tight">Category C (Standard)</span>
                                        </div>
                                        <span className="font-black text-lg">{abcAnalysis.c.length} <span className="text-[10px] text-muted-foreground uppercase">items</span></span>
                                    </div>
                                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex shadow-inner">
                                        <div style={{ width: `${(abcAnalysis.a.length / products.length) * 100}%` }} className="bg-green-500 h-full transition-all duration-1000" />
                                        <div style={{ width: `${(abcAnalysis.b.length / products.length) * 100}%` }} className="bg-amber-500 h-full transition-all duration-1000" />
                                        <div style={{ width: `${(abcAnalysis.c.length / products.length) * 100}%` }} className="bg-slate-400 h-full transition-all duration-1000" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="premium-card">
                            <CardHeader>
                                <CardTitle>Dead Stock Detection</CardTitle>
                                <CardDescription>Assets with zero market movement in 30 days.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="max-h-[250px] overflow-auto rounded-lg border border-muted/50">
                                    <Table>
                                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                                            <TableRow>
                                                <TableHead className="font-bold">Product</TableHead>
                                                <TableHead className="font-bold">Stock</TableHead>
                                                <TableHead className="font-bold">Value</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {deadStock.map(p => (
                                                <TableRow key={p.id} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell className="font-medium">{p.name}</TableCell>
                                                    <TableCell>{p.quantity}</TableCell>
                                                    <TableCell className="font-bold text-indigo-600">${(p.price * p.quantity).toFixed(0)}</TableCell>
                                                </TableRow>
                                            ))}
                                            {deadStock.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center text-muted-foreground py-10 opacity-50 italic">Optimum turnover - No dead stock detected.</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
