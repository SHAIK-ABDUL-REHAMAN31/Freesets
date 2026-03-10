// ─────────────────────────────────────────────────────────────────────────────
// Site-wide metadata used for SEO, Open Graph, and UI copy
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_CONFIG = {
    name: 'Freesets',
    tagline: 'Free AI Prompts & Assets for Everyone',
    description:
        'Freesets is your go-to library of free and premium AI prompts for Midjourney, DALL-E 3, ' +
        'Stable Diffusion, Sora, Runway, and more. Browse thousands of curated prompts across ' +
        'categories like AI Images, Video, Product Photography, Portraits, Architecture, and Food. ' +
        'Copy, download, and create stunning visuals — no prompt-engineering experience required.',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    email: 'hello@freesets.io',
    social: {
        twitter: '',
        instagram: '',
        discord: '',
    },
} as const;

export type SiteConfig = typeof SITE_CONFIG;
