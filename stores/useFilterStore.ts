import { create } from 'zustand';
import type { PromptFilters, Category, AITool, AspectRatio } from '@/types/prompt.types';

// ─────────────────────────────────────────────────────────────────────────────
// Filter Store — manages the active prompt filters
// ─────────────────────────────────────────────────────────────────────────────

interface FilterState {
    filters: PromptFilters;

    /** Set a single filter key. Pass `undefined` to clear it. */
    setFilter: <K extends keyof PromptFilters>(key: K, value: PromptFilters[K]) => void;

    /** Reset all filters to defaults */
    clearFilters: () => void;

    /** Number of filters that are actively set (non-default) */
    activeFilterCount: () => number;
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
