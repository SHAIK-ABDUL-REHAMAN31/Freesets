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

async function getInitialPrompts(searchParams: Record<string, string>): Promise<IPromptCard[]> {
    try {
        const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const qs = new URLSearchParams({
            limit: '20',
            page: '1',
            sortBy: searchParams.sortBy || 'newest',
            ...(searchParams.category && { category: searchParams.category }),
            ...(searchParams.search && { search: searchParams.search }),
        });

        const res = await fetch(`${base}/api/prompts?${qs}`, {
            next: { revalidate: 60 },
        });

        if (!res.ok) return [];
        const json = await res.json();
        return json.data || [];
    } catch {
        return [];
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

interface HomePageProps {
    searchParams: Promise<Record<string, string>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
    const params = await searchParams;
    const initialPrompts = await getInitialPrompts(params);

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {/* ── Gallery (client component — infinite scroll + re-fetch) ───────── */}
            <HomeGallery
                initialPrompts={initialPrompts}
                initialSearchParams={params}
            />
        </div>
    );
}
