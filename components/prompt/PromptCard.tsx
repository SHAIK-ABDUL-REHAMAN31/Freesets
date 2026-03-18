'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { IPromptCard } from '@/types/prompt.types';
import { getCardUrl } from '@/server/cloudinary/transform';

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

function CopyIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
    );
}

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function DownloadIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export interface PromptCardProps {
    prompt: IPromptCard;
}

export function PromptCard({ prompt }: PromptCardProps) {
    const fallbackImage = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';

    const [imageLoaded, setImageLoaded] = useState(false);
    const [copied, setCopied] = useState(false);

    // Resolve the best image URL:
    //   • If the card already has a cloudinaryPublicId + cloudName → build
    //     the high-quality getCardUrl (800px · f_auto · q_100 · dpr_2.0)
    //   • Otherwise fall back to whatever thumbnailUrl was stored in the DB
    //     (still better than nothing)
    const resolvedSrc =
        prompt.cloudinaryPublicId && prompt.cloudName
            ? getCardUrl(prompt.cloudinaryPublicId, prompt.cloudName)
            : prompt.thumbnailUrl || fallbackImage;

    const [imgSrc, setImgSrc] = useState(resolvedSrc);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(prompt.promptText || '');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="pin-card group relative w-full overflow-hidden rounded-xl cursor-pointer prompt-card">

            {/* ── Dark shimmer placeholder while full-res image loads ────────── */}
            {!imageLoaded && (
                <div
                    className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 animate-pulse rounded-xl"
                    style={{
                        aspectRatio: `${prompt.imageWidth || 1} / ${prompt.imageHeight || 1}`,
                    }}
                />
            )}

            {/* ── The image — plain <img> tag so Next.js pipeline is bypassed ── */}
            {/* We use getCardUrl which already applies the best Cloudinary         */}
            {/* transformation (q_100, f_auto, dpr_2.0, w_800, fl_progressive).    */}
            {/* A Next.js <Image> would re-compress on top of that = quality loss. */}
            <div className="image-wrapper w-full">
                <img
                    src={imgSrc}
                    alt={prompt.title}
                    width={prompt.imageWidth || 800}
                    height={prompt.imageHeight || 1000}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImgSrc(fallbackImage)}
                    className={cn(
                        'w-full h-auto block transition-all duration-500 ease-out',
                        'group-hover:scale-105',
                        imageLoaded ? 'opacity-100' : 'opacity-0',
                    )}
                    style={{ imageRendering: 'auto', transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                />
            </div>

            {/* ── Hover overlay (Pinterest gradient) ─── */}
            <div className="pin-card-overlay rounded-xl" />

            {/* ── Download — top right on hover (if free) ─── */}
            {prompt.isFreeDownload && (
                <div className="pin-card-download">
                    <button
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-white/90 hover:bg-white text-zinc-800 transition-colors shadow-md"
                        title="Download"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <DownloadIcon className="size-4" />
                    </button>
                </div>
            )}

            {/* ── Title + Prompt text + Copy button — visible on hover ────────── */}
            <div className="pin-card-actions">
                {/* Title */}
                <h3 className="text-sm font-semibold text-white leading-snug line-clamp-1 mb-0.5">
                    {prompt.title}
                </h3>

                {/* Prompt text */}
                {prompt.promptText && (
                    <p className="text-[11px] text-white/70 leading-relaxed line-clamp-2 mb-2">
                        {prompt.promptText}
                    </p>
                )}

                {/* Copy button */}
                <button
                    onClick={handleCopy}
                    className={cn(
                        'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 shadow-lg',
                        copied
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white text-zinc-900 hover:bg-zinc-100'
                    )}
                >
                    {copied ? (
                        <>
                            <CheckIcon className="size-3.5" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <CopyIcon className="size-3.5" />
                            Copy Prompt
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default PromptCard;
