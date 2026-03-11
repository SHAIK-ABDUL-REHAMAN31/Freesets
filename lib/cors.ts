// ─────────────────────────────────────────────────────────────────────────────
// CORS configuration
// ─────────────────────────────────────────────────────────────────────────────

const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'https://freesets-sage.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
].filter(Boolean) as string[];

/**
 * Return CORS headers for the given request origin.
 * If the origin is allowed, echo it back; otherwise fall back to APP_URL.
 */
export function corsHeaders(origin?: string | null): Record<string, string> {
    const isAllowed = origin && allowedOrigins.includes(origin);

    return {
        'Access-Control-Allow-Origin': isAllowed
            ? origin!
            : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
    };
}

/**
 * If the request method is OPTIONS (preflight), return 204 immediately.
 * Otherwise returns null — the caller should proceed normally.
 */
export function handleCORS(req: Request): Response | null {
    const origin = req.headers.get('origin');

    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: corsHeaders(origin),
        });
    }

    return null;
}

/**
 * Helper: get the request origin for use in response headers.
 */
export function getOrigin(req: Request): string | null {
    return req.headers.get('origin');
}
