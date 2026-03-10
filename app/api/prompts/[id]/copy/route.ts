import { NextResponse } from 'next/server';
import connectDB from '@/server/db/connect';
import { getPromptById, incrementCopyCount } from '@/server/services/prompt.service';
import { handleApiError, NOT_FOUND } from '@/server/utils/error';
import { handleCORS, corsHeaders, getOrigin } from '@/lib/cors';
import { generalLimit, getClientIP } from '@/lib/rateLimit';
import type { ApiResponse } from '@/types/api.types';

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONS handler
// ─────────────────────────────────────────────────────────────────────────────

export async function OPTIONS(req: Request) {
    return handleCORS(req) || new Response(null, { status: 204, headers: corsHeaders(getOrigin(req)) });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/prompts/[id]/copy — increment copy count (public, no auth)
// ─────────────────────────────────────────────────────────────────────────────

interface CopyResponse {
    success: boolean;
}

export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> },
) {
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

        const { id: promptId } = await context.params;
        const prompt = await getPromptById(promptId);

        if (!prompt) {
            throw NOT_FOUND;
        }

        await incrementCopyCount(promptId);

        return NextResponse.json<ApiResponse<CopyResponse>>(
            {
                success: true,
                data: { success: true },
            },
            { status: 200, headers },
        );
    } catch (error) {
        return handleApiError(error);
    }
}
