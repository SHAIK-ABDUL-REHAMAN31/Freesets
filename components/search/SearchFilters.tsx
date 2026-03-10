'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Category,
    AITool,
    AspectRatio,
    type PromptFilters,
} from '@/types/prompt.types';

// ─────────────────────────────────────────────────────────────────────────────
// Display labels
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<Category, string> = {
    [Category.AI_IMAGES]: 'AI Images',
    [Category.VIDEO_PROMPTS]: 'Video Prompts',
    [Category.PRODUCT_SHOOT]: 'Product Shoot',
    [Category.PORTRAIT]: 'Portrait',
    [Category.ARCHITECTURE]: 'Architecture',
    [Category.FOOD]: 'Food',
    [Category.LOGO]: 'Logo',
    [Category.TEXTURE]: 'Texture',
};

const AI_TOOL_LABELS: Record<AITool, string> = {
    [AITool.MIDJOURNEY]: 'Midjourney',
    [AITool.DALLE]: 'DALL·E',
    [AITool.STABLE_DIFFUSION]: 'Stable Diffusion',
    [AITool.SORA]: 'Sora',
    [AITool.RUNWAY]: 'Runway',
    [AITool.KLING]: 'Kling',
    [AITool.GEMINI]: 'Gemini',
    [AITool.FIREFLY]: 'Firefly',
};

const ASPECT_RATIO_LABELS: Record<AspectRatio, string> = {
    [AspectRatio.SQUARE]: '1:1',
    [AspectRatio.LANDSCAPE]: '16:9',
    [AspectRatio.PORTRAIT_RATIO]: '9:16',
    [AspectRatio.CLASSIC]: '4:3',
};

const SORT_OPTIONS = [
    { value: 'popular', label: 'Popular' },
    { value: 'newest', label: 'Newest' },
    { value: 'downloads', label: 'Most Downloaded' },
    { value: 'copies', label: 'Most Copied' },
] as const;

const CONTENT_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'free', label: 'Free' },
    { value: 'premium', label: 'Premium' },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

function XIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('size-3', className)}
        >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

function ChevronDownIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('size-3.5', className)}
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

