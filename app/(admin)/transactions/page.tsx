'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useStorageSync } from '@/hooks/useStorageSync';
import { storage } from '@/lib/storage';
import { Transaction, Product, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Filter, Search, Download, RefreshCw } from 'lucide-react';

type TimeFilter =
    | '1h' | '3h' | '6h' | '12h' | '24h'
    | 'week' | 'month'
    | 'q1' | 'q2' | 'q3' | 'q4' // Quarters (current year implied or selected)
    | 'half1' | 'half2'
    | 'year_curr' | 'year_2024' | 'year_2023' // Dynamic years could be better
    | 'all';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');

    const loadData = useCallback(async () => {
        setLoading(true);
        await storage.init();
        const [t, p, u] = await Promise.all([
            storage.getTransactions(),
            storage.getProducts(),
            storage.getUsers()
        ]);
        // Sort by newest first
        setTransactions(t.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setProducts(p);
        setUsers(u);
        setLoading(false);
    }, []);

    useStorageSync(loadData);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Filtering Logic
    const filteredTransactions = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();

        return transactions.filter(t => {
            const tDate = new Date(t.date);
            const tYear = tDate.getFullYear();

            // 1. Text Search (Product Name, Performer Name, Notes)
            const product = products.find(p => p.id === t.productId);
            const user = users.find(u => u.id === t.performedBy);
            const searchLower = search.toLowerCase();
            const matchesSearch =
                !search ||
                product?.name.toLowerCase().includes(searchLower) ||
                user?.name.toLowerCase().includes(searchLower) ||
                t.id.toLowerCase().includes(searchLower);

            if (!matchesSearch) return false;

            // 2. Type Filter
            if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;

            // 3. Time Filter
            if (timeFilter === 'all') return true;

            const diffMs = now.getTime() - tDate.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);

            switch (timeFilter) {
                // Hours
                case '1h': return diffHours <= 1;
                case '3h': return diffHours <= 3;
                case '6h': return diffHours <= 6;
                case '12h': return diffHours <= 12;
                case '24h': return diffHours <= 24;

                // Periods
                case 'week': {
                    const oneWeekAgo = new Date(now);
                    oneWeekAgo.setDate(now.getDate() - 7);
                    return tDate >= oneWeekAgo;
                }
                case 'month': {
                    const oneMonthAgo = new Date(now);
                    oneMonthAgo.setMonth(now.getMonth() - 1);
                    return tDate >= oneMonthAgo;
                }

                // Quarters (Current Year)
                case 'q1': return tYear === currentYear && tDate.getMonth() >= 0 && tDate.getMonth() <= 2;
                case 'q2': return tYear === currentYear && tDate.getMonth() >= 3 && tDate.getMonth() <= 5;
                case 'q3': return tYear === currentYear && tDate.getMonth() >= 6 && tDate.getMonth() <= 8;
                case 'q4': return tYear === currentYear && tDate.getMonth() >= 9 && tDate.getMonth() <= 11;

                // Halves (Current Year)
                case 'half1': return tYear === currentYear && tDate.getMonth() <= 5;
                case 'half2': return tYear === currentYear && tDate.getMonth() >= 6;

                // Specific Years
                case 'year_curr': return tYear === currentYear;
                case 'year_2024': return tYear === 2024;
                case 'year_2023': return tYear === 2023;

                default: return true;
            }
        });
    }, [transactions, products, users, search, timeFilter, typeFilter]);

    return (
        <div className="flex flex-col gap-6 pb-10">
            <header className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">Financial Statement</h1>
                        <p className="text-muted-foreground">Comprehensive transaction history and audit log.</p>
                    </div>
                    <Button onClick={loadData} variant="outline" size="icon" disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </header>

            <Card className="premium-card">
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <CardTitle className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Calendar className="h-5 w-5" />
                            </div>
                            Ledger Entries
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            {/* Time Filters */}
                            <Select value={timeFilter} onValueChange={(v: any) => setTimeFilter(v)}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="1h">Last 1 Hour</SelectItem>
                                    <SelectItem value="3h">Last 3 Hours</SelectItem>
                                    <SelectItem value="6h">Last 6 Hours</SelectItem>
                                    <SelectItem value="12h">Last 12 Hours</SelectItem>
                                    <SelectItem value="18h">Last 18 Hours</SelectItem>
                                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                                    <SelectItem value="week">Past Week</SelectItem>
                                    <SelectItem value="month">Past Month</SelectItem>
                                    <div className="border-t my-1" />
                                    <SelectItem value="q1">Q1 (Jan-Mar)</SelectItem>
                                    <SelectItem value="q2">Q2 (Apr-Jun)</SelectItem>
                                    <SelectItem value="q3">Q3 (Jul-Sep)</SelectItem>
                                    <SelectItem value="q4">Q4 (Oct-Dec)</SelectItem>
                                    <div className="border-t my-1" />
                                    <SelectItem value="half1">First Half (H1)</SelectItem>
                                    <SelectItem value="half2">Second Half (H2)</SelectItem>
                                    <div className="border-t my-1" />
                                    <SelectItem value="year_curr">Current Year ({new Date().getFullYear()})</SelectItem>
                                    <SelectItem value="year_2024">2024</SelectItem>
                                    <SelectItem value="year_2023">2023</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Type Filter */}
                            <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Types</SelectItem>
                                    <SelectItem value="OUT">Sales (OUT)</SelectItem>
                                    <SelectItem value="IN">Restock (IN)</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-9 w-[200px]"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Transaction ID</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Quantity</TableHead>
                                    <TableHead>Performed By</TableHead>
                                    <TableHead>Value</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((t) => {
                                        const product = products.find(p => p.id === t.productId);
                                        const user = users.find(u => u.id === t.performedBy);
                                        return (
                                            <TableRow key={t.id} className="group hover:bg-muted/50">
                                                <TableCell className="font-mono text-xs">
                                                    {new Date(t.date).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {t.id.slice(0, 8).toUpperCase()}...
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {product?.name || 'Unknown Item'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={t.type === 'OUT' ? 'default' : 'secondary'} className={t.type === 'OUT' ? 'bg-red-100 text-red-700 hover:bg-red-200 shadow-none' : 'bg-green-100 text-green-700 hover:bg-green-200 shadow-none'}>
                                                        {t.type === 'OUT' ? 'SALE' : 'STOCK IN'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-bold">
                                                    {t.quantity}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                                                            {user?.name?.[0] || '?'}
                                                        </div>
                                                        <span className="text-sm">{user?.name || 'System'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {product ? `Ksh ${(product.price * t.quantity).toLocaleString()}` : '-'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-64 text-center text-muted-foreground">
                                            No transactions found matching your filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <p>Showing {filteredTransactions.length} of {transactions.length} entries</p>
                        <Button variant="ghost" size="sm" onClick={() => window.print()}>
                            <Download className="mr-2 h-3 w-3" />
                            Export Statement
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
