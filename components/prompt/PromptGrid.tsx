'use client';

import { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
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
// Masonry breakpoints — Pinterest-style column config
// ─────────────────────────────────────────────────────────────────────────────

const breakpointColumns = {
    default: 4,   // 4 columns on very large screens
    1536: 4,      // 4 columns on 2xl
    1280: 4,      // 4 columns on xl
    1024: 3,      // 3 columns on lg
    768: 2,       // 2 columns on md
    640: 2,       // 2 columns on sm
    480: 1,       // 1 column on mobile
};

// ─────────────────────────────────────────────────────────────────────────────
// Pinterest-style skeleton heights (variable to simulate masonry feel)
// ─────────────────────────────────────────────────────────────────────────────

const skeletonHeights = [
    280, 380, 220, 420, 300,
    350, 260, 450, 240, 320,
    400, 280, 360, 200, 440,
    310, 370, 250, 290, 410,
];

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton card — variable heights like Pinterest loading state
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonCard({ height }: { height: number }) {
    return (
        <div
            className="rounded-xl overflow-hidden bg-zinc-800/50 border border-zinc-800"
            style={{ height: `${height}px` }}
        >
            <Skeleton className="w-full h-full rounded-none opacity-20" />
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

    // ── Loading state (fresh load / category switch) ────────────────────────
    if (prompts.length === 0 && isLoading) {
        return (
            <Masonry
                breakpointCols={breakpointColumns}
                className="masonry-grid"
                columnClassName="masonry-grid-column"
            >
                {skeletonHeights.map((h, i) => (
                    <SkeletonCard key={`skeleton-${i}`} height={h} />
                ))}
            </Masonry>
        );
    }

    // ── Empty state ─────────────────────────────────────────────────────────
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
            {/* ── Masonry card grid ───────────────────────────────────────────── */}
            <Masonry
                breakpointCols={breakpointColumns}
                className="masonry-grid"
                columnClassName="masonry-grid-column"
            >
                {prompts.map((prompt) => (
                    <PromptCard key={prompt.id} prompt={prompt} />
                ))}
            </Masonry>

            {/* ── Load more button ─────────────────────────────────────────────── */}
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

            {/* ── Loading spinner for pagination ───────────────────────────────── */}
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
