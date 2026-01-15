'use client';

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface TutorialSuggestionProps {
    open: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

export function TutorialSuggestion({ open, onAccept, onDecline }: TutorialSuggestionProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md p-1 relative mx-4 animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-sm" />

                <div className="relative bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-6 overflow-hidden text-card-foreground">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-xl font-bold tracking-tight text-foreground">Continue Learning?</h2>
                            <p className="text-muted-foreground text-sm">
                                You've completed the basics! Would you like a detailed tour of all the advanced features and modules?
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col-reverse justify-end gap-3 sm:flex-row">
                        <Button
                            variant="ghost"
                            onClick={onDecline}
                            className="w-full sm:w-auto text-muted-foreground hover:text-foreground"
                        >
                            No thanks
                        </Button>
                        <Button
                            onClick={onAccept}
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 border-0"
                        >
                            Start Advanced Tour
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
