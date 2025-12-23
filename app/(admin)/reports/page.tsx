'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { AI } from '@/lib/ai';
import { Product, Transaction, Worker, Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function ReportsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            storage.init();
            setProducts(storage.getProducts());
            setTransactions(storage.getTransactions());
            setWorkers(storage.getWorkers());
            setTasks(storage.getTasks());
        }
    }, []);

    // 1. Burn Rate Analysis
    const burnRateData = products.map(p => {
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

            const count = transactions.filter(t =>
                t.type === 'OUT' && t.date.startsWith(dateStr)
            ).reduce((sum, t) => sum + t.quantity, 0);

            data.push({ date: date.toLocaleDateString(), sales: count });
        }
        return data;
    };
    const salesData = getSalesData();

    // 3. Worker Efficiency
    const workerEfficiencyData = workers.map(w => ({
        name: w.name,
        efficiency: AI.calculateWorkerEfficiency(w, tasks)
    })).sort((a, b) => b.efficiency - a.efficiency);

    // 4. Optimization Data
    const abcAnalysis = AI.classifyABC(products);
    const deadStock = AI.detectDeadStock(products, transactions);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Smart Reports</h1>

            <Tabs defaultValue="forecasting">
                <TabsList className="grid w-full grid-cols-4 max-w-xl">
                    <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
                    <TabsTrigger value="workers">Worker Stats</TabsTrigger>
                    <TabsTrigger value="optimization">Optimization</TabsTrigger>
                </TabsList>

                <TabsContent value="forecasting" className="space-y-4">
                    {/* Burn Rate Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Burn Rate (Top Items)</CardTitle>
                            <CardDescription>Average daily sales velocity per product.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={burnRateData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="burnRate" fill="#3b82f6" name="Avg Daily Sales" />
                                    <Bar dataKey="stock" fill="#10b981" name="Current Stock" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Reorder Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle>AI Restock Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Burn Rate</TableHead>
                                        <TableHead>Est. Stockout</TableHead>
                                        <TableHead>Suggestion</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {burnRateData.filter(d => d.stockoutDate && d.stockoutDate !== '> 1 Year').map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell>{item.burnRate}/day</TableCell>
                                            <TableCell className="text-red-600 font-bold">{item.stockoutDate}</TableCell>
                                            <TableCell>Restock Soon</TableCell>
                                        </TableRow>
                                    ))}
                                    {burnRateData.every(d => !d.stockoutDate || d.stockoutDate === '> 1 Year') && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">No immediate stockouts predicted.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="financials" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Velocity (Last 7 Days)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="workers" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Worker Efficiency Leaderboard</CardTitle>
                            <CardDescription>Tasks completed per active day.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={workerEfficiencyData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="efficiency" fill="#f59e0b" name="Efficiency Score" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="optimization" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>ABC Analysis</CardTitle>
                                <CardDescription>Inventory Categorization by Value</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-green-500" />
                                            <span className="font-medium">Category A (High Value)</span>
                                        </div>
                                        <span className="font-bold">{abcAnalysis.a.length} items</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-yellow-500" />
                                            <span className="font-medium">Category B (Medium)</span>
                                        </div>
                                        <span className="font-bold">{abcAnalysis.b.length} items</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-slate-500" />
                                            <span className="font-medium">Category C (Low Value)</span>
                                        </div>
                                        <span className="font-bold">{abcAnalysis.c.length} items</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                        <div style={{ width: `${(abcAnalysis.a.length / products.length) * 100}%` }} className="bg-green-500 h-full" />
                                        <div style={{ width: `${(abcAnalysis.b.length / products.length) * 100}%` }} className="bg-yellow-500 h-full" />
                                        <div style={{ width: `${(abcAnalysis.c.length / products.length) * 100}%` }} className="bg-slate-500 h-full" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Dead Stock Detection</CardTitle>
                                <CardDescription>Items with no sales in 30 days</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="max-h-[200px] overflow-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Stock</TableHead>
                                                <TableHead>Value</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {deadStock.map(p => (
                                                <TableRow key={p.id}>
                                                    <TableCell>{p.name}</TableCell>
                                                    <TableCell>{p.quantity}</TableCell>
                                                    <TableCell>${(p.price * p.quantity).toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                            {deadStock.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center text-muted-foreground">No dead stock found.</TableCell>
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
