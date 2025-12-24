import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Sparkles } from "lucide-react";

export function AIInsightBox({ tip, isUrgent }: { tip: string; isUrgent?: boolean }) {
    return (
        <Card className={`premium-card border-none relative overflow-hidden group transition-all duration-500 ${isUrgent
            ? "bg-gradient-to-br from-red-500/15 via-orange-500/5 to-transparent border-red-500/20"
            : "bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent"
            }`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {isUrgent ? (
                    <AlertCircle className="h-24 w-24 text-red-500" />
                ) : (
                    <Sparkles className="h-24 w-24 text-primary" />
                )}
            </div>
            <CardContent className="p-6 flex items-start gap-4 h-full relative z-10">
                <div className={`mt-1 p-2.5 rounded-xl shadow-sm transition-colors duration-500 ${isUrgent
                    ? "bg-red-500/20 text-red-600 shadow-red-500/20"
                    : "bg-primary/15 text-primary shadow-primary/20"
                    }`}>
                    {isUrgent ? <AlertCircle className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                </div>
                <div className="space-y-1">
                    <h3 className={`font-bold text-lg tracking-tight transition-colors duration-500 ${isUrgent ? "text-red-600" : "text-primary/90"
                        }`}>
                        {isUrgent ? "CRITICAL ALERT" : "Intelligent Assistant"}
                    </h3>
                    <p className={`font-medium leading-relaxed transition-colors duration-500 ${isUrgent ? "text-red-700/80" : "text-muted-foreground"
                        }`}>
                        {tip}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
