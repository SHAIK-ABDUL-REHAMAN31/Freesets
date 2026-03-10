import { NextResponse } from 'next/server';
import connectDB from '@/server/db/connect';
import Submission from '@/server/db/models/Submission.model';
import Prompt from '@/server/db/models/Prompt.model';
import { verifyAdminSession } from '@/server/utils/admin-session';
import { handleApiError } from '@/server/utils/error';
import { handleCORS, corsHeaders, getOrigin } from '@/lib/cors';
import { generalLimit, getClientIP } from '@/lib/rateLimit';

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONS handler
// ─────────────────────────────────────────────────────────────────────────────

export async function OPTIONS(req: Request) {
    return handleCORS(req) || new Response(null, { status: 204, headers: corsHeaders(getOrigin(req)) });
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/submissions/[id] — approve or reject a submission
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
        const body = await req.json();
        const { action, rejectionReason } = body;

        const submission = await Submission.findById(id).maxTimeMS(10000);
        if (!submission) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404, headers });
        }

        if (action === 'approve') {
            // Create a new prompt from the submission
            const prompt = await Prompt.create({
                title: submission.title,
                promptText: submission.promptText,
                negativePrompt: submission.negativePrompt,
                category: submission.category,
                subCategory: submission.subCategory,
                styleTags: submission.styleTags,
                aiTools: submission.aiTools,
                aspectRatio: submission.aspectRatio,
                outputImageUrl: submission.submittedImageUrl,
                cloudinaryPublicId: submission.cloudinaryPublicId,
                thumbnailUrl: submission.submittedImageUrl,
                status: 'published',
            });

            // Update submission status
            submission.status = 'approved';
            submission.approvedPromptId = prompt._id;
            await submission.save();

            return NextResponse.json(
                { success: true, message: 'Submission approved and published.' },
                { status: 200, headers },
            );
        }

        if (action === 'reject') {
            submission.status = 'rejected';
            submission.rejectionReason = rejectionReason || 'Does not meet quality standards.';
            await submission.save();

            return NextResponse.json(
                { success: true, message: 'Submission rejected.' },
                { status: 200, headers },
            );
        }

        return NextResponse.json(
            { error: 'Invalid action. Use "approve" or "reject".' },
            { status: 400, headers },
        );
    } catch (error) {
        return handleApiError(error);
    }
}
