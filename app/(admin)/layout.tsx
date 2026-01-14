'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { storage } from '@/lib/storage';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileNav } from '@/components/MobileNav';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from 'sonner';
import { Tutorial } from '@/components/Tutorial/Tutorial';
import { TutorialSuggestion } from '@/components/Tutorial/TutorialSuggestion';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const pathname = usePathname();
    const [isReady, setIsReady] = useState(false);
    const [runTutorial, setRunTutorial] = useState(false);
    const [tutorialMode, setTutorialMode] = useState<'basic' | 'advanced'>('basic');
    const [showSuggestion, setShowSuggestion] = useState(false);

    useEffect(() => {
        // Check for first-time user
        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
        if (!hasSeenTutorial) {
            // Small delay to ensure UI is ready
            setTimeout(() => {
                setTutorialMode('basic');
                setRunTutorial(true);
            }, 1000);
        }
    }, []);

    const handleTutorialChange = (isRunning: boolean) => {
        setRunTutorial(isRunning);
        if (!isRunning) {
            if (tutorialMode === 'basic') {
                localStorage.setItem('hasSeenTutorial', 'true');
                setShowSuggestion(true);
            }
        }
    };

    const handleSuggestionAccept = () => {
        setShowSuggestion(false);
        // Add a small delay to allow the dialog to close before starting the tour
        // This prevents scroll/focus locking issues
        setTimeout(() => {
            setTutorialMode('advanced');
            setRunTutorial(true);
        }, 500);
    };

    const handleSuggestionDecline = () => {
        setShowSuggestion(false);
    };


    useEffect(() => {
        storage.init();

        const checkStatus = async () => {
            const user = storage.getCurrentUser();
            if (!user) {
                router.push('/login');
                return;
            }

            if (user.role !== 'ADMIN') {
                router.push('/pos');
                return;
            }

            // Fetch latest status from server
            const latestUser = await storage.getUser(user.id);
            if (!latestUser || latestUser.status === 'INACTIVE') {
                storage.logout();
                toast.error('Your account has been deactivated. Logging out...');
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

    if (!isReady) return null;

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <AppSidebar />
            </div>

            <div className="flex flex-col flex-1 pl-0 sm:gap-4 sm:py-4 bg-background overflow-y-auto h-screen">
                <header className="flex h-14 items-center justify-between px-4 sm:px-6 md:justify-end border-b md:border-none">
                    <MobileNav />
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setTutorialMode('basic');
                                setRunTutorial(true);
                            }}
                            className="rounded-xl border border-border bg-transparent hover:bg-accent transition-all"
                            title="Start Tutorial"
                        >
                            <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
                            <span className="sr-only">Help / Tutorial</span>
                        </Button>
                        <ThemeToggle />
                    </div>
                </header>
                <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {children}
                    <Tutorial run={runTutorial} setRun={handleTutorialChange} mode={tutorialMode} />
                    <TutorialSuggestion
                        open={showSuggestion}
                        onAccept={handleSuggestionAccept}
                        onDecline={handleSuggestionDecline}
                    />
                </main>
            </div>
        </div>
    );
}
