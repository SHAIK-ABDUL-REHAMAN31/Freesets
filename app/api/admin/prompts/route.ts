import { NextResponse } from 'next/server';
import connectDB from '@/server/db/connect';
import Prompt from '@/server/db/models/Prompt.model';
import { verifyAdminSession } from '@/server/utils/admin-session';
import { handleApiError } from '@/server/utils/error';
import { buildPaginationMeta } from '@/server/utils/paginate';
import { handleCORS, corsHeaders, getOrigin } from '@/lib/cors';
import { generalLimit, getClientIP } from '@/lib/rateLimit';
import { sanitizeString, sanitizePromptText } from '@/lib/sanitize';
import type { IPrompt } from '@/server/db/models/Prompt.model';
import type { PaginatedResponse, ApiResponse } from '@/types/api.types';
import type { FilterQuery, SortOrder } from 'mongoose';
import type { IPromptDocument } from '@/server/db/models/Prompt.model';

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONS handler
// ─────────────────────────────────────────────────────────────────────────────

export async function OPTIONS(req: Request) {
    return handleCORS(req) || new Response(null, { status: 204, headers: corsHeaders(getOrigin(req)) });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/prompts — list ALL prompts (all statuses)
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
        const statusParam = searchParams.get('status');
        const searchQuery = searchParams.get('search');

        const query: FilterQuery<IPromptDocument> = {};
        if (statusParam) query.status = statusParam;
        if (searchQuery) query.$text = { $search: searchQuery };

        const sort: Record<string, SortOrder> = { createdAt: -1 };
        const skip = (page - 1) * limit;

        const [prompts, total] = await Promise.all([
            Prompt.find(query).sort(sort).skip(skip).limit(limit).lean<IPrompt[]>().maxTimeMS(10000),
            Prompt.countDocuments(query).maxTimeMS(10000),
        ]);

        const pagination = buildPaginationMeta(page, limit, total);

        return NextResponse.json<PaginatedResponse<IPrompt[]>>(
            { success: true, data: prompts, pagination },
            { status: 200, headers },
        );
    } catch (error) {
        return handleApiError(error);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/prompts — create a new prompt
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
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

        const body = await req.json();

        // Sanitize all text inputs
        const title = sanitizeString(body.title || '');
        const promptText = sanitizePromptText(body.promptText || '');
        const negativePrompt = sanitizePromptText(body.negativePrompt || '');
        const category = sanitizeString(body.category || '');
        const subCategory = sanitizeString(body.subCategory || '');
        const styleTags = Array.isArray(body.styleTags)
            ? body.styleTags.map((t: string) => sanitizeString(t))
            : [];
        const aiTools = Array.isArray(body.aiTools)
            ? body.aiTools.map((t: string) => sanitizeString(t))
            : [];

        // Non-text fields (don't sanitize URLs)
        const {
            aspectRatio,
            outputImageUrl,
            cloudinaryPublicId,
            cloudName,
            thumbnailUrl,
            outputVideoUrl,
            isFreeDownload,
            isPremium,
            status,
        } = body;

        // Basic validation
        if (!title || !promptText || !category || !subCategory || !aiTools?.length) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400, headers },
            );
        }

        if (!outputImageUrl || !cloudinaryPublicId || !thumbnailUrl || !cloudName) {
            return NextResponse.json(
                { error: 'Image fields (outputImageUrl, cloudinaryPublicId, thumbnailUrl, cloudName) are required' },
                { status: 400, headers },
            );
        }

        const prompt = await Prompt.create({
            title,
            promptText,
            negativePrompt,
            category,
            subCategory,
            styleTags,
            aiTools,
            aspectRatio: aspectRatio || '1:1',
            outputImageUrl,
            cloudinaryPublicId,
            cloudName,
            thumbnailUrl,
            outputVideoUrl,
            isFreeDownload: isFreeDownload ?? false,
            isPremium: isPremium ?? false,
            status: status || 'published',
        });

        return NextResponse.json<ApiResponse<IPrompt>>(
            {
                success: true,
                data: prompt.toObject(),
                message: 'Prompt created successfully.',
            },
            { status: 201, headers },
        );
    } catch (error) {
        return handleApiError(error);
    }
}
