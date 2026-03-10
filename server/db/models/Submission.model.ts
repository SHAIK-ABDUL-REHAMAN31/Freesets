import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// Constants (keep in sync with Prompt model & Category / AITool enums)
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

const SUBMISSION_STATUS_VALUES = ['pending', 'approved', 'rejected'] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ISubmissionDocument extends Document {
    title: string;
    promptText: string;
    negativePrompt?: string;
    category: (typeof CATEGORY_VALUES)[number];
    subCategory: string;
    styleTags: string[];
    aiTools: (typeof AI_TOOL_VALUES)[number][];
    aspectRatio: (typeof ASPECT_RATIO_VALUES)[number];
    submittedImageUrl: string;
    cloudinaryPublicId: string;
    notes?: string;
    status: (typeof SUBMISSION_STATUS_VALUES)[number];
    rejectionReason?: string;
    approvedPromptId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

const SubmissionSchema = new Schema<ISubmissionDocument>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        promptText: {
            type: String,
            required: [true, 'Prompt text is required'],
        },
        negativePrompt: {
            type: String,
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
        submittedImageUrl: {
            type: String,
            required: [true, 'Submitted image URL is required'],
        },
        cloudinaryPublicId: {
            type: String,
            required: [true, 'Cloudinary public ID is required'],
        },
        notes: {
            type: String,
            maxlength: [300, 'Notes cannot exceed 300 characters'],
        },
        status: {
            type: String,
            enum: { values: [...SUBMISSION_STATUS_VALUES], message: '{VALUE} is not a valid status' },
            default: 'pending',
        },
        rejectionReason: {
            type: String,
        },
        approvedPromptId: {
            type: Schema.Types.ObjectId,
            ref: 'Prompt',
        },
    },
    {
        timestamps: true,
    },
);

// ─────────────────────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────────────────────

// Admin review queue — pending first, newest at the top
SubmissionSchema.index({ status: 1, createdAt: -1 });

// ─────────────────────────────────────────────────────────────────────────────
// Export — safe for Next.js HMR
// ─────────────────────────────────────────────────────────────────────────────

const Submission: Model<ISubmissionDocument> =
    (mongoose.models.Submission as Model<ISubmissionDocument>) ||
    mongoose.model<ISubmissionDocument>('Submission', SubmissionSchema);

export default Submission;
