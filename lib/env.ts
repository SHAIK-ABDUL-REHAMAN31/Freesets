// ─────────────────────────────────────────────────────────────────────────────
// Environment variable validation (fail fast on startup)
//
// Import this in app/layout.tsx or server entrypoint so it runs at startup.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod';

const envSchema = z.object({
    // ── Core ─────────────────────────────────────────────────────────────────
    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
    ADMIN_USERNAME: z.string().min(1, 'ADMIN_USERNAME is required'),
    ADMIN_PASSWORD: z.string().min(1, 'ADMIN_PASSWORD is required'),
    ADMIN_SESSION_SECRET: z.string().min(32, 'ADMIN_SESSION_SECRET must be at least 32 chars'),
    NEXT_PUBLIC_APP_URL: z.string().min(1, 'NEXT_PUBLIC_APP_URL is required'),

    // ── Cloudinary — AI Images ───────────────────────────────────────────────
    CLOUDINARY_AI_IMAGES_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_AI_IMAGES_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_AI_IMAGES_API_SECRET: z.string().min(1).optional(),

    // ── Cloudinary — Product Shoot ───────────────────────────────────────────
    CLOUDINARY_PRODUCT_SHOOT_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_PRODUCT_SHOOT_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_PRODUCT_SHOOT_API_SECRET: z.string().min(1).optional(),

    // ── Cloudinary — Video Prompts ───────────────────────────────────────────
    CLOUDINARY_VIDEO_PROMPTS_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_VIDEO_PROMPTS_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_VIDEO_PROMPTS_API_SECRET: z.string().min(1).optional(),

    // ── Cloudinary — Portrait ────────────────────────────────────────────────
    CLOUDINARY_PORTRAIT_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_PORTRAIT_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_PORTRAIT_API_SECRET: z.string().min(1).optional(),

    // ── Cloudinary — Architecture ────────────────────────────────────────────
    CLOUDINARY_ARCHITECTURE_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_ARCHITECTURE_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_ARCHITECTURE_API_SECRET: z.string().min(1).optional(),

    // ── Cloudinary — Food ────────────────────────────────────────────────────
    CLOUDINARY_FOOD_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_FOOD_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_FOOD_API_SECRET: z.string().min(1).optional(),

    // ── Cloudinary — Logo ────────────────────────────────────────────────────
    CLOUDINARY_LOGO_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_LOGO_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_LOGO_API_SECRET: z.string().min(1).optional(),

    // ── Cloudinary — Texture ─────────────────────────────────────────────────
    CLOUDINARY_TEXTURE_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_TEXTURE_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_TEXTURE_API_SECRET: z.string().min(1).optional(),

    // ── Cloudinary — Fashion ─────────────────────────────────────────────────
    CLOUDINARY_FASHION_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_FASHION_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_FASHION_API_SECRET: z.string().min(1).optional(),

    // ── Cloudinary — Wallpaper ───────────────────────────────────────────────
    CLOUDINARY_WALLPAPER_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_WALLPAPER_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_WALLPAPER_API_SECRET: z.string().min(1).optional(),

    // ── Cloudinary — Movie ───────────────────────────────────────────────────
    CLOUDINARY_MOVIE_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_MOVIE_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_MOVIE_API_SECRET: z.string().min(1).optional(),

    // ── Node Environment ─────────────────────────────────────────────────────
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Validated environment variables.
 * If any required variable is missing, this will throw at import time.
 */
function validateEnv() {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        const formatted = result.error.issues
            .map((issue) => `  ✗ ${issue.path.join('.')}: ${issue.message}`)
            .join('\n');
        console.error(
            `\n❌ Environment validation failed:\n${formatted}\n\n` +
            `   Fix your .env.local file (see .env.example for reference).\n`,
        );
        // Don't crash in development — just warn
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Missing required environment variables');
        }
    }

    return result.success ? result.data : (process.env as unknown as z.infer<typeof envSchema>);
}

export const env = validateEnv();
