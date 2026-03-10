'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Size presets — dimensions in px
// ─────────────────────────────────────────────────────────────────────────────

const SIZE_MAP = {
    leaderboard: { width: 728, height: 90 },
    'leaderboard-mobile': { width: 320, height: 50 },
    rectangle: { width: 300, height: 250 },
    native: { width: undefined, height: undefined }, // fluid
} as const;

export type AdSize = 'leaderboard' | 'rectangle' | 'native';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface AdSlotProps {
    slotId: string;
    size: AdSize;
    className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function AdSlot({ slotId, size, className }: AdSlotProps) {
    const [mounted, setMounted] = useState(false);

    // Only render client-side to avoid SSR hydration mismatches
    useEffect(() => {
        setMounted(true);
    }, []);

    // Check if ads are enabled via env
    const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED !== 'false';

    if (!mounted || !adsEnabled) return null;

    const dimensions = SIZE_MAP[size];

    return (
        <div
            className={cn('flex flex-col items-center', className)}
            data-ad-slot={slotId}
        >
            {/* ── AdSense-required disclosure label ──────────────────────────────── */}
            <span className="text-[10px] text-white/20 tracking-wider uppercase mb-1 select-none">
                Advertisement
            </span>

            {/* ── Ad container ──────────────────────────────────────────────────── */}
            <div
                id={`ad-${slotId}`}
                className={cn(
                    'flex items-center justify-center',
                    'bg-white/[0.02] rounded-lg',
                    'border border-dashed border-white/5',
                    'overflow-hidden',
                    // For native ads, be fluid
                    size === 'native' && 'w-full min-h-[100px]',
                )}
                style={
                    dimensions.width
                        ? {
                            width: dimensions.width,
                            height: dimensions.height,
                            maxWidth: '100%',
                        }
                        : undefined
                }
                role="complementary"
                aria-label="Advertisement"
            >
                {/* 
          Ad script / iframe will be injected here by the ad provider.
          In dev mode, show a placeholder. 
        */}
                {process.env.NODE_ENV === 'development' && (
                    <span className="text-[10px] text-white/10 font-mono">
                        AD · {slotId} · {size}
                    </span>
                )}
            </div>
        </div>
    );
}

export type { AdSlotProps };
