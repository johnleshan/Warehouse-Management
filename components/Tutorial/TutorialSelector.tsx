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
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-2 sm:p-0"
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl relative animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 max-h-[95vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 rounded-3xl blur-md opacity-50 pointer-events-none" />

                <div className="relative bg-card/95 backdrop-blur-xl border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden text-card-foreground max-h-full">

                    {/* Header Section */}
                    <div className="relative p-4 sm:p-8 pb-1 sm:pb-4 text-center shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 sm:right-4 sm:top-4 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            onClick={onClose}
                        >
                            <X className="h-5 w-5" />
                        </Button>

                        <div className="mx-auto w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-3 sm:mb-4 ring-4 ring-card">
                            <Sparkles className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                        </div>

                        <h2 className="text-xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Interactive Tutorials
                        </h2>
                        <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-base max-w-md mx-auto line-clamp-2">
                            Choose your learning path to master the Warehouse Management System.
                        </p>
                    </div>

                    {/* Options Grid - Scrollable area */}
                    <div className="p-3 sm:p-8 pt-2 sm:pt-0 grid gap-3 sm:gap-6 grid-cols-1 md:grid-cols-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
                        <style jsx global>{`
                            .scrollbar-hide::-webkit-scrollbar {
                                display: none;
                            }
                            .scrollbar-hide {
                                -ms-overflow-style: none;
                                scrollbar-width: none;
                            }
                        `}</style>


                        {/* Basic Option - Stunning Amber Gradient */}
                        <div
                            className="group relative cursor-pointer rounded-2xl border-2 border-amber-500/20 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 p-4 sm:p-6 transition-all duration-300 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/10 hover:scale-[1.02] active:scale-[0.98]"
                            onClick={() => onSelectMode('basic')}
                        >
                            <div className="flex flex-col h-full relative z-10">
                                <div className="mb-2 sm:mb-4 p-2 sm:p-3 w-fit rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                                    <Zap className="h-4 w-4 sm:h-6 sm:w-6" />
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 sm:mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Quick Overview</h3>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-2 sm:mb-4 group-hover:text-foreground/80 transition-colors line-clamp-3">
                                    Perfect for new users. Get up and running with the basics in less than 60 seconds.
                                </p>
                                <div className="mt-auto flex items-center text-[10px] sm:text-xs font-semibold text-amber-600 dark:text-amber-500 uppercase tracking-wide">
                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 mr-2 animate-pulse" />
                                    Beginner Friendly
                                </div>
                            </div>

                            {/* Decorative Background Blob */}
                            <div className="absolute -bottom-10 -right-10 w-20 h-20 sm:w-32 sm:h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors" />
                        </div>

                        {/* Advanced Option - Stunning Indigo Gradient */}
                        <div
                            className="group relative cursor-pointer rounded-2xl border-2 border-indigo-500/20 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 p-4 sm:p-6 transition-all duration-300 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98]"
                            onClick={() => onSelectMode('advanced')}
                        >
                            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 animate-in fade-in zoom-in duration-500 delay-100">
                                <span className="inline-flex items-center rounded-full bg-indigo-600 px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[10px] font-bold text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
                                    RECOMMENDED
                                </span>
                            </div>

                            <div className="flex flex-col h-full relative z-10">
                                <div className="mb-2 sm:mb-4 p-2 sm:p-3 w-fit rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                                    <GraduationCap className="h-4 w-4 sm:h-6 sm:w-6" />
                                </div>
                                <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 sm:mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Master Class</h3>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-2 sm:mb-4 group-hover:text-foreground/80 transition-colors line-clamp-3">
                                    Deep dive into advanced features: Inventory management, POS operations, and Analytics.
                                </p>
                                <div className="mt-auto flex items-center text-[10px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-indigo-500 mr-2" />
                                    Professional
                                </div>
                            </div>

                            {/* Decorative Background Blob */}
                            <div className="absolute -bottom-10 -right-10 w-20 h-20 sm:w-32 sm:h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors" />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
