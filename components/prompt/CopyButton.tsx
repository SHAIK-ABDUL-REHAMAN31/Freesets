'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Icons (inline SVGs — zero Lucide dependency for this component)
// ─────────────────────────────────────────────────────────────────────────────

function CopyIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('size-4', className)}
        >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
    );
}

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('size-4', className)}
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type CopyState = 'idle' | 'success';

interface CopyButtonProps {
    promptId: string;
    promptText: string;
    isPremium?: boolean;
    className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function CopyButton({
    promptId,
    promptText,
    className,
}: CopyButtonProps) {
    const [state, setState] = useState<CopyState>('idle');

    // ── Click handler ───────────────────────────────────────────────────────────
    const handleCopy = useCallback(async () => {
        if (state === 'success') return;

        try {
            await navigator.clipboard.writeText(promptText);
            setState('success');
            setTimeout(() => setState('idle'), 2000);
        } catch {
            toast.error('Failed to copy. Please try again.', {
                style: {
                    background: '#1A1A1A',
                    color: '#F5F5F5',
                    border: '1px solid #2A2A2A',
                },
            });
        }
    }, [state, promptText]);

    const isSuccess = state === 'success';

    return (
        <button
            id={`copy-btn-${promptId}`}
            onClick={handleCopy}
            aria-label={isSuccess ? 'Copied ✓' : 'Copy Prompt'}
            className={cn(
                // ── Layout ──────────────────────────────────────────────────────────
                'inline-flex items-center justify-center gap-2',
                'w-full h-10 px-4 rounded-lg',
                // ── Typography ──────────────────────────────────────────────────────
                'text-sm font-semibold tracking-wide',
                // ── Idle state ──────────────────────────────────────────────────────
                !isSuccess && [
                    'bg-gradient-to-r from-brand to-brand-dark',
                    'text-white',
                    'shadow-md shadow-brand/20',
                    'hover:brightness-110 hover:shadow-lg hover:shadow-brand/30',
                    'active:scale-[0.97]',
                ],
                // ── Success state ───────────────────────────────────────────────────
                isSuccess && [
                    'bg-emerald-500/15 text-emerald-400',
                    'ring-1 ring-inset ring-emerald-500/30',
                    'copy-btn-pulse',
                ],
                // ── Transitions ─────────────────────────────────────────────────────
                'transition-all duration-200 ease-out',
                className,
            )}
        >
            {isSuccess ? (
                <>
                    <CheckIcon className="size-3.5" />
                    Copied ✓
                </>
            ) : (
                <>
                    <CopyIcon className="size-3.5" />
                    Copy Prompt
                </>
            )}
        </button>
    );
}

export type { CopyButtonProps };
