'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = [
    'AI_IMAGES', 'VIDEO_PROMPTS', 'PRODUCT_SHOOT', 'PORTRAIT',
    'ARCHITECTURE', 'FOOD', 'LOGO', 'TEXTURE',
    'FASHION', 'WALLPAPER', 'MOVIE',
] as const;

const AI_TOOLS = [
    'MIDJOURNEY', 'DALLE', 'STABLE_DIFFUSION', 'SORA',
    'RUNWAY', 'KLING', 'GEMINI', 'FIREFLY',
] as const;

const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3'] as const;

/** Map DB category names → Cloudinary slug used in upload endpoint */
const CATEGORY_TO_SLUG: Record<string, string> = {
    AI_IMAGES: 'ai-images',
    PRODUCT_SHOOT: 'product-shoot',
    VIDEO_PROMPTS: 'video-prompts',
    PORTRAIT: 'portrait',
    ARCHITECTURE: 'architecture',
    FOOD: 'food-drink',
    LOGO: 'logo-brand',
    TEXTURE: 'texture',
    FASHION: 'fashion',
    WALLPAPER: 'wallpaper',
    MOVIE: 'movie',
};

/** Human-readable labels */
const CATEGORY_LABELS: Record<string, string> = {
    AI_IMAGES: 'AI Images',
    PRODUCT_SHOOT: 'Product Shoot',
    VIDEO_PROMPTS: 'Video Prompts',
    PORTRAIT: 'Portrait & Headshot',
    ARCHITECTURE: 'Architecture & Interior',
    FOOD: 'Food & Drink',
    LOGO: 'Logo & Brand',
    TEXTURE: 'Texture & Background',
    FASHION: 'Fashion & Style',
    WALLPAPER: 'Wallpaper & Poster',
    MOVIE: 'Movie & Cinema',
};

// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary account status (for the live dot indicator)
// ─────────────────────────────────────────────────────────────────────────────

interface CloudinaryStatus {
    slug: string;
    cloudName: string;
    configured: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AddPromptPage() {
    const router = useRouter();
    const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/freesets-hq';

    // Form state
    const [title, setTitle] = useState('');
    const [promptText, setPromptText] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [category, setCategory] = useState<string>('');
    const [subCategory, setSubCategory] = useState('');
    const [styleTagsInput, setStyleTagsInput] = useState('');
    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [aspectRatio, setAspectRatio] = useState<string>('1:1');
    const [videoUrl, setVideoUrl] = useState('');
    const [isFreeDownload, setIsFreeDownload] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [status, setStatus] = useState<'published' | 'pending'>('published');

    // Image upload state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedData, setUploadedData] = useState<{
        url: string;
        publicId: string;
        thumbnailUrl: string;
        cloudName: string;
        width: number;
        height: number;
    } | null>(null);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Cloudinary account statuses
    const [cloudinaryStatuses, setCloudinaryStatuses] = useState<
        Record<string, CloudinaryStatus>
    >({});

    // ── Fetch Cloudinary account statuses on mount ─────────────────────────
    useEffect(() => {
        fetch('/api/admin/cloudinary-status')
            .then((res) => res.json())
            .then((json) => {
                if (json.success) {
                    const map: Record<string, CloudinaryStatus> = {};
                    json.data.forEach((a: CloudinaryStatus) => {
                        map[a.slug] = a;
                    });
                    setCloudinaryStatuses(map);
                }
            })
            .catch(() => { });
    }, []);

    // Current category slug
    const currentSlug = category ? CATEGORY_TO_SLUG[category] ?? '' : '';
    const currentCloudinaryStatus = currentSlug
        ? cloudinaryStatuses[currentSlug]
        : null;
    const isCategorySelected = !!category;
    const isCloudinaryConfigured = currentCloudinaryStatus?.configured ?? false;
    const canUpload = isCategorySelected && isCloudinaryConfigured;

