// ─────────────────────────────────────────────────────────────────────────────
// Secure cookie helpers
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from 'next/server';

export const ADMIN_COOKIE_NAME = 'fs_admin_token';

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 60 * 60 * 24,  // 24 hours in seconds
    path: '/',
};

/**
 * Set a secure httpOnly cookie on the response.
 */
export function setSecureCookie(
    response: NextResponse,
    name: string,
    value: string,
): NextResponse {
    response.cookies.set(name, value, COOKIE_OPTIONS);
    return response;
}

/**
 * Clear a cookie by setting maxAge to 0.
 */
export function clearSecureCookie(
    response: NextResponse,
    name: string,
): NextResponse {
    response.cookies.set(name, '', {
        ...COOKIE_OPTIONS,
        maxAge: 0,
    });
    return response;
}
