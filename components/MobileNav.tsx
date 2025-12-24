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
    LayoutDashboard
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

export function MobileNav() {
    const pathname = usePathname();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[350px] pr-0">
                <SheetHeader className="px-7 text-left">
                    <SheetTitle className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <Truck className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl">WMS</span>
                    </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-8 px-2">
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
            </SheetContent>
        </Sheet>
    );
}
