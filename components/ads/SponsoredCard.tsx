'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

function ExternalLinkIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={cn('size-3.5', className)}>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface SponsoredCardProps {
    title: string;
    imageUrl: string;
    promptPreview: string;
    ctaLabel: string;
    ctaUrl: string;
    sponsorName: string;
    className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// Mirrors the PromptCard layout exactly — same border-radius, image aspect
// ratio, font sizes, padding, and hover effects — so it blends naturally
// into a PromptGrid while being clearly labelled as sponsored content.
// ─────────────────────────────────────────────────────────────────────────────

export function SponsoredCard({
    title,
    imageUrl,
    promptPreview,
    ctaLabel,
    ctaUrl,
    sponsorName,
    className,
}: SponsoredCardProps) {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <a
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className={cn(
                // ── Same card shell as PromptCard ────────────────────────────────
                'group relative flex flex-col',
                'rounded-card overflow-hidden',
                'bg-surface-card border border-surface-border',
                // ── Same hover lift + glow ──────────────────────────────────────
                'shadow-card',
                'transition-all duration-300 ease-out',
                'hover:-translate-y-1 hover:shadow-card-hover',
                'hover:border-brand/20',
                // ── Focus ring ──────────────────────────────────────────────────
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                // ── Break-inside avoid for masonry ───────────────────────────────
                'break-inside-avoid',
                className,
            )}
        >
            {/* ── Image container (same 4/3 aspect as PromptCard) ──────────────── */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
                {/* Skeleton shimmer while loading */}
                {!imageLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-surface via-surface-border to-surface" />
                )}

                <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={cn(
                        'object-cover transition-transform duration-500 ease-out',
                        'group-hover:scale-105',
                        imageLoaded ? 'opacity-100' : 'opacity-0',
                    )}
                    onLoad={() => setImageLoaded(true)}
                />

                {/* Gradient overlay for badge readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20 pointer-events-none" />

                {/* ── Sponsored badge (top-left) ──────────────────────────────────── */}
                <span
                    className={cn(
                        'absolute top-2.5 left-2.5 z-10',
                        'inline-flex items-center gap-1 px-2 py-0.5',
                        'rounded-md text-[10px] font-semibold tracking-wider uppercase',
                        'bg-white/15 text-white/70',
                        'backdrop-blur-sm',
                        'ring-1 ring-inset ring-white/10',
                    )}
                >
                    Sponsored
                </span>
            </div>

            {/* ── Card body (same padding & gaps as PromptCard) ─────────────────── */}
            <div className="flex flex-col flex-1 p-3.5 gap-2.5">
                {/* Sponsor name */}
                <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">
                    {sponsorName}
                </span>

                {/* Title — same styles as PromptCard */}
                <h3
                    className={cn(
                        'font-display text-sm font-semibold leading-snug text-white/90',
                        'line-clamp-2',
                        'group-hover:text-white transition-colors duration-200',
                    )}
                >
                    {title}
                </h3>

                {/* Prompt preview text */}
                <p className="text-xs text-white/40 leading-relaxed line-clamp-2">
                    {promptPreview}
                </p>

                {/* Spacer pushes CTA to bottom */}
                <div className="flex-1" />

                {/* ── CTA row ──────────────────────────────────────────────────────── */}
                <div
                    className={cn(
                        'flex items-center justify-center gap-2',
                        'h-9 rounded-lg',
                        'text-xs font-semibold tracking-wide',
                        'bg-white/5 text-white/60',
                        'ring-1 ring-inset ring-white/10',
                        'group-hover:bg-white/10 group-hover:text-white group-hover:ring-white/20',
                        'transition-all duration-200 ease-out',
                    )}
                >
                    {ctaLabel}
                    <ExternalLinkIcon className="size-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        </a>
    );
}

export type { SponsoredCardProps };
