'use client';

import { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface InfiniteScrollProps {
    children: React.ReactNode;
    /** Called when the sentinel enters the viewport */
    onLoadMore: () => void;
    hasMore: boolean;
    isLoading: boolean;
    /** Distance from the bottom edge (in px) to trigger early loading */
    rootMargin?: string;
    className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function InfiniteScroll({
    children,
    onLoadMore,
    hasMore,
    isLoading,
    rootMargin = '200px',
    className,
}: InfiniteScrollProps) {
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Stable ref for the callback to avoid re-creating the observer
    const onLoadMoreRef = useRef(onLoadMore);
    onLoadMoreRef.current = onLoadMore;

    const handleIntersect = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !isLoading) {
                onLoadMoreRef.current();
            }
        },
        [hasMore, isLoading],
    );

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(handleIntersect, {
            root: null,
            rootMargin,
            threshold: 0,
        });

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
        };
    }, [handleIntersect, rootMargin]);

    return (
        <div className={className}>
            {children}

            {/* ── Sentinel element (triggers load when it scrolls into view) ──── */}
            <div ref={sentinelRef} className="w-full h-px" aria-hidden />

            {/* ── Loading indicator ──────────────────────────────────────────────── */}
            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="md" />
                </div>
            )}

            {/* ── End-of-list message ────────────────────────────────────────────── */}
            {!hasMore && !isLoading && (
                <p className="text-center text-xs text-white/20 py-6 select-none">
                    You&apos;ve reached the end
                </p>
            )}
        </div>
    );
}

export type { InfiniteScrollProps };
