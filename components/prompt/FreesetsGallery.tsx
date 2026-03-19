'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { PromptGrid } from '@/components/prompt/PromptGrid';
import { useFilterStore } from '@/stores/useFilterStore';
import { CATEGORIES } from '@/config/categories';
import type { IPromptCard } from '@/types/prompt.types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

async function fetchPrompts(
    params: Record<string, string>,
    page: number,
    signal?: AbortSignal,
): Promise<{ data: IPromptCard[]; hasMore: boolean; total: number }> {
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

    const res = await fetch(`/api/prompts?${qs}`, { signal });
    if (!res.ok) return { data: [], hasMore: false, total: 0 };

    const json = await res.json();
    const data: IPromptCard[] = json.data || [];
    return {
        data,
        hasMore: data.length === PAGE_SIZE,
        total: json.pagination?.total ?? data.length,
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

    // ── Zustand cache ───────────────────────────────────────────────────────
    const setCacheForCategory = useFilterStore((s) => s.setCacheForCategory);
    const getCacheForCategory = useFilterStore((s) => s.getCacheForCategory);

    // ── State ────────────────────────────────────────────────────────────────
    const [prompts, setPrompts] = useState<IPromptCard[]>(initialPrompts);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(initialPrompts.length === PAGE_SIZE);
    const [isLoading, setIsLoading] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Track previous filter string to detect changes
    const prevFiltersRef = useRef<string>(searchParams.toString());
    // Prevent double-fetch on initial mount
    const isMountedRef = useRef(false);
    // AbortController to cancel stale fetches
    const abortRef = useRef<AbortController | null>(null);

    // ── Prefetch adjacent categories ─────────────────────────────────────────
    const prefetchCategories = useCallback(async (currentCategory: string) => {
        const categories = CATEGORIES.map((c) => c.value) as string[];
        const currentIndex = categories.indexOf(currentCategory);

        // Prefetch next 2 categories silently
        const toPrefetch = [
            categories[currentIndex + 1],
            categories[currentIndex + 2],
        ].filter(Boolean);

        for (const category of toPrefetch) {
            if (!getCacheForCategory(category)) {
                try {
                    const { data, total } = await fetchPrompts({ category, sortBy: 'newest' }, 1);
                    setCacheForCategory(category, data, total);
                } catch {
                    // silently fail — prefetch is best-effort
                }
            }
        }
    }, [getCacheForCategory, setCacheForCategory]);

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

        // Abort any in-flight request from a previous category switch
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        // Filters changed — reset and reload from page 1
        const params = Object.fromEntries(searchParams.entries());
        const category = params.category || '';

        // Check cache first — instant if available
        const cached = getCacheForCategory(category);
        if (cached) {
            setPrompts(cached.prompts);
            setHasMore(cached.prompts.length === PAGE_SIZE);
            setPage(1);
            // Prefetch adjacent categories after cache hit
            if (category) prefetchCategories(category);
            return;
        }

        // Not cached — optimistic UI: show skeletons immediately
        setIsTransitioning(true);
        setPrompts([]);
        setPage(1);
        setHasMore(false);
        setIsLoading(true);

        fetchPrompts(params, 1, controller.signal)
            .then(({ data, hasMore, total }) => {
                if (controller.signal.aborted) return;
                setPrompts(data);
                setHasMore(hasMore);
                setIsLoading(false);
                setIsTransitioning(false);

                // Store in cache for next time
                if (category) {
                    setCacheForCategory(category, data, total);
                    // Prefetch adjacent categories after load
                    prefetchCategories(category);
                }
            })
            .catch((err) => {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                setIsLoading(false);
                setIsTransitioning(false);
            });

        return () => controller.abort();
    }, [searchParams, getCacheForCategory, setCacheForCategory, prefetchCategories]);

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
            isTransitioning={isTransitioning}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
        />
    );
}
