'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { PromptGrid } from '@/components/prompt/PromptGrid';
import type { IPromptCard } from '@/types/prompt.types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

async function fetchSearchResults(
    query: string,
    params: Record<string, string>,
    page: number,
): Promise<{ data: IPromptCard[]; hasMore: boolean }> {
    const qs = new URLSearchParams({
        q: query,
        limit: String(PAGE_SIZE),
        page: String(page),
        sortBy: params.sortBy || 'newest',
        ...(params.category && { category: params.category }),
        ...(params.aiTool && { aiTool: params.aiTool }),
        ...(params.aspectRatio && { aspectRatio: params.aspectRatio }),
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

interface SearchResultsGalleryProps {
    /** Server-rendered first page of results */
    initialPrompts: IPromptCard[];
    /** The searchParams from the server at render time */
    initialSearchParams: Record<string, string>;
    /** The search query */
    query: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function SearchResultsGallery({
    initialPrompts,
    initialSearchParams,
    query,
}: SearchResultsGalleryProps) {
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
        const currentQuery = params.q || query;

        setIsLoading(true);
        setPage(1);

        fetchSearchResults(currentQuery, params, 1).then(({ data, hasMore }) => {
            setPrompts(data);
            setHasMore(hasMore);
            setIsLoading(false);
        });
    }, [searchParams, query]);

    // ── Load more (pagination) ────────────────────────────────────────────────
    const handleLoadMore = useCallback(async () => {
        if (isLoading) return;

        const nextPage = page + 1;
        const params = Object.fromEntries(searchParams.entries());
        const currentQuery = params.q || query;

        setIsLoading(true);

        const { data, hasMore: more } = await fetchSearchResults(currentQuery, params, nextPage);
        setPrompts((prev) => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(more);
        setIsLoading(false);
    }, [isLoading, page, searchParams, query]);

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
