import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PromptDetail } from '@/components/prompt/PromptDetail';
import type { IPrompt, IPromptCard } from '@/types/prompt.types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function getPromptById(id: string): Promise<IPrompt | null> {
    try {
        const res = await fetch(`${BASE_URL}/api/prompts/${id}`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data ?? null;
    } catch {
        return null;
    }
}

async function getRelatedPrompts(prompt: IPrompt): Promise<IPromptCard[]> {
    try {
        const qs = new URLSearchParams({
            category: prompt.category,
            limit: '8',
            exclude: prompt.id,
        });
        const res = await fetch(`${BASE_URL}/api/prompts?${qs}`, {
            next: { revalidate: 120 },
        });
        if (!res.ok) return [];
        const json = await res.json();
        return json.data ?? [];
    } catch {
        return [];
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

interface PageParams {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const { id } = await params;
    const prompt = await getPromptById(id);

    if (!prompt || prompt.status !== 'PUBLISHED') {
        return { title: 'Prompt Not Found — Freesets' };
    }

    const description = prompt.promptText.length > 160
        ? prompt.promptText.slice(0, 157) + '…'
        : prompt.promptText;

    return {
        title: `${prompt.title} — Freesets`,
        description,
        openGraph: {
            title: `${prompt.title} — Freesets`,
            description,
            images: [
                {
                    url: prompt.outputImageUrl,
                    width: 1200,
                    height: 630,
                    alt: prompt.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${prompt.title} — Freesets`,
            description,
            images: [prompt.outputImageUrl],
        },
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default async function PromptPage({ params }: PageParams) {
    const { id } = await params;
    const prompt = await getPromptById(id);

    if (!prompt || prompt.status !== 'PUBLISHED') {
        notFound();
    }

    const relatedPrompts = await getRelatedPrompts(prompt);

    // ── JSON-LD Structured Data ──────────────────────────────────────────────
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        name: prompt.title,
        description: prompt.promptText.slice(0, 200),
        contentUrl: prompt.outputImageUrl,
        thumbnailUrl: prompt.thumbnailUrl,
        creator: {
            '@type': 'Organization',
            name: 'Freesets',
            url: BASE_URL,
        },
        datePublished: prompt.createdAt,
        keywords: prompt.styleTags.join(', '),
    };

    return (
        <>
            {/* JSON-LD for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="py-8">
                <PromptDetail
                    prompt={prompt}
                    relatedPrompts={relatedPrompts}
                />
            </div>
        </>
    );
}
