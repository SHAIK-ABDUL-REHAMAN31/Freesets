'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import type { IPromptCard } from '@/types/prompt.types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface UseSearchReturn {
    results: IPromptCard[];
    isLoading: boolean;
    total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useSearch(query: string, limit = 20): UseSearchReturn {
    const [results, setResults] = useState<IPromptCard[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const debouncedQuery = useDebounce(query.trim(), 300);

    useEffect(() => {
        // Don't search for very short queries (API enforces 2-char minimum)
        if (debouncedQuery.length < 2) {
            setResults([]);
            setTotal(0);
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        const fetchResults = async () => {
            setIsLoading(true);

            try {
                const params = new URLSearchParams({
                    q: debouncedQuery,
                    limit: String(limit),
                });

                const res = await fetch(`/api/search?${params.toString()}`);

                if (!res.ok || cancelled) return;

                const json = await res.json();

                if (cancelled) return;

                setResults(json.data ?? []);
                setTotal(json.pagination?.total ?? 0);
            } catch {
                if (!cancelled) {
                    setResults([]);
                    setTotal(0);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        fetchResults();

        return () => {
            cancelled = true;
        };
    }, [debouncedQuery, limit]);

    return {
        results,
        isLoading,
        total,
    };
}

export type { UseSearchReturn };
