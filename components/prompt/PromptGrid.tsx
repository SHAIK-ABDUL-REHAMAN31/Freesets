'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { IPromptCard } from '@/types/prompt.types';
import { Skeleton } from '@/components/ui/skeleton';
import { PromptCard } from './PromptCard';

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

function SearchOffIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('size-6', className)}
        >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
    );
}

function SpinnerIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('size-4 animate-spin', className)}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton card — matches the masonry layout
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonCard({ heightClass = "h-[300px]" }: { heightClass?: string }) {
    return (
        <div
            className={cn(
                'rounded-2xl overflow-hidden relative break-inside-avoid w-full mb-6',
                'bg-zinc-800/50 border border-zinc-800',
                heightClass
            )}
        >
            {/* Image placeholder */}
            <Skeleton className="absolute inset-0 w-full h-full rounded-none opacity-20" />

            {/* Body */}
            <div className="relative z-10 flex flex-col h-full p-5 justify-end space-y-3">
                <Skeleton className="h-6 w-3/4 rounded-md opacity-20" />
                <div className="space-y-2 pb-2">
                    <Skeleton className="h-4 w-full rounded opacity-20" />
                    <Skeleton className="h-4 w-2/3 rounded opacity-20" />
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface PromptGridProps {
    prompts: IPromptCard[];
    isLoading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function PromptGrid({
    prompts,
    isLoading,
    hasMore,
    onLoadMore,
}: PromptGridProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // ── Loading state (fresh load / category switch) ────────────────────────────
    if (prompts.length === 0 && isLoading) {
        return (
            <div id="prompt-grid-loading" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={`skeleton-${i}`} />
                ))}
            </div>
        );
    }

    // ── Empty state ─────────────────────────────────────────────────────────────
    if (prompts.length === 0 && !isLoading) {
        return (
            <div
                id="prompt-grid-empty"
                className="flex flex-col items-center justify-center py-24 px-6 text-center"
            >
                <div
                    className={cn(
                        'flex items-center justify-center',
                        'size-20 rounded-full mb-6',
                        'bg-surface-card border border-surface-border',
                        'shadow-lg shadow-black/20',
                    )}
                >
                    <SearchOffIcon className="size-8 text-foreground/30" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground/80 mb-2">
                    No prompts found
                </h3>
                <p className="text-sm text-foreground/40 max-w-xs leading-relaxed">
                    Try a different filter or search term to discover amazing AI prompts.
                </p>
            </div>
        );
    }

    return (
        <div id="prompt-grid-container">
            {/* ── Card grid ────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                {/* Prompt cards */}
                {prompts.map((prompt) => (
                    <PromptCard key={prompt.id} prompt={prompt} />
                ))}
            </div>

            {/* ── Load more button ─────────────────────────────────────────────────── */}
            {hasMore && !isLoading && mounted && (
                <div className="flex justify-center pt-8 pb-4">
                    <button
                        id="load-more-btn"
                        onClick={onLoadMore}
                        className={cn(
                            'inline-flex items-center justify-center gap-2.5',
                            'h-11 px-8 rounded-full',
                            'text-sm font-semibold tracking-wide',
                            'bg-white text-black',
                            'border border-white/10',
                            'hover:bg-zinc-100',
                            'hover:shadow-lg hover:shadow-white/10',
                            'hover:-translate-y-0.5',
                            'active:scale-[0.98]',
                            'transition-all duration-200 ease-out',
                        )}
                    >
                        Load More
                    </button>
                </div>
            )}

            {/* ── Loading spinner for pagination ────────────────────────────────────── */}
            {isLoading && prompts.length > 0 && (
                <div className="flex justify-center pt-6 pb-4">
                    <div className="inline-flex items-center gap-2.5 text-sm text-foreground/50">
                        <SpinnerIcon className="size-4" />
                        <span>Loading more prompts…</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// Maintain backwards compatibility for exports
export type { PromptGridProps as PTGridProps };
