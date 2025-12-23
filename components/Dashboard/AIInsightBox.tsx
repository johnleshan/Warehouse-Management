import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function AIInsightBox({ tip }: { tip: string }) {
    return (
        <Card className="premium-card border-none bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="h-24 w-24 text-primary" />
            </div>
            <CardContent className="p-6 flex items-start gap-4 h-full relative z-10">
                <div className="mt-1 p-2.5 bg-primary/15 rounded-xl text-primary shadow-sm shadow-primary/20">
                    <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-bold text-lg tracking-tight text-primary/90">Intelligent Assistant</h3>
                    <p className="text-muted-foreground font-medium leading-relaxed">
                        {tip}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
