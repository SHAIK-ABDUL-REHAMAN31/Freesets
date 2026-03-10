'use client';

import { AITool } from '@/types/prompt.types';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Colour mapping — each AI tool gets a unique subtle palette
// ─────────────────────────────────────────────────────────────────────────────

interface ToolTheme {
    label: string;
    bg: string;
    text: string;
    ring: string;
}

const TOOL_THEMES: Record<AITool, ToolTheme> = {
    [AITool.MIDJOURNEY]: {
        label: 'Midjourney',
        bg: 'bg-purple-500/12',
        text: 'text-purple-300',
        ring: 'ring-purple-500/20',
    },
    [AITool.DALLE]: {
        label: 'DALL·E',
        bg: 'bg-emerald-500/12',
        text: 'text-emerald-300',
        ring: 'ring-emerald-500/20',
    },
    [AITool.STABLE_DIFFUSION]: {
        label: 'Stable Diffusion',
        bg: 'bg-orange-500/12',
        text: 'text-orange-300',
        ring: 'ring-orange-500/20',
    },
    [AITool.SORA]: {
        label: 'Sora',
        bg: 'bg-sky-500/12',
        text: 'text-sky-300',
        ring: 'ring-sky-500/20',
    },
    [AITool.RUNWAY]: {
        label: 'Runway',
        bg: 'bg-rose-500/12',
        text: 'text-rose-300',
        ring: 'ring-rose-500/20',
    },
    [AITool.KLING]: {
        label: 'Kling',
        bg: 'bg-amber-500/12',
        text: 'text-amber-300',
        ring: 'ring-amber-500/20',
    },
    [AITool.GEMINI]: {
        label: 'Gemini',
        bg: 'bg-blue-500/12',
        text: 'text-blue-300',
        ring: 'ring-blue-500/20',
    },
    [AITool.FIREFLY]: {
        label: 'Firefly',
        bg: 'bg-yellow-500/12',
        text: 'text-yellow-300',
        ring: 'ring-yellow-500/20',
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface AIToolBadgeProps {
    tool: AITool;
    className?: string;
}

export function AIToolBadge({ tool, className }: AIToolBadgeProps) {
    const theme = TOOL_THEMES[tool];

    return (
        <span
            className={cn(
                // Layout
                'inline-flex items-center gap-1 px-2 py-0.5',
                // Shape
                'rounded-full',
                // Typography
                'text-[10px] font-semibold tracking-wide uppercase whitespace-nowrap',
                // Colours per tool
                theme.bg,
                theme.text,
                // Subtle ring for depth
                'ring-1 ring-inset',
                theme.ring,
                // Micro transition
                'transition-colors duration-200',
                className,
            )}
        >
            {/* Small coloured dot indicator */}
            <span
                className={cn(
                    'size-1.5 rounded-full shrink-0',
                    theme.text.replace('text-', 'bg-'),
                )}
                aria-hidden
            />
            {theme.label}
        </span>
    );
}

export { TOOL_THEMES };
export type { AIToolBadgeProps };