    // ── Handle image selection ─────────────────────────────────────────────
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size validation
        const isVideo = file.type.startsWith('video/');
        const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
        
        if (file.size > maxSize) {
            setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max size: ${isVideo ? '100MB' : '10MB'}.`);
            // Clear input
            e.target.value = '';
            return;
        }

        setError(''); // Clear previous error
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setUploadedData(null); // Reset previous upload
    };

    // ── Toggle AI tool ────────────────────────────────────────────────────
    const toggleTool = (tool: string) => {
        setSelectedTools((prev) =>
            prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool],
        );
    };

    // ── Category change resets upload ─────────────────────────────────────
    const handleCategoryChange = (newCategory: string) => {
        setCategory(newCategory);
        // If category changes, reset upload data since it would be in the wrong account
        if (uploadedData) {
            setUploadedData(null);
            setImageFile(null);
            setImagePreview(null);
        }
    };

    // ── Submit ────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!title.trim()) return setError('Title is required');
        if (!promptText.trim()) return setError('Prompt text is required');
        if (!category) return setError('Category is required');
        if (selectedTools.length === 0) return setError('Select at least one AI tool');
        if (!subCategory.trim()) return setError('Sub-category is required');
        if (!imageFile && !uploadedData) return setError('Image is required');

        setSaving(true);

        try {
            let imageData = uploadedData;

            // 1. Upload image to the category-specific Cloudinary account
            if (!imageData) {
                setUploading(true);
                const slug = CATEGORY_TO_SLUG[category];
                
                // Fetch secure upload signature
                const sigRes = await fetch('/api/upload/signature', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category: slug }),
                });

                if (!sigRes.ok) {
                    const sigErr = await sigRes.json();
                    throw new Error(sigErr.error || 'Failed to initialize upload');
                }

                const sigData = await sigRes.json();

                // Upload directly to Cloudinary bypassing Vercel limits
                const formData = new FormData();
                formData.append('file', imageFile!);
                formData.append('api_key', sigData.apiKey);
                formData.append('timestamp', String(sigData.timestamp));
                formData.append('signature', sigData.signature);
                formData.append('folder', sigData.folder);

                const cldRes = await fetch(
                    `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`,
                    { method: 'POST', body: formData }
                );

                if (!cldRes.ok) {
                    const cldErr = await cldRes.json();
                    throw new Error(cldErr.error?.message || 'Cloudinary upload failed');
                }

                const cldData = await cldRes.json();
                
                // Get extension correctly for videos vs images
                const isVideo = imageFile!.type.startsWith('video/');
                const thumbnailUrl = isVideo
                    ? `https://res.cloudinary.com/${sigData.cloudName}/video/upload/${cldData.public_id}.jpg`
                    : `https://res.cloudinary.com/${sigData.cloudName}/image/upload/c_scale,w_400,f_webp,q_80/${cldData.public_id}`;

                imageData = {
                    url: cldData.secure_url,
                    publicId: cldData.public_id,
                    thumbnailUrl: thumbnailUrl,
                    cloudName: sigData.cloudName,
                    width: cldData.width || 0,
                    height: cldData.height || 0,
                };
                
                setUploadedData(imageData);
                setUploading(false);
            }

