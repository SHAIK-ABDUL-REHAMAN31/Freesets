import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/server/db/connect';
import { getPromptById } from '@/server/services/prompt.service';
import { handleApiError, NOT_FOUND } from '@/server/utils/error';
import { handleCORS, corsHeaders, getOrigin } from '@/lib/cors';
import { generalLimit, getClientIP } from '@/lib/rateLimit';
import type { ApiResponse } from '@/types/api.types';
import type { IPrompt as IPromptResponse } from '@/types/prompt.types';

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONS handler
// ─────────────────────────────────────────────────────────────────────────────

export async function OPTIONS(req: Request) {
    return handleCORS(req) || new Response(null, { status: 204, headers: corsHeaders(getOrigin(req)) });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/prompts/[id] — public single prompt detail
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
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

        const { id } = await params;
        const prompt = await getPromptById(id);

        if (!prompt) {
            throw NOT_FOUND;
        }

        // Build response
        const promptData: IPromptResponse = {
            id: prompt._id.toString(),
            title: prompt.title,
            promptText: prompt.promptText,
            negativePrompt: prompt.negativePrompt,
            outputImageUrl: prompt.outputImageUrl,
            outputVideoUrl: prompt.outputVideoUrl,
            cloudinaryPublicId: prompt.cloudinaryPublicId,
            thumbnailUrl: prompt.thumbnailUrl,
            category: prompt.category as unknown as IPromptResponse['category'],
            subCategory: prompt.subCategory,
            styleTags: prompt.styleTags,
            aiTools: prompt.aiTools as unknown as IPromptResponse['aiTools'],
            aspectRatio: prompt.aspectRatio as unknown as IPromptResponse['aspectRatio'],
            isFreeDownload: prompt.isFreeDownload,
            isPremium: prompt.isPremium,
            copyCount: prompt.copyCount,
            downloadCount: prompt.downloadCount,
            status: prompt.status as unknown as IPromptResponse['status'],
            createdAt: prompt.createdAt,
            updatedAt: prompt.updatedAt,
        };

        return NextResponse.json<ApiResponse<IPromptResponse>>(
            {
                success: true,
                data: promptData,
            },
            { status: 200, headers },
        );
    } catch (error) {
        return handleApiError(error);
    }
}
