import { z } from 'zod';
import { AITool, Category, AspectRatio } from '@/types/prompt.types';
import { validate } from './helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Shared enum schemas (reusable across validators)
// ─────────────────────────────────────────────────────────────────────────────

const categoryEnum = z.nativeEnum(Category, {
    errorMap: () => ({ message: `Category must be one of: ${Object.values(Category).join(', ')}` }),
});

const aiToolEnum = z.nativeEnum(AITool, {
    errorMap: () => ({ message: `AI tool must be one of: ${Object.values(AITool).join(', ')}` }),
});

const aspectRatioEnum = z.nativeEnum(AspectRatio, {
    errorMap: () => ({ message: `Aspect ratio must be one of: ${Object.values(AspectRatio).join(', ')}` }),
});

// ─────────────────────────────────────────────────────────────────────────────
// createPromptSchema
// ─────────────────────────────────────────────────────────────────────────────

export const createPromptSchema = z.object({
    title: z
        .string({ required_error: 'Title is required' })
        .trim()
        .min(1, 'Title is required')
        .max(80, 'Title must be at most 80 characters'),

    promptText: z
        .string({ required_error: 'Prompt text is required' })
        .trim()
        .min(10, 'Prompt text must be at least 10 characters'),

    category: categoryEnum,

    subCategory: z
        .string({ required_error: 'Sub-category is required' })
        .trim()
        .min(1, 'Sub-category is required'),

    styleTags: z
        .array(z.string().trim().min(1, 'Style tag cannot be empty'))
        .max(10, 'You can add at most 10 style tags')
        .default([]),

    aiTools: z
        .array(aiToolEnum)
        .min(1, 'At least one AI tool is required'),

    aspectRatio: aspectRatioEnum,

    isFreeDownload: z.boolean().default(false),

    isPremium: z.boolean().default(false),

    negativePrompt: z
        .string()
        .trim()
        .optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// promptFiltersSchema
// ─────────────────────────────────────────────────────────────────────────────

export const promptFiltersSchema = z.object({
    category: categoryEnum.optional(),
    aiTools: z.array(aiToolEnum).optional(),
    aspectRatio: aspectRatioEnum.optional(),
    isPremium: z.boolean().optional(),
    isFreeDownload: z.boolean().optional(),
    sortBy: z.enum(['popular', 'newest', 'downloads', 'copies']).optional(),
    search: z.string().trim().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// paginationSchema
// ─────────────────────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
    page: z.coerce
        .number()
        .int('Page must be an integer')
        .min(1, 'Page must be at least 1')
        .default(1),

    limit: z.coerce
        .number()
        .int('Limit must be an integer')
        .min(1, 'Limit must be at least 1')
        .max(50, 'Limit must be at most 50')
        .default(20),
});

// ─────────────────────────────────────────────────────────────────────────────
// Inferred Types
// ─────────────────────────────────────────────────────────────────────────────

export type CreatePromptInput = z.infer<typeof createPromptSchema>;
export type PromptFiltersInput = z.infer<typeof promptFiltersSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

// Re-export validate helper for convenience
export { validate };
