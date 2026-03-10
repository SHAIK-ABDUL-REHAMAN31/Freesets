'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { IPromptCard, PromptFilters } from '@/types/prompt.types';
import { filtersToSearchParams } from '@/stores/useFilterStore';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface UsePromptsOptions {
    filters: PromptFilters;
    initialPage?: number;
    limit?: number;
}

interface UsePromptsReturn {
    prompts: IPromptCard[];
    isLoading: boolean;
    hasMore: boolean;
    loadMore: () => void;
    total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function usePrompts({
    filters,
    initialPage = 1,
    limit = 20,
}: UsePromptsOptions): UsePromptsReturn {
    const [prompts, setPrompts] = useState<IPromptCard[]>([]);
    const [page, setPage] = useState(initialPage);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Track whether this is the first page load (replace) vs loadMore (append)
    const isFirstPage = useRef(true);

    // ── Fetch a page of prompts ───────────────────────────────────────────────
    const fetchPage = useCallback(
        async (pageNum: number, replace: boolean) => {
            setIsLoading(true);

            try {
                const params = filtersToSearchParams(filters);
                params.set('page', String(pageNum));
                params.set('limit', String(limit));

                const res = await fetch(`/api/prompts?${params.toString()}`);

                if (!res.ok) {
                    setIsLoading(false);
                    return;
                }

                const json = await res.json();
                const data: IPromptCard[] = json.data ?? [];
                const pagination = json.pagination;

                if (replace) {
                    setPrompts(data);
                } else {
                    setPrompts((prev) => [...prev, ...data]);
                }

                setTotal(pagination?.total ?? 0);
                setHasMore(pagination?.hasNext ?? false);
            } catch (err) {
                console.error('usePrompts fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        },
        [filters, limit],
    );

    // ── Reset when filters change ─────────────────────────────────────────────
    useEffect(() => {
        isFirstPage.current = true;
        setPage(initialPage);
        setPrompts([]);
        fetchPage(initialPage, true);
    }, [filters, initialPage, fetchPage]);

    // ── Load more ─────────────────────────────────────────────────────────────
    const loadMore = useCallback(() => {
        if (isLoading || !hasMore) return;

        const nextPage = page + 1;
        setPage(nextPage);
        isFirstPage.current = false;
        fetchPage(nextPage, false);
    }, [isLoading, hasMore, page, fetchPage]);

    return {
        prompts,
        isLoading,
        hasMore,
        loadMore,
        total,
    };
}

export type { UsePromptsOptions, UsePromptsReturn };
