import { HomeGallery } from './HomeGallery';
import type { IPromptCard } from '@/types/prompt.types';

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

export const metadata = {
    title: 'Freesets — Free AI Prompts for Every Creative Need',
    description:
        'Browse thousands of free AI prompts for Midjourney, DALL·E, Stable Diffusion, Sora, Runway, and more. Filter by category, AI tool, and aspect ratio.',
};

// ─────────────────────────────────────────────────────────────────────────────
// Data Fetching
// ─────────────────────────────────────────────────────────────────────────────

import { getPrompts } from '@/server/services/prompt.service';

async function getInitialPrompts(searchParams: Record<string, string>): Promise<IPromptCard[]> {
    try {
        const filters: any = {
            search: searchParams.search,
            sortBy: searchParams.sortBy || 'newest',
        };

        if (searchParams.category) filters.category = searchParams.category;

        const { prompts } = await getPrompts(filters, 1, 20);

        return prompts.map((p: any) => {
            const doc = { ...p, id: p._id.toString() };
            delete doc._id;
            return doc;
        }) as unknown as IPromptCard[];
    } catch (error) {
        console.error('Home generation error:', error);
        return [];
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

interface HomePageProps {
    searchParams: Promise<Record<string, string>>;
}

import { Suspense } from 'react';

export default async function HomePage({ searchParams }: HomePageProps) {
    const params = await searchParams;
    const initialPrompts = await getInitialPrompts(params);

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {/* ── Gallery (client component — infinite scroll + re-fetch) ───────── */}
            <Suspense fallback={<div className="mt-8 h-96 w-full animate-pulse rounded-2xl bg-surface-card" />}>
                <HomeGallery
                    initialPrompts={initialPrompts}
                    initialSearchParams={params}
                />
            </Suspense>
        </div>
    );
}
