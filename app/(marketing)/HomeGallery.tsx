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
    signal?: AbortSignal,
): Promise<{ data: IPromptCard[]; hasMore: boolean }> {
    const qs = new URLSearchParams({
        limit: String(PAGE_SIZE),
        page: String(page),
        sortBy: params.sortBy || 'newest',
        ...(params.category && { category: params.category }),
        ...(params.search && { search: params.search }),
    });

    const res = await fetch(`/api/prompts?${qs}`, { signal });
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

interface HomeGalleryProps {
    /** Server-rendered first page of results */
    initialPrompts: IPromptCard[];
    /** The searchParams from the server at render time */
    initialSearchParams: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function HomeGallery({
    initialPrompts,
    initialSearchParams,
}: HomeGalleryProps) {
    const searchParams = useSearchParams();

    // ── State ────────────────────────────────────────────────────────────────
    const [prompts, setPrompts] = useState<IPromptCard[]>(initialPrompts);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialPrompts.length === PAGE_SIZE);
    const [isLoading, setIsLoading] = useState(false);

    // Track previous filter string to detect changes
    const prevFiltersRef = useRef<string>(searchParams.toString());
    // AbortController to cancel stale fetches
    const abortRef = useRef<AbortController | null>(null);

    // ── Re-fetch when URL filters change ─────────────────────────────────────
    useEffect(() => {
        const currentFilters = searchParams.toString();

        // Skip if filters haven't changed
        if (currentFilters === prevFiltersRef.current) return;
        prevFiltersRef.current = currentFilters;

        // Abort any in-flight request from a previous category switch
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        // Immediately clear old prompts + show loading (no glitch)
        setPrompts([]);
        setPage(1);
        setHasMore(false);
        setIsLoading(true);

        const params = Object.fromEntries(searchParams.entries());

        fetchPrompts(params, 1, controller.signal)
            .then(({ data, hasMore }) => {
                if (controller.signal.aborted) return;
                setPrompts(data);
                setHasMore(hasMore);
                setIsLoading(false);
            })
            .catch((err) => {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                setIsLoading(false);
            });

        return () => controller.abort();
    }, [searchParams]);

    // ── Load more (pagination) ────────────────────────────────────────────────
    const handleLoadMore = useCallback(async () => {
        if (isLoading) return;

        const nextPage = page + 1;
        const params = Object.fromEntries(searchParams.entries());

        setIsLoading(true);

        try {
            const { data, hasMore: more } = await fetchPrompts(params, nextPage);
            setPrompts((prev) => [...prev, ...data]);
            setPage(nextPage);
            setHasMore(more);
        } catch {
            // silently fail
        } finally {
            setIsLoading(false);
        }
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
