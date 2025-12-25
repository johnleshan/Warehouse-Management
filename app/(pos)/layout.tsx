'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { storage } from '@/lib/storage';
import { User } from '@/lib/types';

export default function POSLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const pathname = usePathname();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        storage.init();

        const checkStatus = async () => {
            const user = storage.getCurrentUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Fetch latest status from server
            const latestUser = await storage.getUser(user.id);
            if (!latestUser || latestUser.status === 'INACTIVE') {
                storage.logout();
                router.push('/login');
                return;
            }

            setIsReady(true);
        };

        checkStatus();

        // Check status every 2 seconds
        const interval = setInterval(checkStatus, 2000);
        return () => clearInterval(interval);
    }, [pathname, router]);

    if (!isReady) {
        return <div className="flex h-screen items-center justify-center">Loading Terminal...</div>;
    }

    return (
        <div className="flex min-h-screen w-full bg-background flex-col">
            {children}
        </div>
    );
}
