'use client';

import { Button } from "@/components/ui/button";

interface TutorialSuggestionProps {
    open: boolean;
    onAccept: () => void;
    onDecline: () => void;
}

export function TutorialSuggestion({ open, onAccept, onDecline }: TutorialSuggestionProps) {
    if (!open) return null;

    return (
        // z-index 2000 ensures it sits above mostly everything, including Joyride (usually 100/1000)
        // Using simple fixed positioning avoids library-specific portal/focus-trap conflicts
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
            <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-2xl">
                <div className="flex flex-col space-y-2 text-center sm:text-left">
                    <h2 className="text-xl font-semibold tracking-tight">Want to learn more?</h2>
                    <p className="text-muted-foreground text-sm">
                        You've completed the basics! Would you like a detailed tour of all the advanced features and modules?
                    </p>
                </div>

                <div className="mt-6 flex flex-col-reverse justify-end gap-2 sm:flex-row">
                    <Button
                        variant="outline"
                        onClick={onDecline}
                        className="w-full sm:w-auto"
                    >
                        No thanks
                    </Button>
                    <Button
                        onClick={onAccept}
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                    >
                        Show me
                    </Button>
                </div>
            </div>
        </div>
    );
}
