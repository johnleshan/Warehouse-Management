export default function POSLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen w-full bg-background flex-col">
            {children}
        </div>
    );
}
