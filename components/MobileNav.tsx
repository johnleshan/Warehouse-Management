'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle
} from '@/components/ui/sheet';
import {
    Menu,
    Package,
    Truck,
    CreditCard,
    BarChart3,
    ShieldCheck,
    Users,
    LayoutDashboard,
    LogOut
} from 'lucide-react';

const links = [
    { href: '/', label: 'Command Center', icon: LayoutDashboard },
    { href: '/inventory', label: 'Inventory Hub', icon: Package },
    { href: '/orders', label: 'Order Gateway', icon: Truck },
    { href: '/pos', label: 'Retail Terminal', icon: CreditCard },
    { href: '/reports', label: 'Market Analytics', icon: BarChart3 },
    { href: '/users', label: 'Identity Manager', icon: ShieldCheck },
    { href: '/workers', label: 'Staff Directory', icon: Users },
];

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
// ... rest of imports

export function MobileNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setUser(storage.getCurrentUser());
        }
    }, []);

    const handleLogout = () => {
        storage.logout();
        router.push('/login');
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[350px] pr-0 flex flex-col h-full">
                <SheetHeader className="px-7 text-left">
                    <SheetTitle className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <Truck className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl">WMS</span>
                    </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-8 px-2 flex-1 overflow-y-auto">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                            >
                                <div className={cn(
                                    "flex items-center gap-3 px-5 py-4 rounded-xl transition-all font-semibold",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}>
                                    <Icon className="h-5 w-5" />
                                    <span>{link.label}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
                <div className="mt-auto px-4 pb-6">
                    <div className="bg-accent/40 rounded-2xl border border-border shadow-sm p-4">
                        <div className="flex items-center mb-4 text-left gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-950/50 shrink-0">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-foreground truncate">{user?.name || 'Administrator'}</span>
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{user?.role || 'Admin'}</span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="w-full gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all h-10 border border-transparent hover:border-destructive/20 justify-start"
                        >
                            <LogOut className="h-4 w-4 shrink-0" />
                            <span className="text-xs font-bold">End Session</span>
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
