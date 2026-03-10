'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SearchSuggestion {
    id: string;
    title: string;
    thumbnailUrl: string;
}

interface SearchBarProps {
    /** Pre-fill the input (e.g. from URL ?q=...) */
    defaultValue?: string;
    /** Compact mode for header placement */
    compact?: boolean;
    className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Icons
// ─────────────────────────────────────────────────────────────────────────────

function SearchIcon({ className }: { className?: string }) {
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
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

function XIcon({ className }: { className?: string }) {
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

function SpinnerIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('size-4 animate-spin', className)}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function SearchBar({
    defaultValue = '',
    compact = false,
    className,
}: SearchBarProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // ── State ─────────────────────────────────────────────────────────────────
    const [query, setQuery] = useState(defaultValue);
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const debouncedQuery = useDebounce(query.trim(), 300);

    // ── Fetch suggestions ─────────────────────────────────────────────────────
    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        let cancelled = false;

        const fetchSuggestions = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(
                    `/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=5`,
                );

                if (!res.ok || cancelled) return;

                const json = await res.json();
                if (cancelled) return;

                const items: SearchSuggestion[] = (json.data ?? []).map(
                    (p: { id: string; title: string; thumbnailUrl: string }) => ({
                        id: p.id,
                        title: p.title,
                        thumbnailUrl: p.thumbnailUrl,
                    }),
                );

                setSuggestions(items);
                setIsOpen(items.length > 0);
                setActiveIndex(-1);
            } catch {
                if (!cancelled) {
                    setSuggestions([]);
                    setIsOpen(false);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        fetchSuggestions();
        return () => {
            cancelled = true;
        };
    }, [debouncedQuery]);

    // ── Click outside to close ────────────────────────────────────────────────
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Navigate to search results ────────────────────────────────────────────
    const submitSearch = useCallback(
        (q: string) => {
            const trimmed = q.trim();
            if (!trimmed) return;

            setIsOpen(false);
            inputRef.current?.blur();
            router.push(`/search?q=${encodeURIComponent(trimmed)}`);
        },
        [router],
    );

    // ── Navigate to a specific prompt ─────────────────────────────────────────
    const selectSuggestion = useCallback(
        (suggestion: SearchSuggestion) => {
            setQuery(suggestion.title);
            setIsOpen(false);
            router.push(`/prompt/${suggestion.id}`);
        },
        [router],
    );

    // ── Keyboard navigation ──────────────────────────────────────────────────
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!isOpen && e.key !== 'Enter') return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setActiveIndex((prev) =>
                        prev < suggestions.length - 1 ? prev + 1 : 0,
                    );
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    setActiveIndex((prev) =>
                        prev > 0 ? prev - 1 : suggestions.length - 1,
                    );
                    break;

                case 'Enter':
                    e.preventDefault();
                    if (activeIndex >= 0 && suggestions[activeIndex]) {
                        selectSuggestion(suggestions[activeIndex]);
                    } else {
                        submitSearch(query);
                    }
                    break;

                case 'Escape':
                    setIsOpen(false);
                    setActiveIndex(-1);
                    inputRef.current?.blur();
                    break;
            }
        },
        [isOpen, activeIndex, suggestions, query, selectSuggestion, submitSearch],
    );

    // ── Clear input ───────────────────────────────────────────────────────────
    const handleClear = useCallback(() => {
        setQuery('');
        setSuggestions([]);
        setIsOpen(false);
        setActiveIndex(-1);
        inputRef.current?.focus();
    }, []);

    return (
        <div
            ref={containerRef}
            className={cn('relative w-full', className)}
            role="combobox"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
        >
            {/* ── Input row ─────────────────────────────────────────────────────────── */}
            <div
                className={cn(
                    'flex items-center gap-2',
                    'bg-surface-card border border-surface-border',
                    'rounded-xl',
                    'transition-all duration-200',
                    'focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/15',
                    compact ? 'h-10 px-3' : 'h-12 px-4',
                )}
            >
                {/* Search icon / spinner */}
                <button
                    type="button"
                    onClick={() => submitSearch(query)}
                    aria-label="Search"
                    className="shrink-0 text-white/40 hover:text-white/70 transition-colors"
                >
                    {isLoading ? (
                        <SpinnerIcon className="size-4 text-brand-light" />
                    ) : (
                        <SearchIcon />
                    )}
                </button>

                {/* Input */}
                <input
                    ref={inputRef}
                    id="search-input"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (suggestions.length > 0) setIsOpen(true);
                    }}
                    placeholder="Search prompts, styles, categories..."
                    autoComplete="off"
                    className={cn(
                        'flex-1 bg-transparent border-none outline-none',
                        'text-white placeholder:text-white/30',
                        'font-body',
                        compact ? 'text-sm' : 'text-base',
                    )}
                />

                {/* Clear button */}
                {query.length > 0 && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Clear search"
                        className={cn(
                            'shrink-0 p-1 rounded-md',
                            'text-white/40 hover:text-white hover:bg-white/10',
                            'transition-all duration-150',
                        )}
                    >
                        <XIcon className="size-3.5" />
                    </button>
                )}
            </div>

            {/* ── Suggestions dropdown ──────────────────────────────────────────────── */}
            <div
                className={cn(
                    'absolute z-50 left-0 right-0 mt-2',
                    'bg-surface-card border border-surface-border',
                    'rounded-xl shadow-2xl shadow-black/40',
                    'overflow-hidden',
                    // Animate
                    'transition-all duration-200 ease-out origin-top',
                    isOpen
                        ? 'opacity-100 scale-y-100 translate-y-0'
                        : 'opacity-0 scale-y-95 -translate-y-1 pointer-events-none',
                )}
                role="listbox"
                id="search-suggestions"
            >
                {suggestions.map((suggestion, index) => (
                    <button
                        key={suggestion.id}
                        role="option"
                        id={`search-suggestion-${index}`}
                        aria-selected={index === activeIndex}
                        onClick={() => selectSuggestion(suggestion)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={cn(
                            'flex items-center gap-3 w-full px-4 py-2.5',
                            'text-left',
                            'transition-colors duration-100',
                            index === activeIndex
                                ? 'bg-brand/10 text-white'
                                : 'text-white/70 hover:bg-white/5 hover:text-white',
                            // Divider between items
                            index < suggestions.length - 1 &&
                            'border-b border-surface-border/50',
                        )}
                    >
                        {/* Thumbnail */}
                        <div className="relative size-10 shrink-0 rounded-lg overflow-hidden bg-surface">
                            <Image
                                src={suggestion.thumbnailUrl}
                                alt=""
                                fill
                                sizes="40px"
                                className="object-cover"
                            />
                        </div>

                        {/* Title */}
                        <span className="text-sm font-medium truncate">
                            {suggestion.title}
                        </span>

                        {/* Arrow hint on active */}
                        {index === activeIndex && (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="size-3.5 ml-auto shrink-0 text-brand-light"
                            >
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        )}
                    </button>
                ))}

                {/* "View all results" footer */}
                {suggestions.length > 0 && (
                    <button
                        onClick={() => submitSearch(query)}
                        className={cn(
                            'w-full px-4 py-2.5',
                            'text-xs font-semibold text-brand-light text-center',
                            'bg-brand/5 hover:bg-brand/10',
                            'transition-colors duration-150',
                            'border-t border-surface-border/50',
                        )}
                    >
                        View all results for &ldquo;{query.trim()}&rdquo;
                    </button>
                )}
            </div>
        </div>
    );
}

export type { SearchBarProps, SearchSuggestion };
