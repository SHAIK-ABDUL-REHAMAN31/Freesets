import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchFilters } from '@/components/search/SearchFilters';
import { EmptyState } from '@/components/common/EmptyState';
import type { IPromptCard } from '@/types/prompt.types';
import { SearchResultsGallery } from './SearchResultsGallery';

// ─────────────────────────────────────────────────────────────────────────────
// Data Fetching
// ─────────────────────────────────────────────────────────────────────────────

import { getPrompts } from '@/server/services/prompt.service';

async function searchPrompts(
    query: string,
    searchParams: Record<string, string>,
): Promise<{ data: IPromptCard[]; total: number }> {
    try {
        const filters: any = {
            search: query,
            sortBy: searchParams.sortBy || 'newest',
        };

        if (searchParams.category) filters.category = searchParams.category;
        if (searchParams.aiTool) filters.aiTools = [searchParams.aiTool];
        if (searchParams.aspectRatio) filters.aspectRatio = searchParams.aspectRatio;
        if (searchParams.contentType && searchParams.contentType !== 'all') {
            filters.isPremium = searchParams.contentType === 'premium';
        }

        const { prompts, total } = await getPrompts(filters, 1, 20);

        const safePrompts = prompts.map((p: any) => {
            const doc = { ...p, id: p._id.toString() };
            delete doc._id;
            return doc;
        }) as unknown as IPromptCard[];

        return { data: safePrompts, total };
    } catch (error) {
        console.error('Search rendering error:', error);
        return { data: [], total: 0 };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

interface PageProps {
    searchParams: Promise<Record<string, string>>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const params = await searchParams;
    const query = params.q;

    if (!query) {
        return {
            title: 'Search — Freesets',
            description: 'Search thousands of free AI prompts across every style, tool, and category.',
        };
    }

    return {
        title: `Search: ${query} — Freesets`,
        description: `Browse AI prompt results for "${query}" on Freesets.`,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Search Icon (inline SVG for empty state)
// ─────────────────────────────────────────────────────────────────────────────

function SearchIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-7"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    );
}

function SearchOffIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-7"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
            <path d="M8 11h6" />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default async function SearchPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const query = params.q?.trim();

    // ── No query: show empty search state ────────────────────────────────────
    if (!query) {
        return (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <h1 className="text-3xl font-display font-bold text-white mb-2">
                        Search Freesets
                    </h1>
                    <p className="text-sm text-white/40 mb-8 max-w-md text-center">
                        Find the perfect AI prompt from thousands of curated options across every style and tool.
                    </p>
                    <div className="w-full max-w-xl">
                        <Suspense fallback={<div className="h-12 w-full animate-pulse rounded-lg bg-surface-card" />}>
                            <SearchBar className="w-full" />
                        </Suspense>
                    </div>
                </div>
            </div>
        );
    }

    // ── Query exists: fetch results ──────────────────────────────────────────
    const { data: initialPrompts, total } = await searchPrompts(query, params);

    // ── No results ───────────────────────────────────────────────────────────
    if (initialPrompts.length === 0) {
        return (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Search bar at top so user can search again */}
                <div className="mb-8 max-w-xl mx-auto">
                    <Suspense fallback={<div className="h-12 w-full animate-pulse rounded-lg bg-surface-card" />}>
                        <SearchBar defaultValue={query} className="w-full" />
                    </Suspense>
                </div>

                <EmptyState
                    icon={<SearchOffIcon />}
                    title={`No results for "${query}"`}
                    description="Try different keywords, check for typos, or use broader search terms."
                    actionLabel="Browse All Prompts"
                    actionHref="/"
                />
            </div>
        );
    }

    // ── Results found ────────────────────────────────────────────────────────
    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {/* ── Page header ──────────────────────────────────────────────────── */}
            <div className="mb-6">
                <h1 className="text-2xl font-display font-bold text-white mb-1">
                    Results for &lsquo;{query}&rsquo;
                </h1>
                <p className="text-sm text-white/50">
                    {total.toLocaleString()} prompt{total !== 1 ? 's' : ''} found
                </p>
            </div>

            {/* ── Filters ─────────────────────────────────────────────────────── */}
            <div className="mb-6">
                <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-surface-card" />}>
                    <SearchFilters />
                </Suspense>
            </div>

            {/* ── Results gallery with infinite scroll ────────────────────────── */}
            <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-2xl bg-surface-card" />}>
                <SearchResultsGallery
                    initialPrompts={initialPrompts}
                    initialSearchParams={params}
                    query={query}
                />
            </Suspense>
        </div>
    );
}