interface SearchFiltersProps {
    className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Parse current URL search params into a PromptFilters object */
function parseFiltersFromParams(
    searchParams: ReturnType<typeof useSearchParams>,
): PromptFilters & { contentType: string } {
    return {
        category: (searchParams.get('category') as Category) || undefined,
        aiTools: searchParams.get('aiTool')
            ? [searchParams.get('aiTool') as AITool]
            : undefined,
        aspectRatio: (searchParams.get('aspectRatio') as AspectRatio) || undefined,
        sortBy:
            (searchParams.get('sortBy') as PromptFilters['sortBy']) || 'popular',
        contentType: searchParams.get('contentType') || 'all',
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function SearchFilters({ className }: SearchFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const filters = useMemo(
        () => parseFiltersFromParams(searchParams),
        [searchParams],
    );

    // ── URL updater ───────────────────────────────────────────────────────────
    const updateParams = useCallback(
        (updates: Record<string, string | undefined>) => {
            const params = new URLSearchParams(searchParams.toString());

            Object.entries(updates).forEach(([key, value]) => {
                if (value === undefined || value === '' || value === 'all') {
                    params.delete(key);
                } else {
                    params.set(key, value);
                }
            });

            // Reset to page 1 on filter change
            params.delete('page');

            const qs = params.toString();
            router.push(`${pathname}${qs ? `?${qs}` : ''}`);
        },
        [searchParams, pathname, router],
    );

    // ── Toggle a filter value (set or remove) ─────────────────────────────────
    const toggleFilter = useCallback(
        (key: string, value: string, currentValue?: string) => {
            updateParams({
                [key]: currentValue === value ? undefined : value,
            });
        },
        [updateParams],
    );

    // ── Clear all filters ─────────────────────────────────────────────────────
    const clearAll = useCallback(() => {
        // Keep the search query (q) if present
        const q = searchParams.get('q');
        const params = new URLSearchParams();
        if (q) params.set('q', q);

        const qs = params.toString();
        router.push(`${pathname}${qs ? `?${qs}` : ''}`);
    }, [searchParams, pathname, router]);

    // ── Check if any filter is active ─────────────────────────────────────────
    const hasActiveFilters = useMemo(() => {
        return !!(
            filters.category ||
            (filters.aiTools && filters.aiTools.length > 0) ||
            filters.aspectRatio ||
            filters.contentType !== 'all' ||
            (filters.sortBy && filters.sortBy !== 'popular')
        );
    }, [filters]);

    // ── Active filter chips (for removal) ─────────────────────────────────────
    const activeChips = useMemo(() => {
        const chips: { key: string; paramKey: string; label: string }[] = [];

        if (filters.category) {
            chips.push({
                key: 'category',
                paramKey: 'category',
                label: CATEGORY_LABELS[filters.category],
            });
        }

        if (filters.aiTools && filters.aiTools.length > 0) {
            filters.aiTools.forEach((tool) => {
                chips.push({
                    key: `aiTool-${tool}`,
                    paramKey: 'aiTool',
                    label: AI_TOOL_LABELS[tool],
                });
            });
        }

        if (filters.aspectRatio) {
            chips.push({
                key: 'aspectRatio',
                paramKey: 'aspectRatio',
                label: ASPECT_RATIO_LABELS[filters.aspectRatio],
            });
        }

        if (filters.contentType !== 'all') {
            chips.push({
                key: 'contentType',
                paramKey: 'contentType',
                label: filters.contentType === 'free' ? 'Free' : 'Premium',
            });
        }

        return chips;
    }, [filters]);

    // ── Shared chip styles ────────────────────────────────────────────────────
    const chipBase = cn(
        'inline-flex items-center gap-1.5',
        'px-3 py-1.5 rounded-lg',
        'text-xs font-medium tracking-wide',
        'transition-all duration-150 ease-out',
        'whitespace-nowrap cursor-pointer select-none',
    );

    const chipIdle = cn(
        chipBase,
        'bg-white/5 text-white/60',
        'ring-1 ring-inset ring-white/8',
        'hover:bg-white/10 hover:text-white hover:ring-white/15',
    );

    const chipActive = cn(
        chipBase,
        'bg-brand/15 text-brand-light',
        'ring-1 ring-inset ring-brand/30',
        'hover:bg-brand/20',
    );

    return (
        <div className={cn('space-y-3', className)}>
            {/* ── Row 1: Filter dropdowns ────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-2">
                {/* ── Category ─────────────────────────────────────────────────────── */}
                <FilterDropdown
                    label="Category"
                    value={filters.category}
                    options={Object.entries(CATEGORY_LABELS).map(([val, lbl]) => ({
                        value: val,
                        label: lbl,
                    }))}
                    onChange={(val) => toggleFilter('category', val, filters.category)}
                    chipIdle={chipIdle}
                    chipActive={chipActive}
                />

                {/* ── AI Tool ──────────────────────────────────────────────────────── */}
                <FilterDropdown
                    label="AI Tool"
                    value={filters.aiTools?.[0]}
                    options={Object.entries(AI_TOOL_LABELS).map(([val, lbl]) => ({
                        value: val,
                        label: lbl,
                    }))}
                    onChange={(val) =>
                        toggleFilter('aiTool', val, filters.aiTools?.[0])
                    }
                    chipIdle={chipIdle}
                    chipActive={chipActive}
                />

                {/* ── Aspect Ratio ─────────────────────────────────────────────────── */}
                <FilterDropdown
                    label="Aspect Ratio"
                    value={filters.aspectRatio}
                    options={Object.entries(ASPECT_RATIO_LABELS).map(([val, lbl]) => ({
                        value: val,
                        label: lbl,
                    }))}
                    onChange={(val) =>
                        toggleFilter('aspectRatio', val, filters.aspectRatio)
                    }
                    chipIdle={chipIdle}
                    chipActive={chipActive}
                />

                {/* ── Content type chips ────────────────────────────────────────────── */}
                <div className="flex items-center gap-1 ml-1">
                    {CONTENT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() =>
                                toggleFilter(
                                    'contentType',
                                    opt.value,
                                    filters.contentType,
                                )
                            }
                            className={
                                filters.contentType === opt.value ? chipActive : chipIdle
                            }
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* ── Spacer ───────────────────────────────────────────────────────── */}
                <div className="flex-1" />

                {/* ── Sort dropdown ────────────────────────────────────────────────── */}
                <FilterDropdown
                    label="Sort"
                    value={filters.sortBy}
                    options={SORT_OPTIONS.map((o) => ({
                        value: o.value,
                        label: o.label,
                    }))}
                    onChange={(val) => updateParams({ sortBy: val })}
                    chipIdle={chipIdle}
                    chipActive={chipActive}
                />
            </div>

            {/* ── Row 2: Active filter chips ─────────────────────────────────────── */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                    {activeChips.map((chip) => (
                        <span
                            key={chip.key}
                            className={cn(
                                'inline-flex items-center gap-1.5',
                                'px-2.5 py-1 rounded-md',
                                'text-[11px] font-semibold tracking-wide',
                                'bg-brand/10 text-brand-light',
                                'ring-1 ring-inset ring-brand/20',
                            )}
                        >
                            {chip.label}
                            <button
                                onClick={() => updateParams({ [chip.paramKey]: undefined })}
                                className="p-0.5 rounded hover:bg-brand/20 transition-colors"
                                aria-label={`Remove ${chip.label} filter`}
                            >
                                <XIcon className="size-2.5" />
                            </button>
                        </span>
                    ))}

                    <button
                        onClick={clearAll}
                        className={cn(
                            'text-[11px] font-medium text-white/40',
                            'hover:text-white/70 transition-colors',
                            'ml-1',
                        )}
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// FilterDropdown — reusable inline dropdown
// ─────────────────────────────────────────────────────────────────────────────

interface FilterDropdownProps {
    label: string;
    value?: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    chipIdle: string;
    chipActive: string;
}

function FilterDropdown({
    label,
    value,
    options,
    onChange,
    chipIdle,
    chipActive,
}: FilterDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const activeLabel = value
        ? options.find((o) => o.value === value)?.label
        : undefined;

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className={cn(value ? chipActive : chipIdle)}
                aria-expanded={isOpen}
            >
                {activeLabel ?? label}
                <ChevronDownIcon
                    className={cn(
                        'transition-transform duration-200',
                        isOpen && 'rotate-180',
                    )}
                />
            </button>

            {/* Dropdown panel */}
            <div
                className={cn(
                    'absolute z-50 top-full left-0 mt-1.5',
                    'min-w-[180px] max-h-[280px] overflow-y-auto',
                    'bg-surface-card border border-surface-border',
                    'rounded-xl shadow-2xl shadow-black/40',
                    'py-1',
                    // Animate
                    'transition-all duration-150 ease-out origin-top',
                    isOpen
                        ? 'opacity-100 scale-y-100'
                        : 'opacity-0 scale-y-95 pointer-events-none',
                )}
            >
                {options.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => {
                            onChange(option.value);
                            setIsOpen(false);
                        }}
                        className={cn(
                            'w-full px-3.5 py-2 text-left text-sm',
                            'transition-colors duration-100',
                            value === option.value
                                ? 'text-brand-light bg-brand/10 font-medium'
                                : 'text-white/70 hover:text-white hover:bg-white/5',
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}


export type { SearchFiltersProps };
