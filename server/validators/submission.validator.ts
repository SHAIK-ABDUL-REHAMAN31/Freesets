import { z } from 'zod';
import { AITool, Category, AspectRatio } from '@/types/prompt.types';
import { validate } from './helpers';

// ─────────────────────────────────────────────────────────────────────────────
// submitPromptSchema
// ─────────────────────────────────────────────────────────────────────────────

export const submitPromptSchema = z.object({
    title: z
        .string({ required_error: 'Title is required' })
        .trim()
        .min(1, 'Title is required')
        .max(80, 'Title must be at most 80 characters'),

    promptText: z
        .string({ required_error: 'Prompt text is required' })
        .trim()
        .min(10, 'Prompt text must be at least 10 characters'),

    category: z.nativeEnum(Category, {
        errorMap: () => ({ message: `Category must be one of: ${Object.values(Category).join(', ')}` }),
    }),

    subCategory: z
        .string({ required_error: 'Sub-category is required' })
        .trim()
        .min(1, 'Sub-category is required'),

    styleTags: z
        .array(z.string().trim().min(1, 'Style tag cannot be empty'))
        .max(10, 'You can add at most 10 style tags')
        .default([]),

    aiTools: z
        .array(
            z.nativeEnum(AITool, {
                errorMap: () => ({ message: `AI tool must be one of: ${Object.values(AITool).join(', ')}` }),
            }),
        )
        .min(1, 'At least one AI tool is required'),

    aspectRatio: z.nativeEnum(AspectRatio, {
        errorMap: () => ({ message: `Aspect ratio must be one of: ${Object.values(AspectRatio).join(', ')}` }),
    }),

    notes: z
        .string()
        .trim()
        .max(300, 'Notes must be at most 300 characters')
        .optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Inferred Types
// ─────────────────────────────────────────────────────────────────────────────

export type SubmitPromptInput = z.infer<typeof submitPromptSchema>;

// Re-export validate helper for convenience
export { validate };
