'use client';

import { useState } from 'react';
import { Product, Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storage } from '@/lib/storage';

interface OutgoingFormProps {
    products: Product[];
    onComplete: () => void;
}

export function OutgoingForm({ products, onComplete }: OutgoingFormProps) {
    const [productId, setProductId] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [notes, setNotes] = useState('');

    const selectedProduct = products.find(p => p.id === productId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId || quantity <= 0) return;

        // Check stock
        if (selectedProduct && selectedProduct.quantity < quantity) {
            alert('Insufficient stock!');
            return;
        }

        const transaction: Transaction = {
            id: crypto.randomUUID(),
            type: 'OUT',
            productId,
            quantity,
            date: new Date().toISOString(),
            notes: notes || 'Outgoing Order'
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
                <Label htmlFor="product-out">Select Product</Label>
                <select
                    id="product-out"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    required
                >
                    <option value="" disabled>Select a product...</option>
                    {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                            {p.name} (Stock: {p.quantity}) {p.quantity <= 0 ? '- OUT OF STOCK' : ''}
                        </option>
                    ))}
                </select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="quantity-out">Quantity to Remove</Label>
                <Input
                    id="quantity-out"
                    type="number"
                    min="1"
                    max={selectedProduct?.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    required
                />
                {selectedProduct && <p className="text-xs text-muted-foreground">Max available: {selectedProduct.quantity}</p>}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="notes-out">Notes (Order #, Destination)</Label>
                <Input
                    id="notes-out"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Order #1001"
                />
            </div>
            <Button type="submit" disabled={!productId || quantity <= 0} className="w-full bg-red-600 hover:bg-red-700">
                Confirm Shipment
            </Button>
        </form>
    );
}
