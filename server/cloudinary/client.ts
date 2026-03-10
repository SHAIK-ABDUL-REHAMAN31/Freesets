import { v2 as cloudinary } from 'cloudinary';

// ─────────────────────────────────────────────────────────────────────────────
// Per-category Cloudinary credentials map
//
// Each category in Freesets uses its own separate Cloudinary account.
// The credentials are sourced from environment variables.
// ─────────────────────────────────────────────────────────────────────────────

interface CloudinaryCredentials {
    cloud_name: string | undefined;
    api_key: string | undefined;
    api_secret: string | undefined;
}

export const CATEGORY_CLOUDINARY_MAP: Record<string, CloudinaryCredentials> = {
    'ai-images': {
        cloud_name: process.env.CLOUDINARY_AI_IMAGES_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_AI_IMAGES_API_KEY,
        api_secret: process.env.CLOUDINARY_AI_IMAGES_API_SECRET,
    },
    'product-shoot': {
        cloud_name: process.env.CLOUDINARY_PRODUCT_SHOOT_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_PRODUCT_SHOOT_API_KEY,
        api_secret: process.env.CLOUDINARY_PRODUCT_SHOOT_API_SECRET,
    },
    'video-prompts': {
        cloud_name: process.env.CLOUDINARY_VIDEO_PROMPTS_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_VIDEO_PROMPTS_API_KEY,
        api_secret: process.env.CLOUDINARY_VIDEO_PROMPTS_API_SECRET,
    },
    'portrait': {
        cloud_name: process.env.CLOUDINARY_PORTRAIT_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_PORTRAIT_API_KEY,
        api_secret: process.env.CLOUDINARY_PORTRAIT_API_SECRET,
    },
    'architecture': {
        cloud_name: process.env.CLOUDINARY_ARCHITECTURE_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_ARCHITECTURE_API_KEY,
        api_secret: process.env.CLOUDINARY_ARCHITECTURE_API_SECRET,
    },
    'food-drink': {
        cloud_name: process.env.CLOUDINARY_FOOD_DRINK_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_FOOD_DRINK_API_KEY,
        api_secret: process.env.CLOUDINARY_FOOD_DRINK_API_SECRET,
    },
    'logo-brand': {
        cloud_name: process.env.CLOUDINARY_LOGO_BRAND_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_LOGO_BRAND_API_KEY,
        api_secret: process.env.CLOUDINARY_LOGO_BRAND_API_SECRET,
    },
    'texture': {
        cloud_name: process.env.CLOUDINARY_TEXTURE_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_TEXTURE_API_KEY,
        api_secret: process.env.CLOUDINARY_TEXTURE_API_SECRET,
    },
    'fashion': {
        cloud_name: process.env.CLOUDINARY_FASHION_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_FASHION_API_KEY,
        api_secret: process.env.CLOUDINARY_FASHION_API_SECRET,
    },
    'wallpaper': {
        cloud_name: process.env.CLOUDINARY_WALLPAPER_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_WALLPAPER_API_KEY,
        api_secret: process.env.CLOUDINARY_WALLPAPER_API_SECRET,
    },
    'movie': {
        cloud_name: process.env.CLOUDINARY_MOVIE_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_MOVIE_API_KEY,
        api_secret: process.env.CLOUDINARY_MOVIE_API_SECRET,
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// All supported category slugs
// ─────────────────────────────────────────────────────────────────────────────

export const SUPPORTED_CATEGORIES = Object.keys(CATEGORY_CLOUDINARY_MAP);

// ─────────────────────────────────────────────────────────────────────────────
// DB category ↔ Cloudinary slug mapping
//
// The Mongoose schema uses SCREAMING_SNAKE (e.g. AI_IMAGES) while the
// Cloudinary credentials map uses kebab-case slugs (e.g. ai-images).
// ─────────────────────────────────────────────────────────────────────────────

export const DB_CATEGORY_TO_SLUG: Record<string, string> = {
    AI_IMAGES: 'ai-images',
    PRODUCT_SHOOT: 'product-shoot',
    VIDEO_PROMPTS: 'video-prompts',
    PORTRAIT: 'portrait',
    ARCHITECTURE: 'architecture',
    FOOD: 'food-drink',
    LOGO: 'logo-brand',
    TEXTURE: 'texture',
    FASHION: 'fashion',
    WALLPAPER: 'wallpaper',
    MOVIE: 'movie',
};

export const SLUG_TO_DB_CATEGORY: Record<string, string> = Object.fromEntries(
    Object.entries(DB_CATEGORY_TO_SLUG).map(([k, v]) => [v, k]),
);

// ─────────────────────────────────────────────────────────────────────────────
// Video-compatible categories
// ─────────────────────────────────────────────────────────────────────────────

export const VIDEO_CATEGORIES = ['video-prompts', 'movie'] as const;

// ─────────────────────────────────────────────────────────────────────────────
// getCloudinaryClient(category)
//
// Returns a configured Cloudinary v2 instance for the given category slug.
// Each call reconfigures the SDK with that category's specific credentials
// so any subsequent API calls hit the correct Cloudinary account.
//
// ⚠️  The Cloudinary Node SDK (v2) uses a global singleton. This function
//     reconfigures that singleton with the selected category's credentials.
//     Make sure not to interleave calls across categories without
//     re-calling getCloudinaryClient() first.
// ─────────────────────────────────────────────────────────────────────────────

export function getCloudinaryClient(category: string) {
    const config = CATEGORY_CLOUDINARY_MAP[category];

    if (!config) {
        throw new Error(
            `No Cloudinary account configured for category: ${category}`
        );
    }

    // Reconfigure the Cloudinary singleton with this category's credentials
    cloudinary.config({
        cloud_name: config.cloud_name,
        api_key: config.api_key,
        api_secret: config.api_secret,
        secure: true,
    });

    return cloudinary;
}

// ─────────────────────────────────────────────────────────────────────────────
// Backwards-compatible default export
//
// Falls back to the legacy single-account env vars (CLOUDINARY_CLOUD_NAME,
// CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) if they still exist.
// This keeps existing call-sites working until they are migrated.
// ─────────────────────────────────────────────────────────────────────────────

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export default cloudinary;
