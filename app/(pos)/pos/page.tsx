'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { Product, Transaction } from '@/lib/types';
import { ProductGrid } from '@/components/POS/ProductGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator'; // Need to add
import { Search, ShoppingCart, Trash2, CreditCard, Truck } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User as UserType } from '@/lib/types';
import { LogOut } from 'lucide-react';
import { generateId } from '@/lib/utils';

interface CartItem {
    product: Product;
    quantity: number;
}

export default function POSPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    const router = useRouter();

    const loadData = () => {
        storage.init();
        setProducts(storage.getProducts());
        setCurrentUser(storage.getCurrentUser());
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            loadData();
        }
    }, []);

    const handleLogout = () => {
        storage.logout();
        toast.success('Logged out');
        router.push('/login');
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                // Check stock limit
                if (existing.quantity >= product.quantity) {
                    toast.error(`Only ${product.quantity} in stock!`);
                    return prev;
                }
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.product.id === productId) {
                    const newQty = item.quantity + delta;
                    if (newQty <= 0) return item; // Don't remove, just stay at 1? Or remove? Let's stay at 1
                    if (newQty > item.product.quantity) {
                        toast.error(`Only ${item.product.quantity} in stock!`);
                        return item;
                    }
                    return { ...item, quantity: newQty };
                }
                return item;
            });
        });
    };

    const handleCheckout = () => {
        if (cart.length === 0 || !currentUser) return;

        // Process transactions
        cart.forEach(item => {
            const transaction: Transaction = {
                id: generateId(),
                type: 'OUT',
                productId: item.product.id,
                quantity: item.quantity,
                date: new Date().toISOString(),
                notes: 'POS Sale',
                performedBy: currentUser.id
            };
            storage.addTransaction(transaction);
        });

        toast.success('Transaction Completed!');
        setCart([]);
        loadData(); // Refresh stock
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% Tax Mock
    const total = subtotal + tax;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] gap-4">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 text-white rounded-2xl shadow-xl border border-slate-800">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                        <Truck className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col leading-tight">
                        <h1 className="text-xl font-bold tracking-tight">Retail Terminal</h1>
                        {currentUser && (
                            <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">
                                Active Agent: <span className="text-white">{currentUser.name}</span>
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {currentUser?.role === 'ADMIN' && (
                        <Link href="/">
                            <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl">
                                Admin Dashboard
                            </Button>
                        </Link>
                    )}
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl">
                        <LogOut className="h-4 w-4 mr-2" />
                        End Shift
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 gap-4 overflow-hidden">
                {/* Product Area */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search products..."
                                className="pl-8 w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-1">
                        <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
                    </div>
                </div>

                {/* Cart Sidebar */}
                <Card className="w-[350px] flex flex-col h-full">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Current Order
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                        <div className="space-y-4">
                            {cart.map(item => (
                                <div key={item.product.id} className="flex items-center justify-between gap-2">
                                    <div className="flex-1">
                                        <p className="font-medium line-clamp-1">{item.product.name}</p>
                                        <p className="text-sm text-muted-foreground">${item.product.price.toFixed(2)} x {item.quantity}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.product.id, -1)}>-</Button>
                                        <span className="w-4 text-center text-sm">{item.quantity}</span>
                                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.product.id, 1)}>+</Button>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeFromCart(item.product.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {cart.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                    <ShoppingCart className="h-12 w-12 mb-2" />
                                    <p>Cart is empty</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    {cart.length > 0 && (
                        <div className="p-6 pt-0 mt-auto bg-muted/20">
                            <div className="space-y-2 py-4">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Tax (8%)</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                            <Button className="w-full size-lg gap-2" size="lg" onClick={handleCheckout}>
                                <CreditCard className="h-4 w-4" />
                                Complete Sale
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
