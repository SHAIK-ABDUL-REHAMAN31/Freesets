'use client';

import { cn } from '@/lib/utils';
import { AdSlot } from './AdSlot';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface SidebarAdProps {
    /** Unique slot identifier for this ad placement */
    slotId?: string;
    /** If true, ad sticks to the viewport while scrolling the sidebar */
    sticky?: boolean;
    className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function SidebarAd({
    slotId = 'sidebar-default',
    sticky = false,
    className,
}: SidebarAdProps) {
    return (
        <div
            className={cn(
                sticky && 'sticky top-20',
                className,
            )}
        >
            <AdSlot slotId={slotId} size="rectangle" />
        </div>
    );
}

export type { SidebarAdProps };
