'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { PromptGrid } from '@/components/prompt/PromptGrid';
import type { IPromptCard } from '@/types/prompt.types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

async function fetchPrompts(
    params: Record<string, string>,
    page: number,
): Promise<{ data: IPromptCard[]; hasMore: boolean }> {
    const qs = new URLSearchParams({
        limit: String(PAGE_SIZE),
        page: String(page),
        sortBy: params.sortBy || 'newest',
        ...(params.category && { category: params.category }),
        ...(params.aiTool && { aiTool: params.aiTool }),
        ...(params.aspectRatio && { aspectRatio: params.aspectRatio }),
        ...(params.q && { q: params.q }),
        ...(params.contentType && params.contentType !== 'all' && {
            isPremium: String(params.contentType === 'premium'),
        }),
    });

    const res = await fetch(`/api/prompts?${qs}`);
    if (!res.ok) return { data: [], hasMore: false };

    const json = await res.json();
    const data: IPromptCard[] = json.data || [];
    return {
        data,
        hasMore: data.length === PAGE_SIZE,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface FreesetsGalleryProps {
    /** Server-rendered first page of results */
    initialPrompts: IPromptCard[];
    /** The searchParams from the server at render time (used to detect filter changes) */
    initialSearchParams: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function FreesetsGallery({
    initialPrompts,
    initialSearchParams,
}: FreesetsGalleryProps) {
    const searchParams = useSearchParams();

    // ── State ────────────────────────────────────────────────────────────────
    const [prompts, setPrompts] = useState<IPromptCard[]>(initialPrompts);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialPrompts.length === PAGE_SIZE);
    const [isLoading, setIsLoading] = useState(false);

    // Track previous filter string to detect changes
    const prevFiltersRef = useRef<string>(searchParams.toString());
    // Prevent double-fetch on initial mount
    const isMountedRef = useRef(false);

    // ── Re-fetch when URL filters change ─────────────────────────────────────
    useEffect(() => {
        const currentFilters = searchParams.toString();

        if (!isMountedRef.current) {
            isMountedRef.current = true;
            prevFiltersRef.current = currentFilters;
            return;
        }

        if (currentFilters === prevFiltersRef.current) return;
        prevFiltersRef.current = currentFilters;

        // Filters changed — reset and reload from page 1
        const params = Object.fromEntries(searchParams.entries());

        setIsLoading(true);
        setPage(1);

        fetchPrompts(params, 1).then(({ data, hasMore }) => {
            setPrompts(data);
            setHasMore(hasMore);
            setIsLoading(false);
        });
    }, [searchParams]);

    // ── Load more (pagination) ────────────────────────────────────────────────
    const handleLoadMore = useCallback(async () => {
        if (isLoading) return;

        const nextPage = page + 1;
        const params = Object.fromEntries(searchParams.entries());

        setIsLoading(true);

        const { data, hasMore: more } = await fetchPrompts(params, nextPage);
        setPrompts((prev) => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(more);
        setIsLoading(false);
    }, [isLoading, page, searchParams]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <PromptGrid
            prompts={prompts}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
        />
    );
}
