import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/server/db/connect';
import AdminSession from '@/server/db/models/AdminSession.model';
import { handleCORS, corsHeaders, getOrigin } from '@/lib/cors';
import { generalLimit, getClientIP } from '@/lib/rateLimit';

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin-auth/verify
// ─────────────────────────────────────────────────────────────────────────────

export async function OPTIONS(req: Request) {
    return handleCORS(req) || new Response(null, { status: 204, headers: corsHeaders(getOrigin(req)) });
}

export async function GET(req: NextRequest) {
    const origin = getOrigin(req);
    const headers = corsHeaders(origin);

    try {
        // Rate limit
        const ip = getClientIP(req);
        const rl = generalLimit(ip);
        if (!rl.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please slow down.' },
                { status: 429, headers },
            );
        }

        const token = req.cookies.get('fs_admin_token')?.value;

        if (!token) {
            return NextResponse.json(
                { authenticated: false },
                { status: 401, headers },
            );
        }

        await connectDB();

        const session = await AdminSession.findOne({
            token,
            expiresAt: { $gt: new Date() },
        }).lean().maxTimeMS(10000);

        if (!session) {
            return NextResponse.json(
                { authenticated: false },
                { status: 401, headers },
            );
        }

        return NextResponse.json(
            { authenticated: true },
            { status: 200, headers },
        );
    } catch (error) {
        console.error('[Admin Verify Error]', error);
        return NextResponse.json(
            { authenticated: false },
            { status: 500, headers },
        );
    }
}
