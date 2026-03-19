import { create } from 'zustand';
import type { PromptFilters, Category, AITool, AspectRatio, IPromptCard } from '@/types/prompt.types';

// ─────────────────────────────────────────────────────────────────────────────
// Prompt Cache — stores results per category to avoid redundant API calls
// ─────────────────────────────────────────────────────────────────────────────

interface PromptCacheEntry {
    prompts: IPromptCard[];
    fetchedAt: number; // timestamp
    total: number;
}

interface PromptCache {
    [category: string]: PromptCacheEntry;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ─────────────────────────────────────────────────────────────────────────────
// Filter Store — manages the active prompt filters + category cache
// ─────────────────────────────────────────────────────────────────────────────

interface FilterState {
    filters: PromptFilters;

    /** Set a single filter key. Pass `undefined` to clear it. */
    setFilter: <K extends keyof PromptFilters>(key: K, value: PromptFilters[K]) => void;

    /** Reset all filters to defaults */
    clearFilters: () => void;

    /** Number of filters that are actively set (non-default) */
    activeFilterCount: () => number;

    // ── Category Cache ──────────────────────────────────────────────────
    promptCache: PromptCache;

    /** Store prompts for a category in cache */
    setCacheForCategory: (category: string, prompts: IPromptCard[], total: number) => void;

    /** Get cached prompts for a category (returns null if expired or missing) */
    getCacheForCategory: (category: string) => PromptCacheEntry | null;
}

const DEFAULT_FILTERS: PromptFilters = {
    category: undefined,
    aiTools: undefined,
    aspectRatio: undefined,
    isPremium: undefined,
    isFreeDownload: undefined,
    sortBy: undefined,
};

export const useFilterStore = create<FilterState>((set, get) => ({
    filters: { ...DEFAULT_FILTERS },

    setFilter: (key, value) =>
        set((s) => ({
            filters: {
                ...s.filters,
                [key]: value,
            },
        })),

    clearFilters: () =>
        set({ filters: { ...DEFAULT_FILTERS } }),

    activeFilterCount: () => {
        const { filters } = get();
        let count = 0;

        if (filters.category) count++;
        if (filters.aiTools && filters.aiTools.length > 0) count++;
        if (filters.aspectRatio) count++;
        if (filters.isPremium !== undefined) count++;
        if (filters.isFreeDownload !== undefined) count++;
        if (filters.sortBy) count++;

        return count;
    },

    // ── Category Cache ──────────────────────────────────────────────────
    promptCache: {},

    setCacheForCategory: (category, prompts, total) =>
        set((s) => ({
            promptCache: {
                ...s.promptCache,
                [category]: {
                    prompts,
                    fetchedAt: Date.now(),
                    total,
                },
            },
        })),

    getCacheForCategory: (category) => {
        const entry = get().promptCache[category];
        if (!entry) return null;

        // Expired — treat as cache miss
        if (Date.now() - entry.fetchedAt > CACHE_DURATION) return null;

        return entry;
    },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build URLSearchParams from current filters
// ─────────────────────────────────────────────────────────────────────────────

export function filtersToSearchParams(filters: PromptFilters): URLSearchParams {
    const params = new URLSearchParams();

    if (filters.category) params.set('category', filters.category);
    if (filters.aiTools && filters.aiTools.length > 0) {
        filters.aiTools.forEach((t) => params.append('aiTools', t));
    }
    if (filters.aspectRatio) params.set('aspectRatio', filters.aspectRatio);
    if (filters.isPremium !== undefined) params.set('isPremium', String(filters.isPremium));
    if (filters.isFreeDownload !== undefined) params.set('isFreeDownload', String(filters.isFreeDownload));
    if (filters.sortBy) params.set('sortBy', filters.sortBy);

    return params;
}

// Re-export filter-related types for convenience
export type { PromptFilters, Category, AITool, AspectRatio };
