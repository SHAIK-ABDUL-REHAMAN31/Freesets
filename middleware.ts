import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────────────────────
// Middleware — security checks + admin route protection
// ─────────────────────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ── 1. Admin route protection ────────────────────────────────────────────
    const adminPath = process.env.ADMIN_SECRET_PATH;
    if (!adminPath) return NextResponse.next();

    const adminPrefix = `/${adminPath}`;

    // Only apply extra checks to admin routes
    if (!pathname.startsWith(adminPrefix)) {
        return NextResponse.next();
    }

    // ── 2. Block non-HTTPS in production ─────────────────────────────────────
    if (
        process.env.NODE_ENV === 'production' &&
        req.headers.get('x-forwarded-proto') !== 'https'
    ) {
        const httpsUrl = req.nextUrl.clone();
        httpsUrl.protocol = 'https';
        return NextResponse.redirect(httpsUrl, 301);
    }

    // ── 3. User-Agent check (block bots/scripts with empty UA) ───────────────
    const userAgent = req.headers.get('user-agent');
    if (!userAgent || userAgent.length < 5) {
        // Return 404 — don't reveal the admin route exists
        return new NextResponse(null, { status: 404 });
    }

    // ── 4. IP allowlist (optional) ───────────────────────────────────────────
    const allowedIPs = process.env.ADMIN_ALLOWED_IPS;
    if (allowedIPs) {
        const clientIP =
            req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            req.headers.get('x-real-ip') ||
            '';

        const ipList = allowedIPs.split(',').map((ip) => ip.trim());

        if (clientIP && !ipList.includes(clientIP)) {
            // Return 404 — don't reveal the admin route exists
            return new NextResponse(null, { status: 404 });
        }
    }

    // ── 5. Check for admin token cookie ──────────────────────────────────────
    const token = req.cookies.get('fs_admin_token')?.value;

    if (!token) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = '/fsa-login';
        return NextResponse.redirect(loginUrl);
    }

    // Lightweight cookie-exists check in middleware.
    // The layout.tsx does the real MongoDB session verification server-side.
    return NextResponse.next();
}

// ─────────────────────────────────────────────────────────────────────────────
// Config — ONLY match the secret admin path, nothing else
// ─────────────────────────────────────────────────────────────────────────────

export const config = {
    matcher: ['/freesets-hq/:path*'],
};
