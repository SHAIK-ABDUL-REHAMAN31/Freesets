'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ─────────────────────────────────────────────────────────────────────────────
// Admin Login Page — /fsa-login
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lockoutSeconds, setLockoutSeconds] = useState(0);

    // Countdown timer for lockout
    useEffect(() => {
        if (lockoutSeconds <= 0) return;
        const timer = setInterval(() => {
            setLockoutSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [lockoutSeconds]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || lockoutSeconds > 0) return;

        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/admin-auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.status === 429) {
                setError(data.error || 'Too many attempts.');
                // Extract minutes from error message or default to 15
                const minuteMatch = data.error?.match(/(\d+)\s*minute/);
                const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 15;
                setLockoutSeconds(minutes * 60);
                return;
            }

            if (!res.ok) {
                setError(data.error || 'Login failed.');
                return;
            }

            // Success — redirect to admin panel
            const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/freesets-hq';
            router.push(adminPath);
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [username, password, isLoading, lockoutSeconds, router]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
            {/* Subtle grid overlay */}
            <div
                className="fixed inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />

            <div className="relative w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-0.5 mb-2">
                        <span className="font-display text-2xl font-extrabold text-[#7C3AED]">
                            free
                        </span>
                        <span className="font-display text-2xl font-extrabold text-white">
                            sets
                        </span>
                    </div>
                    <div className="h-px w-12 mx-auto bg-white/10 mt-4" />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Username */}
                    <div>
                        <label
                            htmlFor="admin-username"
                            className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2"
                        >
                            Username
                        </label>
                        <input
                            id="admin-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/30 transition-colors"
                            placeholder="Enter username"
                            autoComplete="off"
                            autoFocus
                            disabled={lockoutSeconds > 0}
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            htmlFor="admin-password"
                            className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="admin-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/30 transition-colors pr-12"
                                placeholder="Enter password"
                                autoComplete="off"
                                disabled={lockoutSeconds > 0}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-xs transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? 'HIDE' : 'SHOW'}
                            </button>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Lockout countdown */}
                    {lockoutSeconds > 0 && (
                        <div className="px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
                            <p className="text-yellow-400 text-sm font-mono">
                                Try again in {formatTime(lockoutSeconds)}
                            </p>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading || lockoutSeconds > 0 || !username || !password}
                        className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-white/5 disabled:text-white/20 text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle
                                        className="opacity-25"
                                        cx="12" cy="12" r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                </svg>
                                Verifying...
                            </span>
                        ) : (
                            'Enter'
                        )}
                    </button>
                </form>

                {/* Bottom subtle line */}
                <div className="mt-10 text-center">
                    <div className="h-px w-8 mx-auto bg-white/5" />
                </div>
            </div>
        </div>
    );
}
