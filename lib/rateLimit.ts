// ─────────────────────────────────────────────────────────────────────────────
// In-memory rate limiter
// ─────────────────────────────────────────────────────────────────────────────

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Periodic cleanup — remove expired entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    Array.from(rateLimitMap.entries()).forEach(([key, entry]) => {
        if (now >= entry.resetTime) {
            rateLimitMap.delete(key);
        }
    });
}, 5 * 60 * 1000);

interface RateLimitOptions {
    /** Maximum requests allowed in the window */
    limit: number;
    /** Time window in milliseconds */
    windowMs: number;
    /** Unique identifier (usually IP or IP + route) */
    identifier: string;
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    retryAfterMs?: number;
}

export function rateLimit(options: RateLimitOptions): RateLimitResult {
    const { limit, windowMs, identifier } = options;
    const now = Date.now();
    const entry = rateLimitMap.get(identifier);

    // No entry or window expired — create fresh entry
    if (!entry || now >= entry.resetTime) {
        rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
        return { allowed: true, remaining: limit - 1 };
    }

    // Within window — check count
    if (entry.count < limit) {
        entry.count += 1;
        return { allowed: true, remaining: limit - entry.count };
    }

    // Over limit
    return {
        allowed: false,
        remaining: 0,
        retryAfterMs: entry.resetTime - now,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: extract client IP from request
// ─────────────────────────────────────────────────────────────────────────────

export function getClientIP(req: Request): string {
    return (
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        req.headers.get('x-real-ip') ||
        '127.0.0.1'
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Preset limiters — use these in API routes
// ─────────────────────────────────────────────────────────────────────────────

/** 10 requests per minute — admin auth */
export function strictLimit(ip: string) {
    return rateLimit({ limit: 10, windowMs: 60_000, identifier: `strict:${ip}` });
}

/** 20 requests per 5 minutes — uploads */
export function uploadLimit(ip: string) {
    return rateLimit({ limit: 20, windowMs: 5 * 60_000, identifier: `upload:${ip}` });
}

/** 100 requests per minute — general public API */
export function generalLimit(ip: string) {
    return rateLimit({ limit: 100, windowMs: 60_000, identifier: `general:${ip}` });
}

/** 30 requests per minute — search */
export function searchLimit(ip: string) {
    return rateLimit({ limit: 30, windowMs: 60_000, identifier: `search:${ip}` });
}
