'use client';

import { Button } from "@/components/ui/button";
import { X, Sparkles, Zap, GraduationCap } from "lucide-react";

interface TutorialSelectorProps {
    open: boolean;
    onClose: () => void;
    onSelectMode: (mode: 'basic' | 'advanced') => void;
}

export function TutorialSelector({ open, onClose, onSelectMode }: TutorialSelectorProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl p-1 relative mx-4 animate-in zoom-in-95 slide-in-from-bottom-5 duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 rounded-3xl blur-md opacity-50" />

                <div className="relative bg-card/95 backdrop-blur-xl border border-border rounded-3xl shadow-2xl overflow-hidden text-card-foreground">

                    {/* Header Section */}
                    <div className="relative p-8 pb-6 text-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-4 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            onClick={onClose}
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-4 ring-4 ring-card">
                            <Sparkles className="h-7 w-7 text-white" />
                        </div>

                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            Interactive Tutorials
                        </h2>
                        <p className="text-muted-foreground mt-2 text-base max-w-md mx-auto">
                            Choose your learning path to master the Warehouse Management System.
                        </p>
                    </div>

                    {/* Options Grid */}
                    <div className="p-8 pt-0 grid gap-6 grid-cols-1 md:grid-cols-2">

                        {/* Basic Option - Stunning Amber Gradient */}
                        <div
                            className="group relative cursor-pointer rounded-2xl border-2 border-amber-500/20 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 p-6 transition-all duration-300 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/10 hover:scale-[1.02] active:scale-[0.98]"
                            onClick={() => onSelectMode('basic')}
                        >
                            <div className="flex flex-col h-full relative z-10">
                                <div className="mb-4 p-3 w-fit rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                                    <Zap className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Quick Overview</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-4 group-hover:text-foreground/80 transition-colors">
                                    Perfect for new users. Get up and running with the basics in less than 60 seconds.
                                </p>
                                <div className="mt-auto flex items-center text-xs font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-wide">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse" />
                                    Beginner Friendly
                                </div>
                            </div>

                            {/* Decorative Background Blob */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors" />
                        </div>

                        {/* Advanced Option - Stunning Indigo Gradient */}
                        <div
                            className="group relative cursor-pointer rounded-2xl border-2 border-indigo-500/20 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 p-6 transition-all duration-300 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98]"
                            onClick={() => onSelectMode('advanced')}
                        >
                            <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-500 delay-100">
                                <span className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-bold text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
                                    RECOMMENDED
                                </span>
                            </div>

                            <div className="flex flex-col h-full relative z-10">
                                <div className="mb-4 p-3 w-fit rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Master Class</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-4 group-hover:text-foreground/80 transition-colors">
                                    Deep dive into advanced features: Inventory management, POS operations, and Analytics.
                                </p>
                                <div className="mt-auto flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2" />
                                    Professional
                                </div>
                            </div>

                            {/* Decorative Background Blob */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors" />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
