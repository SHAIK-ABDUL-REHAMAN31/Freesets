import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// Constants (mirror the TS enums so the DB stays in sync)
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_VALUES = [
    'AI_IMAGES',
    'VIDEO_PROMPTS',
    'PRODUCT_SHOOT',
    'PORTRAIT',
    'ARCHITECTURE',
    'FOOD',
    'LOGO',
    'TEXTURE',
    'FASHION',
    'WALLPAPER',
    'MOVIE',
] as const;

const AI_TOOL_VALUES = [
    'MIDJOURNEY',
    'DALLE',
    'STABLE_DIFFUSION',
    'SORA',
    'RUNWAY',
    'KLING',
    'GEMINI',
    'FIREFLY',
] as const;

const ASPECT_RATIO_VALUES = ['1:1', '16:9', '9:16', '4:3'] as const;

const STATUS_VALUES = ['published', 'pending', 'rejected'] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Plain data shape — safe for lean() results and API responses */
export interface IPrompt {
    _id: Types.ObjectId;
    title: string;
    promptText: string;
    negativePrompt?: string;
    outputImageUrl: string;
    outputVideoUrl?: string;
    cloudinaryPublicId: string;
    cloudName: string;
    thumbnailUrl: string;
    imageWidth?: number;
    imageHeight?: number;
    category: (typeof CATEGORY_VALUES)[number];
    subCategory: string;
    styleTags: string[];
    aiTools: (typeof AI_TOOL_VALUES)[number][];
    aspectRatio: (typeof ASPECT_RATIO_VALUES)[number];
    isFreeDownload: boolean;
    isPremium: boolean;
    copyCount: number;
    downloadCount: number;
    status: (typeof STATUS_VALUES)[number];
    rejectionReason?: string;
    createdAt: Date;
    updatedAt: Date;
}

/** Full Mongoose document — has .save(), .populate(), etc. */
export interface IPromptDocument extends Document, IPrompt { }

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

const PromptSchema = new Schema<IPromptDocument>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [80, 'Title cannot exceed 80 characters'],
        },
        promptText: {
            type: String,
            required: [true, 'Prompt text is required'],
        },
        negativePrompt: {
            type: String,
        },
        outputImageUrl: {
            type: String,
            required: [true, 'Output image URL is required'],
        },
        outputVideoUrl: {
            type: String,
        },
        cloudinaryPublicId: {
            type: String,
            required: [true, 'Cloudinary public ID is required'],
        },
        cloudName: {
            type: String,
            required: [true, 'Cloudinary cloud name is required'],
        },
        thumbnailUrl: {
            type: String,
            required: [true, 'Thumbnail URL is required'],
        },
        imageWidth: {
            type: Number,
            required: false,
        },
        imageHeight: {
            type: Number,
            required: false,
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: { values: [...CATEGORY_VALUES], message: '{VALUE} is not a valid category' },
        },
        subCategory: {
            type: String,
            required: [true, 'Sub-category is required'],
        },
        styleTags: {
            type: [String],
            default: [],
        },
        aiTools: {
            type: [{ type: String, enum: { values: [...AI_TOOL_VALUES], message: '{VALUE} is not a valid AI tool' } }],
            default: [],
        },
        aspectRatio: {
            type: String,
            enum: { values: [...ASPECT_RATIO_VALUES], message: '{VALUE} is not a valid aspect ratio' },
            default: '1:1',
        },
        isFreeDownload: {
            type: Boolean,
            default: false,
        },
        isPremium: {
            type: Boolean,
            default: false,
        },
        copyCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        downloadCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        status: {
            type: String,
            enum: { values: [...STATUS_VALUES], message: '{VALUE} is not a valid status' },
            default: 'pending',
        },
        rejectionReason: {
            type: String,
        },
    },
    {
        timestamps: true,
    },
);

// ─────────────────────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────────────────────

// Listing pages: filter by category + status
PromptSchema.index({ category: 1, status: 1 });

// Feed / admin queue: newest pending or published first
PromptSchema.index({ status: 1, createdAt: -1 });

// Tag-based browsing
PromptSchema.index({ styleTags: 1 });

// Full-text search on title and body
PromptSchema.index(
    { title: 'text', promptText: 'text' },
    { weights: { title: 10, promptText: 1 }, name: 'prompt_text_search' },
);

// ─────────────────────────────────────────────────────────────────────────────
// Export — safe for Next.js HMR
// ─────────────────────────────────────────────────────────────────────────────

const Prompt: Model<IPromptDocument> =
    (mongoose.models.Prompt as Model<IPromptDocument>) ||
    mongoose.model<IPromptDocument>('Prompt', PromptSchema);

export default Prompt;
