import { NextResponse } from 'next/server';
import connectDB from '@/server/db/connect';
import AdminSession from '@/server/db/models/AdminSession.model';
import { handleCORS, corsHeaders, getOrigin } from '@/lib/cors';
import { clearSecureCookie, ADMIN_COOKIE_NAME } from '@/lib/cookies';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin-auth/logout
// ─────────────────────────────────────────────────────────────────────────────

export async function OPTIONS(req: Request) {
    return handleCORS(req) || new Response(null, { status: 204, headers: corsHeaders(getOrigin(req)) });
}

export async function POST(req: Request) {
    const origin = getOrigin(req);
    const headers = corsHeaders(origin);

    try {
        // 1. Read the token cookie
        const cookieHeader = req.headers.get('cookie') || '';
        const tokenMatch = cookieHeader.match(/fs_admin_token=([^;]+)/);
        const token = tokenMatch?.[1];

        if (token) {
            // 2. Delete from MongoDB
            await connectDB();
            await AdminSession.deleteOne({ token });
        }

        // 3. Clear cookie
        const response = NextResponse.json({ success: true }, { status: 200, headers });
        clearSecureCookie(response, ADMIN_COOKIE_NAME);

        return response;
    } catch (error) {
        console.error('[Admin Logout Error]', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500, headers },
        );
    }
}
