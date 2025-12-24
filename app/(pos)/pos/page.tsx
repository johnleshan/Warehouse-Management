'use client';

import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/lib/storage';
import { Product, Transaction } from '@/lib/types';
import { ProductGrid } from '@/components/POS/ProductGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator'; // Need to add
import { Search, ShoppingCart, Trash2, CreditCard, Truck, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { useStorageSync } from '@/hooks/useStorageSync';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User as UserType } from '@/lib/types';
import { LogOut } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
    SheetClose
} from '@/components/ui/sheet';

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

    const loadData = useCallback(async () => {
        await storage.init();
        const p = await storage.getProducts();
        setProducts(p);
        setCurrentUser(storage.getCurrentUser());
    }, []);

    useStorageSync(loadData);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            loadData();
        }
    }, [loadData]);

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
        Promise.all(cart.map(item => {
            const transaction: Transaction = {
                id: generateId(),
                type: 'OUT',
                productId: item.product.id,
                quantity: item.quantity,
                date: new Date().toISOString(),
                notes: 'POS Sale',
                performedBy: currentUser.id
            };
            return storage.addTransaction(transaction);
        })).then(() => {
            toast.success('Transaction Completed!');
            setCart([]);
            loadData(); // Refresh stock
        });
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% Tax Mock
    const total = subtotal + tax;

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] gap-4 bg-background text-foreground">
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 gap-3 bg-card text-card-foreground rounded-2xl shadow-xl border border-border">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                        <Truck className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col leading-tight">
                        <h1 className="text-xl font-bold tracking-tight">Retail Terminal</h1>
                        {currentUser && (
                            <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">
                                <span className="hidden sm:inline">Active Agent:</span> <span className="text-primary font-black uppercase">{currentUser.name}</span>
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        {currentUser?.role === 'ADMIN' && (
                            <Link href="/">
                                <Button variant="outline" size="sm" className="hidden lg:flex border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-xl">
                                    <LayoutDashboard className="h-4 w-4 mr-2" />
                                    Admin
                                </Button>
                            </Link>
                        )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl">
                        <LogOut className="h-4 w-4 mr-2" />
                        <span className="hidden sm:block">End Shift</span>
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 gap-4 overflow-hidden">
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
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="lg:hidden gap-2 border-primary/20 bg-primary/5">
                                    <ShoppingCart className="h-4 w-4" />
                                    Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="p-0 w-full sm:max-w-md">
                                <SheetHeader className="p-6 border-b">
                                    <SheetTitle className="flex items-center gap-2">
                                        <ShoppingCart className="h-5 w-5" />
                                        Current Order
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col h-[calc(100%-80px)]">
                                    <div className="flex-1 overflow-auto p-6">
                                        {/* Same cart content logic */}
                                        <div className="space-y-4">
                                            {cart.map(item => (
                                                <div key={item.product.id} className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-accent/50 transition-colors">
                                                    <div className="flex-1">
                                                        <p className="font-bold line-clamp-1">{item.product.name}</p>
                                                        <p className="text-sm text-primary font-mono">Ksh {item.product.price.toLocaleString()} x {item.quantity}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1 border border-border">
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => updateQuantity(item.product.id, -1)}>-</Button>
                                                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => updateQuantity(item.product.id, 1)}>+</Button>
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/50 hover:text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.product.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {cart.length === 0 && (
                                                <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50 py-20">
                                                    <ShoppingCart className="h-12 w-12 mb-2" />
                                                    <p className="text-sm font-medium">Cart is empty</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {cart.length > 0 && (
                                        <div className="p-6 border-t bg-muted/20">
                                            <div className="space-y-2 mb-4">
                                                <div className="flex justify-between text-sm"><span>Subtotal</span><span>Ksh {subtotal.toLocaleString()}</span></div>
                                                <div className="flex justify-between text-lg font-bold"><span>Total</span><span>Ksh {total.toLocaleString()}</span></div>
                                            </div>
                                            <SheetClose asChild>
                                                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white" size="lg" onClick={handleCheckout}>
                                                    Complete Sale
                                                </Button>
                                            </SheetClose>
                                        </div>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <div className="flex-1 overflow-auto p-1">
                        <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
                    </div>
                </div>

                {/* Desktop Cart Sidebar */}
                <Card className="hidden lg:flex w-[350px] flex-col h-full border-border bg-card shadow-2xl overflow-hidden rounded-2xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Current Order
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto border-y border-slate-800/50 py-4">
                        <div className="space-y-4">
                            {cart.map(item => (
                                <div key={item.product.id} className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-accent/50 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-bold line-clamp-1">{item.product.name}</p>
                                        <p className="text-sm text-primary font-mono">Ksh {item.product.price.toLocaleString()} x {item.quantity}</p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1 border border-border">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => updateQuantity(item.product.id, -1)}>-</Button>
                                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => updateQuantity(item.product.id, 1)}>+</Button>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/50 hover:text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.product.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {cart.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50 py-20">
                                    <ShoppingCart className="h-12 w-12 mb-2" />
                                    <p className="text-sm font-medium">Cart is empty</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    {cart.length > 0 && (
                        <div className="p-6 pt-0 mt-auto bg-muted/20">
                            <div className="space-y-2 py-4">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>Ksh {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Tax (8%)</span>
                                    <span>Ksh {tax.toLocaleString()}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>Ksh {total.toLocaleString()}</span>
                                </div>
                            </div>
                            <Button className="w-full size-lg gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/20" size="lg" onClick={handleCheckout}>
                                <CreditCard className="h-4 w-4" />
                                Complete Sale
                            </Button>
                        </div>
                    )}
                </Card>
            </div>

            <div className="flex items-center justify-between px-4 py-1 text-[10px] text-muted-foreground/50 font-mono tracking-tighter">
                <div className="flex gap-4">
                    <span>HOST: {typeof window !== 'undefined' ? window.location.host : '...'}</span>
                    <span>SYNC: BroadcastChannel Active</span>
                </div>
                <div className="flex gap-4">
                    <span>Products: {products.length}</span>
                    <span>Role: {currentUser?.role}</span>
                </div>
            </div>
        </div>
    );
}
