'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { Product, Transaction } from '@/lib/types';
import { IncomingForm } from '@/components/Orders/IncomingForm';
import { OutgoingForm } from '@/components/Orders/OutgoingForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function OrdersPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const loadData = () => {
        storage.init();
        setProducts(storage.getProducts());
        setTransactions(storage.getTransactions());
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            loadData();
        }
    }, []);

    // Sort transactions by date desc
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Order Processing</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Action Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Stock</CardTitle>
                        <CardDescription>Receive inventory or process outgoing orders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="incoming" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="incoming">Incoming (Receive)</TabsTrigger>
                                <TabsTrigger value="outgoing">Outgoing (Sell)</TabsTrigger>
                            </TabsList>
                            <TabsContent value="incoming">
                                <IncomingForm products={products} onComplete={loadData} />
                            </TabsContent>
                            <TabsContent value="outgoing">
                                <OutgoingForm products={products} onComplete={loadData} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* History Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>History of stock movements.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-[500px] overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Product</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedTransactions.map(t => {
                                        const prod = products.find(p => p.id === t.productId);
                                        return (
                                            <TableRow key={t.id}>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {t.type}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{prod ? prod.name : 'Unknown'}</TableCell>
                                                <TableCell>{t.quantity}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString()}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
