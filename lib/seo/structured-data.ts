import type { IPrompt } from '@/types/prompt.types';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Returns JSON-LD structured data for an individual Prompt.
 * Utilizing the standard 'ImageObject' schema.
 */
export function getPromptSchema(prompt: IPrompt) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        name: prompt.title,
        description: prompt.promptText,
        contentUrl: prompt.outputImageUrl,
        thumbnailUrl: prompt.thumbnailUrl,
        datePublished: new Date(prompt.createdAt).toISOString(),
        author: {
            '@type': 'Organization', // Can map to actual User entity eventually if preferred
            name: 'Freesets',
            url: APP_URL,
        },
        creditText: 'Freesets AI generation prompts directory',
        license: `${APP_URL}/terms`,
    };
}

/**
 * Returns JSON-LD structured data for the Home/Browse index.
 * Utilizing 'WebSite' and 'SearchAction'.
 */
export function getWebsiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Freesets',
        url: APP_URL,
        description: 'Discover, copy, and save the absolute highest-quality AI image & video generation prompts.',
        publisher: {
            '@type': 'Organization',
            name: 'Freesets',
            logo: {
                '@type': 'ImageObject',
                url: `${APP_URL}/logo.png`, // Update placeholder branding as needed
            },
        },
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${APP_URL}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}
