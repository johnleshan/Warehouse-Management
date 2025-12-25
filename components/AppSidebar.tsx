'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { storage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Package, Home, ShoppingCart, Users, BarChart3, ShieldCheck, Truck, CreditCard, LogOut, LayoutDashboard, ChevronLeft, ChevronRight } from 'lucide-react';

export function AppSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        setUser(storage.getCurrentUser());
    }, []);

    const handleLogout = () => {
        storage.logout();
        router.push('/login');
    };

    const links = [
        { href: '/', label: 'Command Center', icon: LayoutDashboard },
        { href: '/inventory', label: 'Inventory Hub', icon: Package },
        { href: '/orders', label: 'Order Gateway', icon: Truck },
        { href: '/pos', label: 'Retail Terminal', icon: CreditCard },
        { href: '/reports', label: 'Market Analytics', icon: BarChart3 },
        { href: '/users', label: 'Identity Manager', icon: ShieldCheck },
        { href: '/workers', label: 'Staff Directory', icon: Users },
    ];

    return (
        <div className={cn(
            "flex h-screen flex-col border-r bg-card text-muted-foreground pb-6 shadow-2xl transition-all duration-300 relative",
            isCollapsed ? "w-20" : "w-72"
        )}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />

            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent shadow-xl"
            >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>

            <div className={cn("flex h-20 items-center", isCollapsed ? "justify-center" : "px-8")}>
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                        <Truck className="h-6 w-6 text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col gap-0 leading-none">
                            <span className="text-foreground font-black text-xl tracking-tighter">WMS</span>
                            <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">Intelligence</span>
                        </div>
                    )}
                </Link>
            </div>

            <div className="flex-1 overflow-auto py-6 px-4">
                <nav className="space-y-1.5 font-semibold">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.label}
                                href={link.href}
                            >
                                <div className={cn(
                                    'group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer mb-1',
                                    isActive
                                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(37,99,235,0.05)]'
                                        : 'hover:bg-accent hover:text-foreground',
                                    isCollapsed && "justify-center px-0"
                                )}>
                                    <Icon className={cn(
                                        'h-5 w-5 transition-transform duration-300 group-hover:scale-110 shrink-0',
                                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                                    )} />
                                    {!isCollapsed && <span className="text-[13px] tracking-tight">{link.label}</span>}
                                    {!isCollapsed && isActive && <div className="ml-auto w-1 h-4 bg-primary rounded-full" />}
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto px-4 pb-2">
                <div className={cn("bg-accent/40 rounded-2xl border border-border shadow-sm", isCollapsed ? "p-2" : "p-4")}>
                    <div className={cn("flex items-center mb-4 text-left", isCollapsed ? "justify-center" : "gap-3")}>
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-950/50 shrink-0">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-foreground truncate">{user?.name || 'Administrator'}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{user?.role || 'Admin'}</span>
                            </div>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className={cn(
                            "w-full gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all h-10 border border-transparent hover:border-destructive/20",
                            isCollapsed ? "justify-center px-0" : "justify-start"
                        )}
                    >
                        <LogOut className="h-4 w-4 shrink-0" />
                        {!isCollapsed && <span className="text-[13px] font-bold">End Session</span>}
                    </Button>
                </div>
            </div>
        </div>
    );
}
