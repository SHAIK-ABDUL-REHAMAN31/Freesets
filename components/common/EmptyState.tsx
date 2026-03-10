'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface EmptyStateProps {
    /** Large icon rendered above the heading */
    icon: React.ReactNode;
    title: string;
    description: string;
    /** Optional CTA button — omit to hide */
    actionLabel?: string;
    actionHref?: string;
    className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    actionHref,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center text-center',
                'py-16 px-6',
                className,
            )}
        >
            {/* ── Icon ───────────────────────────────────────────────────────────── */}
            <div
                className={cn(
                    'flex items-center justify-center',
                    'size-16 rounded-2xl mb-5',
                    'bg-white/[0.04]',
                    'ring-1 ring-inset ring-white/[0.06]',
                    'text-white/25',
                )}
            >
                {icon}
            </div>

            {/* ── Title ──────────────────────────────────────────────────────────── */}
            <h3 className="font-display text-base font-semibold text-white/70 mb-1.5">
                {title}
            </h3>

            {/* ── Description ────────────────────────────────────────────────────── */}
            <p className="text-sm text-white/35 max-w-xs leading-relaxed mb-6">
                {description}
            </p>

            {/* ── Optional action ────────────────────────────────────────────────── */}
            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className={cn(
                        'inline-flex items-center justify-center gap-2',
                        'h-9 px-5 rounded-lg',
                        'text-sm font-semibold tracking-wide text-white',
                        'bg-gradient-to-r from-brand to-brand-dark',
                        'shadow-md shadow-brand/20',
                        'hover:brightness-110 hover:shadow-lg hover:shadow-brand/30',
                        'active:scale-[0.97]',
                        'transition-all duration-200 ease-out',
                    )}
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}

export type { EmptyStateProps };
