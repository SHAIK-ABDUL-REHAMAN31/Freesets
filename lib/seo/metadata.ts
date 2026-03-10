import { Metadata } from 'next';
import type { IPrompt, Category } from '@/types/prompt.types';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Generate Next.js Metadata for an individual prompt page
 */
export function generatePromptMetadata(prompt: IPrompt): Metadata {
    const title = `${prompt.title} — Freesets`;
    const descriptionText = prompt.promptText.slice(0, 160) + (prompt.promptText.length > 160 ? '...' : '');

    // Note: If you have dynamic OG generation on your `/prompt/[id]/opengraph-image.tsx`, 
    // Next.js handles that natively without explicitly setting og images here. 
    // However, as specified, using the output image directly as a fallback/primary.
    const ogImage = prompt.outputImageUrl;

    return {
        title: title,
        description: descriptionText,
        openGraph: {
            title: title,
            description: descriptionText,
            url: `${APP_URL}/prompt/${prompt.id}`,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: descriptionText,
            images: [ogImage],
        },
    };
}

/**
 * Generate Next.js Metadata for a category listing page
 */
export function generateCategoryMetadata(categorySlug: string): Metadata {
    // Basic human formatting a slug like "product-shoot" to "Product Shoot"
    const formattedName = categorySlug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    const title = `${formattedName} Prompts — Freesets`;
    const descriptionText = `Browse the best curated, high-quality ${formattedName} AI generation prompts. Save your favorites and download uncompressed assets.`;

    const categoryUrl = `${APP_URL}/category/${categorySlug}`;

    return {
        title: title,
        description: descriptionText,
        openGraph: {
            title: title,
            description: descriptionText,
            url: categoryUrl,
            images: [
                {
                    url: `${APP_URL}/og-default.jpg`, // Adjust based on your default branding
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: descriptionText,
        },
    };
}
