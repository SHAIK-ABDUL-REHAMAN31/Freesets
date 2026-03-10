'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { IPromptCard } from '@/types/prompt.types';

// Copy Icon
function CopyIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
    );
}

// Check Icon (for copied state)
function CheckIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

export interface PromptCardProps {
    prompt: IPromptCard;
}

export function PromptCard({ prompt }: PromptCardProps) {
    const fallbackImage = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';

    const [imageLoaded, setImageLoaded] = useState(false);
    const [imgSrc, setImgSrc] = useState(prompt.thumbnailUrl || fallbackImage);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(prompt.promptText || '');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="group w-full rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-shadow duration-300">
            {/* Thumbnail Image */}
            <div className="relative w-full aspect-[3/2] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                {!imageLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-zinc-200 dark:bg-zinc-700" />
                )}
                <Image
                    src={imgSrc}
                    alt={prompt.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={cn(
                        'object-cover transition-transform duration-500 ease-out group-hover:scale-105',
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImgSrc(fallbackImage)}
                />
            </div>

            {/* Card Content */}
            <div className="p-5 flex flex-col gap-2.5">
                {/* Title */}
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-snug line-clamp-1">
                    {prompt.title}
                </h3>

                {/* Prompt Text */}
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                    {prompt.promptText || 'No prompt text available.'}
                </p>

                {/* Copy Prompt Button */}
                <button
                    onClick={handleCopy}
                    className={cn(
                        'mt-3 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                        copied
                            ? 'bg-emerald-500 text-white'
                            : 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200'
                    )}
                >
                    {copied ? (
                        <>
                            <CheckIcon className="size-4" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <CopyIcon className="size-4" />
                            Copy Prompt
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default PromptCard;
