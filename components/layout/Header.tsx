'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { IPromptCard } from '@/types/prompt.types';

// ─────────────────────────────────────────────────────────────────────────────
// Copy icons (reused from PromptCard)
// ─────────────────────────────────────────────────────────────────────────────

function CopyIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
    );
}

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// SearchResultCard — mini card shown inside search dropdown
// ─────────────────────────────────────────────────────────────────────────────

function SearchResultCard({ prompt, onClose }: { prompt: IPromptCard; onClose: () => void }) {
    const fallbackImage = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';
    const [imgSrc, setImgSrc] = useState(prompt.thumbnailUrl || fallbackImage);
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(prompt.promptText || '');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback for mobile browsers that block clipboard API
            try {
                const textarea = document.createElement('textarea');
                textarea.value = prompt.promptText || '';
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (fallbackErr) {
                console.error('Failed to copy:', fallbackErr);
            }
        }
    };

    return (
        <div className="flex gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors duration-150 group/card">
            {/* Thumbnail */}
            <div className="relative shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-zinc-800">
                <Image
                    src={imgSrc}
                    alt={prompt.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                    onError={() => setImgSrc(fallbackImage)}
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate">
                    {prompt.title}
                </h4>
                <p className="text-xs text-white/70 line-clamp-1 mt-0.5">
                    {prompt.promptText || 'No prompt available.'}
                </p>
            </div>

            {/* Copy button */}
            <button
                onClick={handleCopy}
                className={cn(
                    'shrink-0 self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
                    copied
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-black hover:bg-zinc-200',
                )}
            >
                {copied ? (
                    <>
                        <CheckIcon className="size-3" />
                        Copied
                    </>
                ) : (
                    <>
                        <CopyIcon className="size-3" />
                        Copy
                    </>
                )}
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────────

export default function Header() {
    const [searchValue, setSearchValue] = useState('');
    const [results, setResults] = useState<IPromptCard[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const mobileDropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const mobileInputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // ── Debounced search ──────────────────────────────────────────────────
    const doSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setResults([]);
            setShowDropdown(false);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            const res = await fetch(`/api/prompts?search=${encodeURIComponent(query.trim())}&limit=8`);
            if (res.ok) {
                const json = await res.json();
                setResults(json.data || []);
                setShowDropdown(true);
            }
        } catch {
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            setSearchValue(val);

            // Debounce 300ms
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                doSearch(val);
            }, 300);
        },
        [doSearch],
    );

    // ── Clear search ──────────────────────────────────────────────────────
    const clearSearch = useCallback(() => {
        setSearchValue('');
        setResults([]);
        setShowDropdown(false);
        inputRef.current?.focus();
        mobileInputRef.current?.focus();
    }, []);

    // ── Close mobile search ───────────────────────────────────────────────
    const closeMobileSearch = useCallback(() => {
        setMobileSearchOpen(false);
        setSearchValue('');
        setResults([]);
        setShowDropdown(false);
    }, []);

    // ── Open mobile search ────────────────────────────────────────────────
    const openMobileSearch = useCallback(() => {
        setMobileSearchOpen(true);
        // Focus the input after the panel opens
        setTimeout(() => mobileInputRef.current?.focus(), 100);
    }, []);

    // ── Close dropdown on click outside ───────────────────────────────────
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            const target = e.target as Node;
            
            // Critical fix for mobile: If target was unmounted (e.g. state change on click), ignore it
            if (!document.contains(target)) return;
            
            const isOutsideDesktop = dropdownRef.current && !dropdownRef.current.contains(target);
            const isOutsideMobile = mobileDropdownRef.current && !mobileDropdownRef.current.contains(target);

            // If we have both refs, it must be outside both to close
            // If we have only one ref, it must be outside that one
            const outsideDesktop = dropdownRef.current ? isOutsideDesktop : true;
            const outsideMobile = mobileDropdownRef.current ? isOutsideMobile : true;

            if (outsideDesktop && outsideMobile) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Close dropdown on Escape ──────────────────────────────────────────
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setShowDropdown(false);
                inputRef.current?.blur();
                mobileInputRef.current?.blur();
                if (mobileSearchOpen) closeMobileSearch();
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [mobileSearchOpen, closeMobileSearch]);

    // ── Re-show dropdown on focus if results exist ────────────────────────
    const handleFocus = useCallback(() => {
        if (results.length > 0 && searchValue.trim()) {
            setShowDropdown(true);
        }
    }, [results, searchValue]);

    // ── Shared search results dropdown content ────────────────────────────
    const searchDropdownContent = showDropdown && (
        <div
            className={cn(
                'absolute top-full left-0 right-0 mt-2',
                'bg-surface-card/95 backdrop-blur-xl',
                'border border-surface-border rounded-2xl',
                'shadow-2xl shadow-black/40',
                'max-h-[420px] overflow-y-auto',
                'z-[100]',
                'animate-in fade-in slide-in-from-top-2 duration-200',
            )}
        >
            {isSearching ? (
                /* Loading state */
                <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2.5 text-sm text-foreground/40">
                        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                        </svg>
                        Searching…
                    </div>
                </div>
            ) : results.length === 0 ? (
                /* No results */
                <div className="flex flex-col items-center justify-center py-8 px-4">
                    <Search className="h-8 w-8 text-foreground/20 mb-2" />
                    <p className="text-sm font-medium text-white">No prompts found</p>
                    <p className="text-xs text-white/50 mt-1">Try a different search term</p>
                </div>
            ) : (
                /* Results list */
                <div className="p-2">
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground/30">
                        {results.length} result{results.length !== 1 ? 's' : ''} found
                    </p>
                    {results.map((prompt) => (
                        <SearchResultCard
                            key={prompt.id}
                            prompt={prompt}
                            onClose={() => setShowDropdown(false)}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <header className="sticky top-0 z-[60] w-full border-b border-surface-border/50 bg-surface/80 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/60">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                {/* ── Left: Logo (no hamburger) ────────────────────── */}
                <div className="flex items-center gap-4 shrink-0">
                    <Link href="/" className="flex items-center gap-0.5 select-none pt-1">
                        <span className="font-logo text-4xl tracking-wide text-brand">
                            FREE
                        </span>
                        <span className="font-logo text-4xl tracking-wide text-foreground">
                            SETS
                        </span>
                    </Link>
                </div>

                {/* ── Center: Desktop search bar with live dropdown ── */}
                <div ref={dropdownRef} className="hidden sm:block relative flex-1 max-w-xl mx-auto">
                    <div className="relative w-full group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40 group-focus-within:text-brand transition-colors" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchValue}
                            onChange={handleInputChange}
                            onFocus={handleFocus}
                            placeholder="Search prompts by title or text..."
                            className="w-full h-10 pl-10 pr-10 rounded-full bg-white/5 border border-surface-border/60 text-sm text-foreground placeholder:text-foreground/30
                                focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 focus:bg-white/8
                                transition-all duration-200"
                        />
                        {/* Clear button */}
                        {searchValue && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-foreground/30 hover:text-foreground/60 transition-colors"
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Desktop search results dropdown */}
                    {searchDropdownContent}
                </div>

                {/* ── Right: Mobile search toggle ──────────────────── */}
                <div className="flex items-center gap-3 sm:hidden">
                    <button
                        onClick={openMobileSearch}
                        className="inline-flex items-center justify-center rounded-md p-2 text-foreground/60 hover:text-foreground transition-colors"
                        aria-label="Search"
                    >
                        <Search className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* ── Mobile search bar (slides down below header) ───── */}
            {mobileSearchOpen && (
                <div
                    ref={mobileDropdownRef}
                    className="sm:hidden border-t border-surface-border/50 bg-surface/95 backdrop-blur-xl animate-in slide-in-from-top-1 fade-in duration-200"
                >
                    <div className="relative mx-auto max-w-7xl px-4 py-3">
                        <div className="relative w-full flex items-center gap-2">
                            {/* Search input */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                                <input
                                    ref={mobileInputRef}
                                    type="text"
                                    value={searchValue}
                                    onChange={handleInputChange}
                                    onFocus={handleFocus}
                                    placeholder="Search for free photos..."
                                    className="w-full h-10 pl-9 pr-10 rounded-full bg-white/5 border border-surface-border/60 text-sm text-foreground placeholder:text-foreground/30
                                        focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand/50 focus:bg-white/8
                                        transition-all duration-200"
                                />
                                {/* Clear text button */}
                                {searchValue && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-foreground/30 hover:text-foreground/60 transition-colors"
                                        aria-label="Clear search"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Close mobile search button */}
                            <button
                                onClick={closeMobileSearch}
                                className="shrink-0 inline-flex items-center justify-center rounded-full p-2 text-foreground/50 hover:text-foreground hover:bg-white/5 transition-colors"
                                aria-label="Close search"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Mobile search results dropdown */}
                        {searchDropdownContent}
                    </div>
                </div>
            )}
        </header>
    );
}
