import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CATEGORIES, type CategorySlug } from '@/config/categories';
import { SearchFilters } from '@/components/search/SearchFilters';
import { FreesetsGallery } from '@/components/prompt/FreesetsGallery';
import type { IPromptCard } from '@/types/prompt.types';

// ─────────────────────────────────────────────────────────────────────────────
// Static generation
// ─────────────────────────────────────────────────────────────────────────────

export function generateStaticParams() {
    return CATEGORIES.map((cat) => ({ slug: cat.slug }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const category = CATEGORIES.find((c) => c.slug === slug);

    if (!category) {
        return { title: 'Category Not Found' };
    }

    return {
        title: `${category.label} Prompts`,
        description: `${category.description} Browse free ${category.label.toLowerCase()} AI prompts on Freesets — curated, copy-ready, and always free to explore.`,
        openGraph: {
            title: `${category.label} Prompts — Freesets`,
            description: category.description,
        },
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Map URL slug → Category enum value expected by the API */
const SLUG_TO_CATEGORY: Record<CategorySlug, string> = {
    'ai-images': 'AI_IMAGES',
    'video-prompts': 'VIDEO_PROMPTS',
    'product-shoot': 'PRODUCT_SHOOT',
    portrait: 'PORTRAIT',
    architecture: 'ARCHITECTURE',
    food: 'FOOD',
    logo: 'LOGO',
    texture: 'TEXTURE',
    movie: 'MOVIE',
};

async function getCategoryPrompts(categoryEnum: string): Promise<IPromptCard[]> {
    try {
        const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const res = await fetch(
            `${base}/api/prompts?category=${categoryEnum}&limit=20&page=1&sortBy=popular`,
            { next: { revalidate: 3600 } }, // 1-hour ISR per category
        );

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

interface CategoryPageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<Record<string, string>>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const { slug } = await params;
    const urlParams = await searchParams;

    // 404 if slug is unknown
    const category = CATEGORIES.find((c) => c.slug === slug);
    if (!category) notFound();

    const categoryEnum = SLUG_TO_CATEGORY[slug as CategorySlug];
    const initialPrompts = await getCategoryPrompts(categoryEnum);

    // Merge the locked-in category with any other active URL filters
    const mergedParams: Record<string, string> = {
        ...urlParams,
        category: categoryEnum,
    };

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {/* ── Category header ───────────────────────────────────────────────── */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-3">
                    <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-lg"
                        style={{ backgroundColor: `${category.color}20`, border: `1px solid ${category.color}40` }}
                    >
                        {category.icon}
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-white">
                            {category.label} Prompts
                        </h1>
                        <p className="text-sm text-white/50 mt-0.5 max-w-xl">
                            {category.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Filters (category pre-applied, category filter hidden) ────────── */}
            <div className="mb-6">
                <Suspense fallback={<div className="h-10 animate-pulse rounded-lg bg-surface-card" />}>
                    <SearchFilters />
                </Suspense>
            </div>

            {/* ── Gallery — category is locked in via initialSearchParams ───────── */}
            <FreesetsGallery
                initialPrompts={initialPrompts}
                initialSearchParams={mergedParams}
            />
        </div>
    );
}
