'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Home, ShoppingCart, Users, BarChart3, Settings, Truck, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function AppSidebar() {
    const pathname = usePathname();

    const links = [
        { href: '/', label: 'Overview', icon: Home },
        { href: '/inventory', label: 'Inventory', icon: Package },
        { href: '/orders', label: 'Orders', icon: ShoppingCart },
        { href: '/pos', label: 'POS Terminal', icon: CreditCard },
        { href: '/workers', label: 'Workers', icon: Users },
        { href: '/reports', label: 'Reports', icon: BarChart3 },
    ];

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-muted/40 pb-4">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Truck className="h-6 w-6" />
                    <span className="">Warehouse AI</span>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                            >
                                <Button
                                    variant={isActive ? 'secondary' : 'ghost'}
                                    className={cn(
                                        'w-full justify-start gap-3 rounded-lg px-3 py-2 transition-all',
                                        isActive ? 'bg-muted text-primary' : 'text-muted-foreground hover:text-primary'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {link.label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="mt-auto p-4">
                <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                    <div className="flex flex-col gap-2">
                        <h3 className="font-semibold leading-none tracking-tight">System Status</h3>
                        <p className="text-sm text-muted-foreground">
                            Online & Scanned
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
