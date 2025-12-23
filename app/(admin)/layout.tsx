'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { storage } from '@/lib/storage';
import { AppSidebar } from '@/components/AppSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const pathname = usePathname();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        storage.init();
        const user = storage.getCurrentUser();

        if (!user) {
            router.push('/login');
        } else if (user && user.role !== 'ADMIN') {
            router.push('/pos');
        } else {
            setIsReady(true);
        }
    }, [pathname, router]);

    if (!isReady) return null;

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
            <AppSidebar />
            <div className="flex flex-col flex-1 pl-0 md:pl-0 sm:gap-4 sm:py-4 bg-background overflow-y-auto h-screen">
                <header className="flex h-14 items-center justify-end px-4 sm:px-6">
                    <ThemeToggle />
                </header>
                <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
