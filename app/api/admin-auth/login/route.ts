import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/server/db/connect';
import AdminSession from '@/server/db/models/AdminSession.model';
import SecurityLog from '@/server/db/models/SecurityLog.model';
import { handleCORS, corsHeaders, getOrigin } from '@/lib/cors';
import { strictLimit, getClientIP } from '@/lib/rateLimit';
import { setSecureCookie, ADMIN_COOKIE_NAME } from '@/lib/cookies';
import { sanitizeString } from '@/lib/sanitize';

// ─────────────────────────────────────────────────────────────────────────────
// In-memory brute-force tracker (separate from general rate limiter)
// ─────────────────────────────────────────────────────────────────────────────

interface BruteForceEntry {
    attempts: number;
    blockedUntil: number | null;
}

const bruteForceMap = new Map<string, BruteForceEntry>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function checkBruteForce(ip: string): { blocked: boolean; retryAfterMs?: number } {
    const entry = bruteForceMap.get(ip);
    if (!entry) return { blocked: false };

    if (entry.blockedUntil && Date.now() < entry.blockedUntil) {
        return { blocked: true, retryAfterMs: entry.blockedUntil - Date.now() };
    }

    if (entry.blockedUntil && Date.now() >= entry.blockedUntil) {
        bruteForceMap.delete(ip);
        return { blocked: false };
    }

    return { blocked: false };
}

function recordFailedAttempt(ip: string): void {
    const entry = bruteForceMap.get(ip) || { attempts: 0, blockedUntil: null };
    entry.attempts += 1;
    if (entry.attempts >= MAX_ATTEMPTS) {
        entry.blockedUntil = Date.now() + BLOCK_DURATION_MS;
    }
    bruteForceMap.set(ip, entry);
}

function clearAttempts(ip: string): void {
    bruteForceMap.delete(ip);
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin-auth/login
// ─────────────────────────────────────────────────────────────────────────────

export async function OPTIONS(req: Request) {
    return handleCORS(req) || new Response(null, { status: 204, headers: corsHeaders(getOrigin(req)) });
}

export async function POST(req: Request) {
    const origin = getOrigin(req);
    const headers = corsHeaders(origin);

    try {
        const ip = getClientIP(req);
        const userAgent = req.headers.get('user-agent') || '';

        // 1. Rate limit
        const rl = strictLimit(ip);
        if (!rl.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please slow down.' },
                { status: 429, headers: { ...headers, 'Retry-After': String(Math.ceil((rl.retryAfterMs || 60000) / 1000)) } },
            );
        }

        // 2. Brute force check
        const bf = checkBruteForce(ip);
        if (bf.blocked) {
            // Log blocked attempt
            try {
                await connectDB();
                await SecurityLog.create({ type: 'blocked', ip, userAgent, details: 'Brute force block' });
            } catch { /* non-critical */ }

            const minutes = Math.ceil((bf.retryAfterMs || 0) / 60000);
            return NextResponse.json(
                { error: `Too many attempts. Try again in ${minutes} minutes.` },
                { status: 429, headers },
            );
        }

        // 3. Parse & sanitize body
        const body = await req.json();
        const username = sanitizeString(body.username || '');
        const password = body.password || ''; // Don't sanitize password (could contain special chars)

        // 4. Validate credentials
        const validUsername = process.env.ADMIN_USERNAME;
        const validPassword = process.env.ADMIN_PASSWORD;

        if (!validUsername || !validPassword) {
            return NextResponse.json(
                { error: 'Admin credentials not configured' },
                { status: 500, headers },
            );
        }

        if (username !== validUsername || password !== validPassword) {
            recordFailedAttempt(ip);

            // Log failed attempt
            try {
                await connectDB();
                await SecurityLog.create({ type: 'login_failed', ip, userAgent, details: `Username: ${username}` });
            } catch { /* non-critical */ }

            // Deliberate 2-second delay to slow brute force
            await new Promise((resolve) => setTimeout(resolve, 2000));

            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401, headers },
            );
        }

        // 5. Credentials valid — clear rate limiter
        clearAttempts(ip);

        // 6. Generate secure token
        const token = crypto.randomBytes(64).toString('hex');

        // 7. Store session in MongoDB
        await connectDB();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await AdminSession.create({ token, expiresAt });

        // 8. Log successful login
        try {
            await SecurityLog.create({ type: 'login_success', ip, userAgent, details: `User: ${username}` });
        } catch { /* non-critical */ }

        // 9. Set httpOnly cookie
        const response = NextResponse.json({ success: true }, { status: 200, headers });
        setSecureCookie(response, ADMIN_COOKIE_NAME, token);

        return response;
    } catch (error) {
        console.error('[Admin Login Error]', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers },
        );
    }
}
