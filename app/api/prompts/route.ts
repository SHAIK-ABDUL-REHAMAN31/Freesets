import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/server/db/connect';
import {
    promptFiltersSchema,
    paginationSchema,
    validate,
} from '@/server/validators/prompt.validator';
import { getPrompts } from '@/server/services/prompt.service';
import { buildPaginationMeta } from '@/server/utils/paginate';
import { handleApiError, VALIDATION_ERROR } from '@/server/utils/error';
import { handleCORS, corsHeaders, getOrigin } from '@/lib/cors';
import { generalLimit, getClientIP } from '@/lib/rateLimit';
import type { PaginatedResponse } from '@/types/api.types';
import type { IPromptCard } from '@/types/prompt.types';

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONS handler
// ─────────────────────────────────────────────────────────────────────────────

export async function OPTIONS(req: Request) {
    return handleCORS(req) || new Response(null, { status: 204, headers: corsHeaders(getOrigin(req)) });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/prompts — public, paginated prompt listing
// ─────────────────────────────────────────────────────────────────────────────

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

        await connectDB();

        const { searchParams } = new URL(req.url);

        // ── Parse query params into plain objects ────────────────────────
        const rawFilters: Record<string, unknown> = {};

        const category = searchParams.get('category');
        if (category) rawFilters.category = category;

        const aiTools = searchParams.getAll('aiTools');
        if (aiTools.length > 0) rawFilters.aiTools = aiTools;

        const aspectRatio = searchParams.get('aspectRatio');
        if (aspectRatio) rawFilters.aspectRatio = aspectRatio;

        const isPremium = searchParams.get('isPremium');
        if (isPremium !== null) rawFilters.isPremium = isPremium === 'true';

        const isFreeDownload = searchParams.get('isFreeDownload');
        if (isFreeDownload !== null) rawFilters.isFreeDownload = isFreeDownload === 'true';

        const sortBy = searchParams.get('sortBy');
        if (sortBy) rawFilters.sortBy = sortBy;

        const search = searchParams.get('search');
        if (search) rawFilters.search = search;

        // ── Validate filters ────────────────────────────────────────────
        const filtersResult = validate(promptFiltersSchema, rawFilters);

        if (!filtersResult.success) {
            throw VALIDATION_ERROR(
                filtersResult.errors.map((e) => e.message).join(', '),
            );
        }

        // ── Validate pagination ─────────────────────────────────────────
        const rawPagination = {
            page: searchParams.get('page') ?? undefined,
            limit: searchParams.get('limit') ?? undefined,
        };

        const paginationResult = validate(paginationSchema, rawPagination);

        if (!paginationResult.success) {
            throw VALIDATION_ERROR(
                paginationResult.errors.map((e) => e.message).join(', '),
            );
        }

        const { page, limit } = paginationResult.data;

        // ── Fetch prompts ───────────────────────────────────────────────
        const { prompts, total } = await getPrompts(filtersResult.data, page, limit);

        const pagination = buildPaginationMeta(page, limit, total);

        return NextResponse.json<PaginatedResponse<IPromptCard[]>>(
            {
                success: true,
                data: prompts as unknown as IPromptCard[],
                pagination,
            },
            {
                status: 200,
                headers: {
                    ...headers,
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
                    // Cache for 60 seconds on Vercel Edge
                    // Serve stale for 5 minutes while revalidating
                    // Repeat requests are INSTANT from cache
                },
            },
        );
    } catch (error) {
        return handleApiError(error);
    }
}