            // 2. Parse style tags
            const styleTags = styleTagsInput
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);

            // 3. Create prompt
            const body = {
                title,
                promptText,
                negativePrompt: negativePrompt || undefined,
                category,
                subCategory,
                styleTags,
                aiTools: selectedTools,
                aspectRatio,
                outputImageUrl: imageData!.url,
                cloudinaryPublicId: imageData!.publicId,
                cloudName: imageData!.cloudName,
                thumbnailUrl: imageData!.thumbnailUrl,
                outputVideoUrl: videoUrl || undefined,
                isFreeDownload,
                isPremium,
                status,
                imageWidth: imageData!.width || undefined,
                imageHeight: imageData!.height || undefined,
            };

            const res = await fetch('/api/admin/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to create prompt');
            }

            // Success — redirect to prompts list
            router.push(`${adminPath}/prompts`);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
            setUploading(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-display font-bold text-white">Add New Prompt</h1>
                <p className="text-sm text-white/40 mt-1">
                    Fill in all the details below to create a new prompt
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <Field label="Title">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={80}
                        className="admin-input"
                        placeholder="e.g. Neon Cyberpunk Alleyway"
                    />
                </Field>

                {/* Prompt Text */}
                <Field label="Prompt Text">
                    <textarea
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        rows={5}
                        className="admin-input resize-y"
                        placeholder="The full prompt text..."
                    />
                </Field>

                {/* Negative Prompt */}
                <Field label="Negative Prompt" optional>
                    <textarea
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        rows={2}
                        className="admin-input resize-y"
                        placeholder="blurry, low quality, watermark..."
                    />
                </Field>

                {/* Category + Sub-category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Category">
                        <select
                            value={category}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="admin-input"
                        >
                            <option value="">— Select category —</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                    {CATEGORY_LABELS[cat] || cat.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>

                        {/* Cloudinary account indicator */}
                        {isCategorySelected && (
                            <div className="mt-2 flex items-center gap-2 text-xs">
                                <span
                                    className={`w-2 h-2 rounded-full flex-shrink-0 ${isCloudinaryConfigured
                                        ? 'bg-green-400'
                                        : 'bg-red-400'
                                        }`}
                                />
                                <span className="text-white/40">
                                    Cloudinary Account:{' '}
                                    <span
                                        className={
                                            isCloudinaryConfigured
                                                ? 'text-green-400'
                                                : 'text-red-400'
                                        }
                                    >
                                        {isCloudinaryConfigured
                                            ? currentCloudinaryStatus?.cloudName
                                            : 'Not configured'}
                                    </span>
                                </span>
                            </div>
                        )}
                    </Field>

                    <Field label="Sub-category">
                        <input
                            type="text"
                            value={subCategory}
                            onChange={(e) => setSubCategory(e.target.value)}
                            className="admin-input"
                            placeholder="e.g. Sci-Fi, Studio, Baking"
                        />
                    </Field>
                </div>

                {/* Style Tags */}
                <Field label="Style Tags" optional>
                    <input
                        type="text"
                        value={styleTagsInput}
                        onChange={(e) => setStyleTagsInput(e.target.value)}
                        className="admin-input"
                        placeholder="cyberpunk, neon, cinematic (comma separated)"
                    />
                </Field>

                {/* AI Tools */}
                <Field label="AI Tools">
                    <div className="flex flex-wrap gap-2">
                        {AI_TOOLS.map((tool) => (
                            <button
                                key={tool}
                                type="button"
                                onClick={() => toggleTool(tool)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedTools.includes(tool)
                                    ? 'bg-[#7C3AED]/20 border-[#7C3AED]/40 text-[#A78BFA]'
                                    : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/60'
                                    }`}
                            >
                                {tool.replace(/_/g, ' ')}
                            </button>
                        ))}
                    </div>
                </Field>

                {/* Aspect Ratio */}
                <Field label="Aspect Ratio">
                    <div className="flex gap-2">
                        {ASPECT_RATIOS.map((ar) => (
                            <button
                                key={ar}
                                type="button"
                                onClick={() => setAspectRatio(ar)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${aspectRatio === ar
                                    ? 'bg-[#7C3AED]/20 border-[#7C3AED]/40 text-[#A78BFA]'
                                    : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/60'
                                    }`}
                            >
                                {ar}
                            </button>
                        ))}
                    </div>
                </Field>

                {/* Image Upload */}
                <Field label="Output Image">
                    <div className="flex items-start gap-4">
                        <div className="relative">
                            <label
                                className={`block ${canUpload ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                                title={
                                    !isCategorySelected
                                        ? 'Select a category first'
                                        : !isCloudinaryConfigured
                                            ? 'Cloudinary account not configured for this category'
                                            : 'Click to upload'
                                }
                            >
                                <div className={`w-32 h-32 rounded-xl bg-white/[0.04] border border-dashed flex items-center justify-center transition-colors overflow-hidden ${canUpload
                                    ? 'border-white/10 hover:border-[#7C3AED]/40'
                                    : 'border-white/5'
                                    }`}>
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-white/20 text-xs text-center px-2">
                                            {!isCategorySelected
                                                ? 'Select category first'
                                                : !isCloudinaryConfigured
                                                    ? 'Account not set'
                                                    : 'Click to upload'}
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    disabled={!canUpload}
                                />
                            </label>
                        </div>

                        <div className="text-xs text-white/30 pt-2 space-y-1">
                            <p>Accepted: JPEG, PNG, WebP</p>
                            <p>Max size: 10 MB</p>
                            {!isCategorySelected && (
                                <p className="text-yellow-400/70 mt-2">
                                    ⚠ Select a category first to enable upload
                                </p>
                            )}
                            {isCategorySelected && !isCloudinaryConfigured && (
                                <p className="text-red-400/70 mt-2">
                                    ⚠ Cloudinary account for &quot;{CATEGORY_LABELS[category]}&quot; is not configured yet
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Upload confirmation badge */}
                    {uploadedData && (
                        <div className="mt-3 px-3 py-2 bg-green-500/5 border border-green-500/10 rounded-lg space-y-1">
                            <p className="text-xs text-green-400">
                                ✓ Stored in: <strong>{CATEGORY_LABELS[category]}</strong> Cloudinary account
                            </p>
                            <p className="text-[11px] text-white/30">
                                Cloud: {uploadedData.cloudName}
                            </p>
                        </div>
                    )}
                </Field>

                {/* Video URL */}
                <Field label="Video URL" optional>
                    <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="admin-input"
                        placeholder="https://..."
                    />
                </Field>

                {/* Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ToggleField
                        label="Free Download"
                        checked={isFreeDownload}
                        onChange={setIsFreeDownload}
                    />
                    <ToggleField
                        label="Premium / Pro"
                        checked={isPremium}
                        onChange={setIsPremium}
                    />
                </div>

                {/* Status */}
                <Field label="Status">
                    <div className="flex gap-2">
                        {(['published', 'pending'] as const).map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setStatus(s)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-all ${status === s
                                    ? 'bg-[#7C3AED]/20 border-[#7C3AED]/40 text-[#A78BFA]'
                                    : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/60'
                                    }`}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </Field>

                {/* Error */}
                {error && (
                    <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-white/5 disabled:text-white/20 text-white text-sm font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                    >
                        {uploading
                            ? 'Uploading image...'
                            : saving
                                ? 'Creating...'
                                : 'Create Prompt'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-white/50 text-sm font-medium rounded-lg border border-white/[0.06] transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            {/* Shared admin input styles */}
            <style jsx global>{`
                .admin-input {
                    width: 100%;
                    padding: 0.625rem 0.875rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 0.5rem;
                    color: white;
                    font-size: 0.875rem;
                    outline: none;
                    transition: border-color 0.15s;
                }
                .admin-input:focus {
                    border-color: rgba(124, 58, 237, 0.4);
                }
                .admin-input::placeholder {
                    color: rgba(255, 255, 255, 0.15);
                }
                .admin-input option {
                    background: #1A1A1A;
                    color: white;
                }
            `}</style>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function Field({
    label,
    optional,
    children,
}: {
    label: string;
    optional?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                {label}
                {optional && (
                    <span className="text-white/20 ml-1 normal-case tracking-normal font-normal">
                        (optional)
                    </span>
                )}
            </label>
            {children}
        </div>
    );
}

function ToggleField({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
            <span className="text-sm text-white/60">{label}</span>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-[#7C3AED]' : 'bg-white/10'
                    }`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'
                        }`}
                />
            </button>
        </div>
    );
}
