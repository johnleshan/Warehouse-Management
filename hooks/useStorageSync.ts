'use client';

import { useEffect, useRef } from 'react';

const SYNC_CHANNEL = 'wms_sync';

export function useStorageSync(onSync: () => void) {
    const callbackRef = useRef(onSync);

    // Always keep the latest callback ref
    useEffect(() => {
        callbackRef.current = onSync;
    }, [onSync]);

    useEffect(() => {
        const channel = new BroadcastChannel(SYNC_CHANNEL);

        const handleSync = () => {
            console.log('[useStorageSync] Sync event detected');
            callbackRef.current();
        };

        const handleMessage = (event: MessageEvent) => {
            if (event.data === 'update') {
                console.log('[useStorageSync] Received BroadcastChannel update');
                handleSync();
            }
        };

        channel.addEventListener('message', handleMessage);
        window.addEventListener('storage', handleSync);
        window.addEventListener('storage-update', handleSync);

        return () => {
            channel.removeEventListener('message', handleMessage);
            window.removeEventListener('storage', handleSync);
            window.removeEventListener('storage-update', handleSync);
            channel.close();
        };
    }, []); // Empty dependency array ensures channel is only created once
}
