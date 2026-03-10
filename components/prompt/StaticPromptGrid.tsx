'use client';

import { PromptGrid } from '@/components/prompt/PromptGrid';
import type { IPromptCard } from '@/types/prompt.types';

/**
 * Thin client-component wrapper around PromptGrid
 * so the marketing homepage (a Server Component) can render
 * the grid without passing function props across the boundary.
 */
export function StaticPromptGrid({ prompts }: { prompts: IPromptCard[] }) {
    return (
        <PromptGrid
            prompts={prompts}
            isLoading={false}
            hasMore={false}
            onLoadMore={() => { }}
        />
    );
}
