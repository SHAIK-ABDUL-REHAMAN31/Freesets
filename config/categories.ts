// Matches the Category enum slugs in types/prompt.types.ts

export const CATEGORIES = [
    {
        slug: 'ai-images',
        value: 'AI_IMAGES',
        label: 'AI Images',
        description: 'General-purpose AI-generated images spanning any style or subject.',
        icon: '✨',
        color: '#A78BFA',
    },
    {
        slug: 'video-prompts',
        value: 'VIDEO_PROMPTS',
        label: 'Video Prompts',
        description: 'Cinematic motion prompts for Sora, Runway, Kling, and other video AI tools.',
        icon: '🎬',
        color: '#60A5FA',
    },
    {
        slug: 'product-shoot',
        value: 'PRODUCT_SHOOT',
        label: 'Product Shoot',
        description: 'Studio-quality commercial product photography prompts for e-commerce and ads.',
        icon: '📸',
        color: '#F472B6',
    },
    {
        slug: 'portrait',
        value: 'PORTRAIT',
        label: 'Portrait',
        description: 'Photorealistic and artistic human, character, and fantasy portrait prompts.',
        icon: '👤',
        color: '#34D399',
    },
    {
        slug: 'architecture',
        value: 'ARCHITECTURE',
        label: 'Architecture',
        description: 'Exterior buildings, interior spaces, and urban-landscape design prompts.',
        icon: '🏛️',
        color: '#FBBF24',
    },
    {
        slug: 'food',
        value: 'FOOD',
        label: 'Food',
        description: 'Mouth-watering culinary photography and overhead food-styling prompts.',
        icon: '🍔',
        color: '#F87171',
    },
    {
        slug: 'logo',
        value: 'LOGO',
        label: 'Logo',
        description: 'Minimalist and expressive brand-identity, icon, and wordmark prompts.',
        icon: '🎯',
        color: '#818CF8',
    },
    {
        slug: 'texture',
        value: 'TEXTURE',
        label: 'Texture',
        description: 'Seamless backgrounds, surface materials, and pattern prompts for design work.',
        icon: '🎨',
        color: '#A3E635',
    },
    {
        slug: 'movie',
        value: 'MOVIE',
        label: 'Movie & Cinema',
        description: 'Cinematic stills, movie poster concepts, and film-inspired visual prompts.',
        icon: '🎥',
        color: '#F59E0B',
    },
] as const;

export type CategorySlug = typeof CATEGORIES[number]['slug'];
