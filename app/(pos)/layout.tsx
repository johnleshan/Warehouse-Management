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
        const user = storage.getCurrentUser();

        if (!user) {
            router.push('/login');
        } else {
            setIsReady(true);
        }
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
