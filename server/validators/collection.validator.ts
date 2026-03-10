import { z } from 'zod';
import { validate } from './helpers';

// ─────────────────────────────────────────────────────────────────────────────
// MongoDB ObjectId regex (24-character hex string)
// ─────────────────────────────────────────────────────────────────────────────

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// ─────────────────────────────────────────────────────────────────────────────
// createCollectionSchema
// ─────────────────────────────────────────────────────────────────────────────

export const createCollectionSchema = z.object({
    name: z
        .string({ required_error: 'Collection name is required' })
        .trim()
        .min(1, 'Collection name is required')
        .max(60, 'Collection name must be at most 60 characters'),

    description: z
        .string()
        .trim()
        .max(200, 'Description must be at most 200 characters')
        .optional(),

    isPublic: z.boolean().default(false),
});

// ─────────────────────────────────────────────────────────────────────────────
// addPromptSchema
// ─────────────────────────────────────────────────────────────────────────────

export const addPromptSchema = z.object({
    promptId: z
        .string({ required_error: 'Prompt ID is required' })
        .regex(objectIdRegex, 'Prompt ID must be a valid MongoDB ObjectId'),
});

// ─────────────────────────────────────────────────────────────────────────────
// Inferred Types
// ─────────────────────────────────────────────────────────────────────────────

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type AddPromptInput = z.infer<typeof addPromptSchema>;

// Re-export validate helper for convenience
export { validate };
