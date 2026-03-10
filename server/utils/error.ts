import { NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// AppError
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Application-level error with an HTTP status code.
 *
 * `isOperational` distinguishes expected client errors (true) from
 * unexpected bugs / system failures (false).
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // Maintains proper stack trace in V8 (Node / Chrome)
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Factory
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shorthand factory for creating an `AppError`.
 */
export function createError(message: string, statusCode: number): AppError {
    return new AppError(message, statusCode);
}

// ─────────────────────────────────────────────────────────────────────────────
// Pre-built Errors
// ─────────────────────────────────────────────────────────────────────────────

/** 401 – caller is not authenticated. */
export const UNAUTHORIZED = createError('Unauthorized', 401);

/** 403 – caller lacks permission. */
export const FORBIDDEN = createError('Forbidden', 403);

/** 404 – resource does not exist. */
export const NOT_FOUND = createError('Not found', 404);

/** 429 – free-tier daily quota exhausted. */
export const LIMIT_REACHED = createError(
    'Daily limit reached. Upgrade to Pro.',
    429,
);

/** 400 – returns a new validation error with a custom message. */
export const VALIDATION_ERROR = (msg: string) => createError(msg, 400);

// ─────────────────────────────────────────────────────────────────────────────
// Error Handler
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Centralised API error handler.
 *
 * - `AppError`  → responds with the error's `statusCode` and `message`.
 * - Anything else → responds with **500** and a generic message so
 *   internals are never leaked to the client.
 * - In development the full error is logged to the console.
 */
export function handleApiError(error: unknown): NextResponse {
    // Log in development for easier debugging
    if (process.env.NODE_ENV === 'development') {
        console.error('[API Error]', error);
    }

    if (error instanceof AppError) {
        return NextResponse.json(
            { error: error.message },
            { status: error.statusCode },
        );
    }

    // Unknown / unexpected error – never expose internals
    return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
    );
}
