'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import type { IPrompt, IPromptCard } from '@/types/prompt.types';
import { AIToolBadge } from './AIToolBadge';
import { CopyButton } from './CopyButton';
import { PromptGrid } from './PromptGrid';
import { SidebarAd } from '@/components/ads/SidebarAd';
import { getPreviewUrl } from '@/server/cloudinary/transform';

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

function ChevronRightIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={cn('size-3', className)}>
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}

function ChevronDownIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={cn('size-4', className)}>
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}

function DownloadIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={cn('size-4', className)}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    );
}

function SpinnerIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={cn('size-4 animate-spin', className)}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}

function CopyCountIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={cn('size-3.5', className)}>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
    );
}

function EyeIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={cn('size-3.5', className)}>
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Aspect Ratio labels
// ─────────────────────────────────────────────────────────────────────────────

const ASPECT_LABELS: Record<string, string> = {
    SQUARE: '1:1',
    LANDSCAPE: '16:9',
    PORTRAIT_RATIO: '9:16',
    CLASSIC: '4:3',
};

// ─────────────────────────────────────────────────────────────────────────────
// Category formatting
// ─────────────────────────────────────────────────────────────────────────────

function formatCategory(cat: string): string {
    return cat
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompt text keyword highlighting
// ─────────────────────────────────────────────────────────────────────────────

const STYLE_KEYWORDS = [
    'cinematic', 'ultra realistic', '8k', '4k', 'photorealistic', 'hyperrealistic',
    'detailed', 'sharp focus', 'bokeh', 'dramatic lighting', 'volumetric',
    'unreal engine', 'octane render', 'studio lighting', 'natural lighting',
    'golden hour', 'trending on artstation', 'concept art', 'digital painting',
    'masterpiece', 'highly detailed', 'intricate', 'elegant',
];

function highlightPrompt(text: string): React.ReactNode[] {
    // Build a regex from all keywords (case-insensitive)
    const escaped = STYLE_KEYWORDS.map((k) =>
        k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    );
    const re = new RegExp(`(${escaped.join('|')})`, 'gi');

    const parts = text.split(re);

    return parts.map((part, i) => {
        const isKeyword = STYLE_KEYWORDS.some(
            (kw) => kw.toLowerCase() === part.toLowerCase(),
        );
        if (isKeyword) {
            return (
                <span key={i} className="text-brand-light/80">
                    {part}
                </span>
            );
        }
        return <span key={i}>{part}</span>;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat formatter
// ─────────────────────────────────────────────────────────────────────────────

function formatStat(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface PromptDetailProps {
    prompt: IPrompt;
    /** Related prompts for the "You might also like" section */
    relatedPrompts?: IPromptCard[];
    className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function PromptDetail({
    prompt,
    relatedPrompts = [],
    className,
}: PromptDetailProps) {
    const [negativeOpen, setNegativeOpen] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // ── Download handler (direct image download, no auth) ─────────────────────
    const handleDownload = useCallback(async () => {
        setIsDownloading(true);
        try {
            const imageUrl = prompt.outputImageUrl;
            // Fetch the image as a blob and trigger download
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${prompt.title.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Download started!', {
                style: { background: '#1A1A1A', color: '#F5F5F5', border: '1px solid #2A2A2A' },
            });
        } catch {
            toast.error('Download failed. Please try again.', {
                style: { background: '#1A1A1A', color: '#F5F5F5', border: '1px solid #2A2A2A' },
            });
        } finally {
            setIsDownloading(false);
        }
    }, [prompt.outputImageUrl, prompt.title]);

    // ═══════════════════════════════════════════════════════════════════════════
    // Render
    // ═══════════════════════════════════════════════════════════════════════════

    return (
        <div className={cn('w-full max-w-7xl mx-auto px-4 md:px-6', className)}>
            {/* ══════════════════════════════════════════════════════════════════════
          TWO COLUMN LAYOUT
      ══════════════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-10">

                {/* ── LEFT COLUMN: Image / Video ─────────────────────────────────── */}
                <div className="space-y-3">
                    {prompt.outputVideoUrl ? (
                        /* Video player */
                        <div className="relative w-full rounded-xl overflow-hidden bg-surface border border-surface-border">
                            <video
                                src={prompt.outputVideoUrl}
                                controls
                                playsInline
                                preload="metadata"
                                poster={prompt.outputImageUrl}
                                className="w-full"
                            >
                                Your browser does not support the video element.
                            </video>
                        </div>
                    ) : (
                        /* Image — served at 1600px + q_100 + dpr_auto for retina */
                        <div className="relative w-full rounded-xl overflow-hidden bg-surface border border-surface-border">
                            <img
                                src={
                                    prompt.cloudinaryPublicId && prompt.cloudName
                                        ? getPreviewUrl(prompt.cloudinaryPublicId, prompt.cloudName)
                                        : prompt.outputImageUrl
                                }
                                alt={prompt.title}
                                width={prompt.imageWidth || 1600}
                                height={prompt.imageHeight || 1200}
                                loading="eager"
                                decoding="sync"
                                className="w-full h-auto block rounded-xl"
                                style={{ imageRendering: 'auto' }}
                            />
                        </div>
                    )}

                    {/* Caption */}
                    <p className="text-xs text-white/25 text-center italic">
                        AI-generated output — your result may vary slightly
                    </p>
                </div>

                {/* ── RIGHT COLUMN: Details (sticky on desktop) ──────────────────── */}
                <div className="lg:sticky lg:top-20 lg:self-start space-y-5">

                    {/* ── Breadcrumb ────────────────────────────────────────────────── */}
                    <nav className="flex items-center gap-1.5 text-xs text-white/40">
                        <Link
                            href={`/?category=${prompt.category}`}
                            className="hover:text-white/70 transition-colors"
                        >
                            {formatCategory(prompt.category)}
                        </Link>
                        <ChevronRightIcon className="text-white/20" />
                        <span className="text-white/60">{prompt.subCategory}</span>
                    </nav>

                    {/* ── Title ─────────────────────────────────────────────────────── */}
                    <h1 className="font-display text-xl md:text-2xl font-bold text-white leading-tight">
                        {prompt.title}
                    </h1>

                    {/* ── AI Tool badges ────────────────────────────────────────────── */}
                    {prompt.aiTools.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {prompt.aiTools.map((tool) => (
                                <AIToolBadge key={tool} tool={tool} />
                            ))}
                        </div>
                    )}

                    {/* ── Aspect ratio + style tags ─────────────────────────────────── */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className={cn(
                                'inline-flex items-center px-2 py-0.5 rounded-md',
                                'text-[10px] font-semibold tracking-wider uppercase',
                                'bg-white/5 text-white/50',
                                'ring-1 ring-inset ring-white/10',
                            )}
                        >
                            {ASPECT_LABELS[prompt.aspectRatio] ?? prompt.aspectRatio}
                        </span>
                        {prompt.styleTags.slice(0, 5).map((tag) => (
                            <span
                                key={tag}
                                className={cn(
                                    'inline-flex items-center px-2 py-0.5 rounded-md',
                                    'text-[10px] font-medium tracking-wide',
                                    'bg-white/[0.03] text-white/35',
                                    'ring-1 ring-inset ring-white/[0.06]',
                                )}
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>

                    {/* ── Divider ───────────────────────────────────────────────────── */}
                    <div className="h-px bg-surface-border" />

                    {/* ══════════════════════════════════════════════════════════════════
              THE PROMPT BOX
          ══════════════════════════════════════════════════════════════════ */}
                    <div
                        id="prompt-box"
                        className={cn(
                            'relative rounded-xl overflow-hidden',
                            'bg-[#0D0D0D] border border-surface-border',
                        )}
                    >
                        {/* Prompt text — always fully visible (no premium gate) */}
                        <div className="p-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                            <pre className="font-mono text-sm text-white/80 leading-relaxed whitespace-pre-wrap break-words">
                                {highlightPrompt(prompt.promptText)}
                            </pre>
                        </div>
                    </div>

                    {/* ── Copy button (full width) ──────────────────────────────────── */}
                    <CopyButton
                        promptId={prompt.id}
                        promptText={prompt.promptText}
                        className="w-full"
                    />

                    {/* ── Negative prompt (collapsible) ─────────────────────────────── */}
                    {prompt.negativePrompt && (
                        <div className="rounded-xl border border-surface-border overflow-hidden">
                            <button
                                onClick={() => setNegativeOpen((o) => !o)}
                                className={cn(
                                    'flex items-center justify-between w-full',
                                    'px-4 py-3 text-sm font-medium text-white/60',
                                    'hover:text-white/80 hover:bg-white/[0.02]',
                                    'transition-colors duration-150',
                                )}
                            >
                                Negative Prompt
                                <ChevronDownIcon
                                    className={cn(
                                        'text-white/30 transition-transform duration-200',
                                        negativeOpen && 'rotate-180',
                                    )}
                                />
                            </button>
                            {negativeOpen && (
                                <div className="px-4 pb-4">
                                    <pre className="font-mono text-xs text-white/50 leading-relaxed whitespace-pre-wrap break-words">
                                        {prompt.negativePrompt}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Download section (no auth required) ─────────────────────── */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span
                                className={cn(
                                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md',
                                    'text-[10px] font-bold tracking-wider uppercase',
                                    'bg-emerald-500/10 text-emerald-400',
                                    'ring-1 ring-inset ring-emerald-500/20',
                                )}
                            >
                                <DownloadIcon className="size-2.5" />
                                Free Download
                            </span>
                        </div>

                        <button
                            id="download-btn"
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className={cn(
                                'w-full h-10 rounded-lg',
                                'inline-flex items-center justify-center gap-2',
                                'text-sm font-semibold tracking-wide',
                                'bg-emerald-500/10 text-emerald-400',
                                'ring-1 ring-inset ring-emerald-500/25',
                                'hover:bg-emerald-500/15 hover:text-emerald-300',
                                'active:scale-[0.98]',
                                'disabled:opacity-50 disabled:pointer-events-none',
                                'transition-all duration-200 ease-out',
                            )}
                        >
                            {isDownloading ? (
                                <>
                                    <SpinnerIcon className="text-emerald-400" />
                                    Downloading…
                                </>
                            ) : (
                                <>
                                    <DownloadIcon />
                                    Download Image
                                </>
                            )}
                        </button>
                    </div>

                    {/* ── Divider ───────────────────────────────────────────────────── */}
                    <div className="h-px bg-surface-border" />

                    {/* ── Stats row ─────────────────────────────────────────────────── */}
                    <div className="flex items-center gap-5 text-xs text-white/30">
                        <span className="inline-flex items-center gap-1.5">
                            <CopyCountIcon />
                            {formatStat(prompt.copyCount)} copies
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <DownloadIcon className="size-3.5" />
                            {formatStat(prompt.downloadCount)} downloads
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <EyeIcon />
                            — views
                        </span>
                    </div>

                    {/* ── Sidebar ad ──────────────────────────────────────────────────── */}
                    <SidebarAd slotId={`prompt-${prompt.id}`} className="mt-4" />
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════════
          RELATED PROMPTS (full width below)
      ══════════════════════════════════════════════════════════════════════ */}
            {relatedPrompts.length > 0 && (
                <section className="mt-16 space-y-6">
                    <h2 className="font-display text-lg font-bold text-white/80">
                        You might also like
                    </h2>
                    <PromptGrid
                        prompts={relatedPrompts}
                        isLoading={false}
                        hasMore={false}
                        onLoadMore={() => { }}
                    />
                </section>
            )}
        </div>
    );
}

export type { PromptDetailProps };
