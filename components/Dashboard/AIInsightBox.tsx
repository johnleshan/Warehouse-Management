import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export function AIInsightBox({ tip }: { tip: string }) {
    return (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 dark:from-blue-950 dark:to-indigo-950 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2 gap-2">
                <div className="p-2 bg-yellow-100 rounded-full dark:bg-yellow-900">
                    <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    AI Daily Insight
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-normal font-medium text-blue-800 dark:text-blue-200">
                    {tip}
                </p>
            </CardContent>
        </Card>
    );
}
