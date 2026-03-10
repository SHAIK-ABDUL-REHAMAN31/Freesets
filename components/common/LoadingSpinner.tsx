'use client';

import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    /** Override the default brand colour */
    color?: string;
    className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Size map
// ─────────────────────────────────────────────────────────────────────────────

const SIZE_MAP: Record<string, string> = {
    sm: 'size-4 border-2',
    md: 'size-6 border-[2.5px]',
    lg: 'size-10 border-[3px]',
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function LoadingSpinner({
    size = 'md',
    color,
    className,
}: LoadingSpinnerProps) {
    return (
        <div
            role="status"
            aria-label="Loading"
            className={cn(
                'inline-block rounded-full',
                'animate-spin',
                'border-white/10',
                SIZE_MAP[size],
                className,
            )}
            style={{
                borderTopColor: color || 'var(--color-brand, #A855F7)',
            }}
        />
    );
}

export type { LoadingSpinnerProps };
