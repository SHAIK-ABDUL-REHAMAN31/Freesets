import { NextResponse } from 'next/server';
import connectDB from '@/server/db/connect';
import Prompt from '@/server/db/models/Prompt.model';
import { getCloudinaryClient, DB_CATEGORY_TO_SLUG } from '@/server/cloudinary/client';
import { verifyAdminSession } from '@/server/utils/admin-session';
import { handleApiError } from '@/server/utils/error';
import { handleCORS, corsHeaders, getOrigin } from '@/lib/cors';
import { generalLimit, getClientIP } from '@/lib/rateLimit';
import { sanitizeObject } from '@/lib/sanitize';
import type { ApiResponse } from '@/types/api.types';
import type { IPrompt } from '@/server/db/models/Prompt.model';

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONS handler
// ─────────────────────────────────────────────────────────────────────────────

export async function OPTIONS(req: Request) {
    return handleCORS(req) || new Response(null, { status: 204, headers: corsHeaders(getOrigin(req)) });
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/prompts/[id] — update a prompt
// ─────────────────────────────────────────────────────────────────────────────

export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> },
) {
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

        const { id } = await context.params;
        const rawBody = await req.json();

        // Sanitize text fields in the update body
        const body = sanitizeObject(rawBody);

        const prompt = await Prompt.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        }).lean().maxTimeMS(10000);

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt not found' }, { status: 404, headers });
        }

        return NextResponse.json<ApiResponse<IPrompt>>(
            { success: true, data: prompt as IPrompt, message: 'Prompt updated.' },
            { status: 200, headers },
        );
    } catch (error) {
        return handleApiError(error);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/prompts/[id] — delete prompt + Cloudinary asset
// ─────────────────────────────────────────────────────────────────────────────

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> },
) {
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

        const { id } = await context.params;
        const prompt = await Prompt.findById(id).maxTimeMS(10000);

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt not found' }, { status: 404, headers });
        }

        // Delete from the correct Cloudinary account
        if (prompt.cloudinaryPublicId) {
            try {
                const slug = DB_CATEGORY_TO_SLUG[prompt.category] ?? '';
                if (slug) {
                    const cld = getCloudinaryClient(slug);
                    await cld.uploader.destroy(prompt.cloudinaryPublicId);
                }
            } catch (cloudErr) {
                console.error('[Cloudinary Delete Error]', cloudErr);
            }
        }

        // Delete from DB
        await Prompt.findByIdAndDelete(id).maxTimeMS(10000);

        return NextResponse.json(
            { success: true, message: 'Prompt deleted.' },
            { status: 200, headers },
        );
    } catch (error) {
        return handleApiError(error);
    }
}
