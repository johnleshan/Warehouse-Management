'use client';

import { useState } from 'react';
import { Product, Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storage } from '@/lib/storage';

interface IncomingFormProps {
    products: Product[];
    onComplete: () => void;
}

export function IncomingForm({ products, onComplete }: IncomingFormProps) {
    const [productId, setProductId] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId || quantity <= 0) return;

        const transaction: Transaction = {
            id: crypto.randomUUID(),
            type: 'IN',
            productId,
            quantity,
            date: new Date().toISOString(),
            notes: notes || 'Receiving Stock'
        };

        storage.addTransaction(transaction);
        onComplete();
        // Reset
        setQuantity(0);
        setNotes('');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-md">
            <div className="grid gap-2">
                <Label htmlFor="product">Select Product</Label>
                <select
                    id="product"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    required
                >
                    <option value="" disabled>Select a product...</option>
                    {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Current: {p.quantity})</option>
                    ))}
                </select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity to Add</Label>
                <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="notes">Notes (PO #, Supplier info)</Label>
                <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. PO-12345"
                />
            </div>
            <Button type="submit" disabled={!productId || quantity <= 0} className="w-full">
                Confirm Receipt
            </Button>
        </form>
    );
}
