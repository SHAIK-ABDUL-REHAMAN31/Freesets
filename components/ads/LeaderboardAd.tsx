'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AdSlot } from './AdSlot';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface LeaderboardAdProps {
    /** Unique slot identifier for this ad placement */
    slotId?: string;
    className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function LeaderboardAd({
    slotId = 'leaderboard-default',
    className,
}: LeaderboardAdProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 728);
        check();

        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    return (
        <div
            className={cn(
                'w-full flex justify-center',
                'py-4',
                className,
            )}
        >
            {isMobile ? (
                /* ── Mobile banner: 320x50 ─────────────────────────────────────── */
                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-white/20 tracking-wider uppercase mb-1 select-none">
                        Advertisement
                    </span>
                    <div
                        id={`ad-${slotId}-mobile`}
                        className={cn(
                            'flex items-center justify-center',
                            'bg-white/[0.02] rounded-lg',
                            'border border-dashed border-white/5',
                            'overflow-hidden',
                        )}
                        style={{ width: 320, height: 50, maxWidth: '100%' }}
                        data-ad-slot={`${slotId}-mobile`}
                        role="complementary"
                        aria-label="Advertisement"
                    >
                        {process.env.NODE_ENV === 'development' && (
                            <span className="text-[10px] text-white/10 font-mono">
                                AD · {slotId} · 320x50
                            </span>
                        )}
                    </div>
                </div>
            ) : (
                /* ── Desktop leaderboard: 728x90 ───────────────────────────────── */
                <AdSlot slotId={slotId} size="leaderboard" />
            )}
        </div>
    );
}

export type { LeaderboardAdProps };
