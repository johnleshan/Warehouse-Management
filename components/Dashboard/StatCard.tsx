import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: string;
    trendUp?: boolean;
    className?: string;
}

export function StatCard({ title, value, icon: Icon, description, trend, trendUp, className }: StatCardProps) {
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
                    {title}
                </CardTitle>
                <div className="rounded-md bg-background/50 p-1.5 shadow-sm">
                    <Icon className="h-4 w-4 text-foreground/70" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-extrabold tracking-tight">{value}</div>
                {(description || trend) && (
                    <div className="mt-1 flex items-center gap-2">
                        {trend && (
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                                trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            )}>
                                {trend}
                            </span>
                        )}
                        <p className="text-[11px] text-muted-foreground font-medium">
                            {description}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
