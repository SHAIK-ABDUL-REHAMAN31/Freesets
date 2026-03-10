'use client';

import { useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AccountStatus {
    slug: string;
    label: string;
    cloudName: string;
    configured: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// CloudinaryAccountStatus
//
// Shows a status table of all 11 Cloudinary accounts so the admin can
// see which accounts are configured.
// ─────────────────────────────────────────────────────────────────────────────

export default function CloudinaryAccountStatus() {
    const [accounts, setAccounts] = useState<AccountStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/admin/cloudinary-status')
            .then((res) => res.json())
            .then((json) => {
                if (json.success) {
                    setAccounts(json.data);
                } else {
                    setError(json.error || 'Failed to load status');
                }
            })
            .catch(() => setError('Failed to load Cloudinary status'))
            .finally(() => setLoading(false));
    }, []);

    const configuredCount = accounts.filter((a) => a.configured).length;

    return (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-x-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                <div>
                    <h3 className="text-sm font-semibold text-white">
                        Cloudinary Accounts Status
                    </h3>
                    <p className="text-xs text-white/30 mt-0.5">
                        {configuredCount} of {accounts.length} accounts configured
                    </p>
                </div>
                <span className="text-lg">☁️</span>
            </div>

            {/* Loading */}
            {loading && (
                <div className="px-5 py-8 text-center text-white/20 text-sm">
                    Loading…
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="px-5 py-4 text-red-400 text-sm">{error}</div>
            )}

            {/* Table */}
            {!loading && !error && (
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/[0.06]">
                            <th className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider px-5 py-2.5">
                                Category
                            </th>
                            <th className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider px-5 py-2.5">
                                Cloud Name
                            </th>
                            <th className="text-left text-[10px] font-medium text-white/30 uppercase tracking-wider px-5 py-2.5">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map((account) => (
                            <tr
                                key={account.slug}
                                className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                            >
                                <td className="px-5 py-2.5">
                                    <span className="text-sm text-white/70">
                                        {account.label}
                                    </span>
                                </td>
                                <td className="px-5 py-2.5">
                                    <span className="text-xs font-mono text-white/40">
                                        {account.cloudName || '—'}
                                    </span>
                                </td>
                                <td className="px-5 py-2.5">
                                    {account.configured ? (
                                        <span className="inline-flex items-center gap-1.5 text-xs text-green-400">
                                            <span className="w-2 h-2 rounded-full bg-green-400" />
                                            Configured
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 text-xs text-yellow-400">
                                            <span className="w-2 h-2 rounded-full bg-yellow-400" />
                                            Not set
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
