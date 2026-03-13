// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export enum AITool {
    MIDJOURNEY = 'MIDJOURNEY',
    DALLE = 'DALLE',
    STABLE_DIFFUSION = 'STABLE_DIFFUSION',
    SORA = 'SORA',
    RUNWAY = 'RUNWAY',
    KLING = 'KLING',
    GEMINI = 'GEMINI',
    FIREFLY = 'FIREFLY',
}

export enum Category {
    AI_IMAGES = 'AI_IMAGES',
    VIDEO_PROMPTS = 'VIDEO_PROMPTS',
    PRODUCT_SHOOT = 'PRODUCT_SHOOT',
    PORTRAIT = 'PORTRAIT',
    ARCHITECTURE = 'ARCHITECTURE',
    FOOD = 'FOOD',
    LOGO = 'LOGO',
    TEXTURE = 'TEXTURE',
    MOVIE = 'MOVIE',
}

export enum AspectRatio {
    SQUARE = 'SQUARE',           // 1:1
    LANDSCAPE = 'LANDSCAPE',        // 16:9
    PORTRAIT_RATIO = 'PORTRAIT_RATIO',   // 9:16
    CLASSIC = 'CLASSIC',          // 4:3
}

export enum PromptStatus {
    PUBLISHED = 'PUBLISHED',
    PENDING = 'PENDING',
    REJECTED = 'REJECTED',
}

// ─────────────────────────────────────────────────────────────────────────────
// Full Prompt Document
// ─────────────────────────────────────────────────────────────────────────────

export interface IPrompt {
    id: string;
    title: string;
    promptText: string;
    negativePrompt?: string;
    outputImageUrl: string;
    outputVideoUrl?: string;
    cloudinaryPublicId: string;
    thumbnailUrl: string;
    imageWidth?: number;
    imageHeight?: number;
    category: Category;
    subCategory: string;
    styleTags: string[];
    aiTools: AITool[];
    aspectRatio: AspectRatio;
    isFreeDownload: boolean;
    isPremium: boolean;
    copyCount: number;
    downloadCount: number;
    status: PromptStatus;
    createdAt: Date;
    updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lightweight card for gallery grid (avoids shipping promptText to the client)
// ─────────────────────────────────────────────────────────────────────────────

export interface IPromptCard {
    id: string;
    title: string;
    promptText?: string;
    thumbnailUrl: string;
    imageWidth?: number;
    imageHeight?: number;
    outputVideoUrl?: string;
    category: Category;
    subCategory: string;
    styleTags: string[];
    aiTools: AITool[];
    aspectRatio: AspectRatio;
    isFreeDownload: boolean;
    isPremium: boolean;
    copyCount: number;
    downloadCount: number;
    status: PromptStatus;
    createdAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter / Query shape for prompt listings
// ─────────────────────────────────────────────────────────────────────────────

export interface PromptFilters {
    category?: Category;
    aiTools?: AITool[];
    aspectRatio?: AspectRatio;
    isPremium?: boolean;
    isFreeDownload?: boolean;
    sortBy?: 'popular' | 'newest' | 'downloads' | 'copies';
}
