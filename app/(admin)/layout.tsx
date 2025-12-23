import { AppSidebar } from '@/components/AppSidebar';

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
            <AppSidebar />
            <div className="flex flex-col flex-1 pl-0 md:pl-0 sm:gap-4 sm:py-4 bg-background overflow-y-auto h-screen">
                <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
