import { NextResponse } from 'next/server';
import connectDB from '@/server/db/connect';
import Submission from '@/server/db/models/Submission.model';
import { verifyAdminSession } from '@/server/utils/admin-session';
import { handleApiError } from '@/server/utils/error';
import { buildPaginationMeta } from '@/server/utils/paginate';
import { handleCORS, corsHeaders, getOrigin } from '@/lib/cors';
import { generalLimit, getClientIP } from '@/lib/rateLimit';

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONS handler
// ─────────────────────────────────────────────────────────────────────────────

export async function OPTIONS(req: Request) {
    return handleCORS(req) || new Response(null, { status: 204, headers: corsHeaders(getOrigin(req)) });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/submissions — list submissions
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
    const origin = getOrigin(req);
    const headers = corsHeaders(origin);

    try {
        const isAdmin = await verifyAdminSession();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
        }

        // Rate limit
        const ip = getClientIP(req);
        const rl = generalLimit(ip);
        if (!rl.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please slow down.' },
                { status: 429, headers },
            );
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
        const statusParam = searchParams.get('status') || 'pending';

        const query: any = {};
        if (statusParam !== 'all') query.status = statusParam;

        const skip = (page - 1) * limit;

        const [submissions, total] = await Promise.all([
            Submission.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .maxTimeMS(10000),
            Submission.countDocuments(query).maxTimeMS(10000),
        ]);

        const pagination = buildPaginationMeta(page, limit, total);

        return NextResponse.json(
            { success: true, data: submissions, pagination },
            { status: 200, headers },
        );
    } catch (error) {
        return handleApiError(error);
    }
}
