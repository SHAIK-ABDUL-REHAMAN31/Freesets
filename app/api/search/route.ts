import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/server/db/connect';
import { searchPrompts } from '@/server/services/prompt.service';
import { paginationSchema, validate } from '@/server/validators/prompt.validator';
import { buildPaginationMeta } from '@/server/utils/paginate';
import { handleApiError, VALIDATION_ERROR } from '@/server/utils/error';
import { handleCORS, corsHeaders, getOrigin } from '@/lib/cors';
import { searchLimit, getClientIP } from '@/lib/rateLimit';
import type { PaginatedResponse } from '@/types/api.types';
import type { IPromptCard } from '@/types/prompt.types';

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONS handler
// ─────────────────────────────────────────────────────────────────────────────

export async function OPTIONS(req: Request) {
    return handleCORS(req) || new Response(null, { status: 204, headers: corsHeaders(getOrigin(req)) });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/search?q=...&page=1&limit=20
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
    const origin = getOrigin(req);
    const headers = corsHeaders(origin);

    try {
        // Rate limit (stricter for search)
        const ip = getClientIP(req);
        const rl = searchLimit(ip);
        if (!rl.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please slow down.' },
                { status: 429, headers },
            );
        }

        await connectDB();

        // 1. Read & validate search query
        const { searchParams } = req.nextUrl;
        const q = searchParams.get('q')?.trim() ?? '';

        if (q.length < 2) {
            throw VALIDATION_ERROR(
                'Search query must be at least 2 characters',
            );
        }

        // 2. Parse & validate pagination
        const paginationResult = validate(paginationSchema, {
            page: searchParams.get('page') ?? undefined,
            limit: searchParams.get('limit') ?? undefined,
        });

        if (!paginationResult.success) {
            throw VALIDATION_ERROR(
                paginationResult.errors.map((e) => e.message).join(', '),
            );
        }

        const { page, limit } = paginationResult.data;

        // 3. Search prompts
        const { prompts, total } = await searchPrompts(q, page, limit);

        // 4. Build pagination metadata
        const pagination = buildPaginationMeta(page, limit, total);

        return NextResponse.json<PaginatedResponse<IPromptCard[]>>(
            {
                success: true,
                data: prompts as unknown as IPromptCard[],
                pagination,
            },
            { status: 200, headers },
        );
    } catch (error) {
        return handleApiError(error);
    }
}
