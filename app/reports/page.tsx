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

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Smart Reports</h1>

            <Tabs defaultValue="forecasting">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
                    <TabsTrigger value="workers">Worker Stats</TabsTrigger>
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
            </Tabs>
        </div>
    );
}
