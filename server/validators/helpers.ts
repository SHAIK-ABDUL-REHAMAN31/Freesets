import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ValidationSuccess<T> {
    success: true;
    data: T;
    errors: null;
}

export interface ValidationFailure {
    success: false;
    data: null;
    errors: { field: string; message: string }[];
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

// ─────────────────────────────────────────────────────────────────────────────
// validate
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Safely validate `data` against a Zod `schema`.
 *
 * - On success → `{ success: true, data, errors: null }`
 * - On failure → `{ success: false, data: null, errors: [...] }`
 *
 * Each error entry includes the `field` path (dot-delimited) and a
 * human-readable `message`.
 *
 * @example
 * ```ts
 * const result = validate(signupSchema, req.body);
 *
 * if (!result.success) {
 *     return NextResponse.json({ errors: result.errors }, { status: 400 });
 * }
 *
 * const { email, password, name } = result.data;
 * ```
 */
export function validate<T extends z.ZodTypeAny>(
    schema: T,
    data: unknown,
): ValidationResult<z.infer<T>> {
    const result = schema.safeParse(data);

    if (result.success) {
        return {
            success: true,
            data: result.data,
            errors: null,
        };
    }

    const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || '_root',
        message: issue.message,
    }));

    return {
        success: false,
        data: null,
        errors,
    };
}
