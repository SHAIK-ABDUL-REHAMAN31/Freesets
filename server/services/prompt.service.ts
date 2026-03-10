import connectDB from '@/server/db/connect';
import Prompt, { IPrompt, IPromptDocument } from '@/server/db/models/Prompt.model';
import type { PromptFiltersInput } from '@/server/validators/prompt.validator';
import type { FilterQuery, SortOrder } from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// getPrompts — paginated, filtered listing
// ─────────────────────────────────────────────────────────────────────────────

interface GetPromptsResult {
    prompts: IPrompt[];
    total: number;
}

export async function getPrompts(
    filters: PromptFiltersInput,
    page: number,
    limit: number,
): Promise<GetPromptsResult> {
    await connectDB();

    // Build dynamic filter query — only published prompts are public
    const query: FilterQuery<IPromptDocument> = { status: 'published' };

    if (filters.category) query.category = filters.category;
    if (filters.aspectRatio) query.aspectRatio = filters.aspectRatio;
    if (filters.isPremium !== undefined) query.isPremium = filters.isPremium;
    if (filters.isFreeDownload !== undefined) query.isFreeDownload = filters.isFreeDownload;
    if (filters.aiTools && filters.aiTools.length > 0) {
        query.aiTools = { $in: filters.aiTools };
    }
    if (filters.search) {
        query.$text = { $search: filters.search };
    }

    // Sort mapping
    const sortMap: Record<string, Record<string, SortOrder>> = {
        popular: { copyCount: -1, downloadCount: -1 },
        newest: { createdAt: -1 },
        downloads: { downloadCount: -1 },
        copies: { copyCount: -1 },
    };
    const sort = sortMap[filters.sortBy ?? 'newest'];

    // Exclude promptText from list queries (lightweight cards)
    const skip = (page - 1) * limit;

    const [prompts, total] = await Promise.all([
        Prompt.find(query)
            .select('-negativePrompt -rejectionReason')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Prompt.countDocuments(query),
    ]);

    return { prompts, total };
}

// ─────────────────────────────────────────────────────────────────────────────
// getPromptById — full document
// ─────────────────────────────────────────────────────────────────────────────

export async function getPromptById(
    id: string,
): Promise<IPrompt | null> {
    await connectDB();

    return Prompt.findOne({ _id: id, status: 'published' }).lean() as Promise<IPrompt | null>;
}

// ─────────────────────────────────────────────────────────────────────────────
// searchPrompts — full-text search with pagination
// ─────────────────────────────────────────────────────────────────────────────

export async function searchPrompts(
    query: string,
    page: number,
    limit: number,
): Promise<GetPromptsResult> {
    await connectDB();

    const filter: FilterQuery<IPromptDocument> = {
        status: 'published',
        $text: { $search: query },
    };

    const skip = (page - 1) * limit;

    const [prompts, total] = await Promise.all([
        Prompt.find(filter)
            .select('-negativePrompt -rejectionReason')
            .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Prompt.countDocuments(filter),
    ]);

    return { prompts, total };
}

// ─────────────────────────────────────────────────────────────────────────────
// incrementCopyCount — atomically bump prompt copyCount
// ─────────────────────────────────────────────────────────────────────────────

export async function incrementCopyCount(promptId: string): Promise<void> {
    await connectDB();
    await Prompt.updateOne({ _id: promptId }, { $inc: { copyCount: 1 } });
}

// ─────────────────────────────────────────────────────────────────────────────
// incrementDownloadCount — atomically bump prompt downloadCount
// ─────────────────────────────────────────────────────────────────────────────

export async function incrementDownloadCount(promptId: string): Promise<void> {
    await connectDB();
    await Prompt.updateOne({ _id: promptId }, { $inc: { downloadCount: 1 } });
}
