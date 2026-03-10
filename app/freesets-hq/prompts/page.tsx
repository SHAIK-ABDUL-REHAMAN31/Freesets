'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface PromptRow {
    _id: string;
    title: string;
    category: string;
    status: string;
    copyCount: number;
    downloadCount: number;
    thumbnailUrl: string;
    createdAt: string;
}

const STATUS_TABS = ['all', 'published', 'pending', 'rejected'] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminPromptsPage() {
    const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/freesets-hq';
    const [prompts, setPrompts] = useState<PromptRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<typeof STATUS_TABS[number]>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deletingTitle, setDeletingTitle] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchPrompts = useCallback(async () => {
        setLoading(true);
        try {
            const statusParam = activeTab !== 'all' ? `&status=${activeTab}` : '';
            const res = await fetch(
                `/api/admin/prompts?page=${page}&limit=20${statusParam}`,
            );
            const data = await res.json();
            if (data.success) {
                setPrompts(data.data);
                setTotalPages(data.pagination?.totalPages || 1);
            }
        } catch (err) {
            console.error('Failed to fetch prompts:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab, page]);

    useEffect(() => {
        fetchPrompts();
    }, [fetchPrompts]);

    const handleDelete = async () => {
        if (!deletingId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/prompts/${deletingId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setPrompts((prev) => prev.filter((p) => p._id !== deletingId));
            }
        } catch (err) {
            console.error('Delete failed:', err);
        } finally {
            setDeletingId(null);
            setDeletingTitle('');
            setIsDeleting(false);
        }
    };

    const openDeleteModal = (id: string, title: string) => {
        setDeletingId(id);
        setDeletingTitle(title);
    };

    return (
        <div className="max-w-6xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-display font-bold text-white">Manage Prompts</h1>
                    <p className="text-sm text-white/40 mt-1">
                        Create, edit, and manage all prompts
                    </p>
                </div>
                <Link
                    href={`${adminPath}/prompts/new`}
                    className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium rounded-lg transition-colors text-center shrink-0"
                >
                    + Add New Prompt
                </Link>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-1 mb-6 bg-white/[0.03] p-1 rounded-lg w-fit max-w-full overflow-x-auto scrollbar-hide">
                {STATUS_TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => {
                            setActiveTab(tab);
                            setPage(1);
                        }}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === tab
                            ? 'bg-[#7C3AED] text-white'
                            : 'text-white/40 hover:text-white/70'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-x-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-6 h-6 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th className="text-left text-xs font-medium text-white/30 uppercase tracking-wider px-5 py-3">
                                    Prompt
                                </th>
                                <th className="text-left text-xs font-medium text-white/30 uppercase tracking-wider px-5 py-3">
                                    Category
                                </th>
                                <th className="text-left text-xs font-medium text-white/30 uppercase tracking-wider px-5 py-3">
                                    Status
                                </th>
                                <th className="text-left text-xs font-medium text-white/30 uppercase tracking-wider px-5 py-3">
                                    Copies
                                </th>
                                <th className="text-left text-xs font-medium text-white/30 uppercase tracking-wider px-5 py-3">
                                    Date
                                </th>
                                <th className="text-right text-xs font-medium text-white/30 uppercase tracking-wider px-5 py-3">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {prompts.map((prompt) => (
                                <tr
                                    key={prompt._id}
                                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            {prompt.thumbnailUrl && (
                                                <img
                                                    src={prompt.thumbnailUrl}
                                                    alt=""
                                                    className="w-10 h-10 rounded-lg object-cover bg-white/5"
                                                />
                                            )}
                                            <span className="text-sm text-white/80 truncate max-w-[200px]">
                                                {prompt.title}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-xs text-white/40 font-mono">
                                            {prompt.category}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <StatusBadge status={prompt.status} />
                                    </td>
                                    <td className="px-5 py-3 text-sm text-white/50">
                                        {prompt.copyCount}
                                    </td>
                                    <td className="px-5 py-3 text-xs text-white/30">
                                        {new Date(prompt.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openDeleteModal(prompt._id, prompt.title)}
                                                className="px-3 py-1 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {prompts.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-white/20 text-sm">
                                        No prompts found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 text-xs text-white/40 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        ← Previous
                    </button>
                    <span className="text-xs text-white/30">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1.5 text-xs text-white/40 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* ── Delete Confirmation Modal ──────────────────────────────── */}
            {deletingId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm">
                        {/* Warning icon */}
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-red-400">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                <line x1="10" x2="10" y1="11" y2="17" />
                                <line x1="14" x2="14" y1="11" y2="17" />
                            </svg>
                        </div>

                        <h3 className="text-lg font-display font-bold text-white text-center mb-2">
                            Delete Prompt
                        </h3>
                        <p className="text-sm text-white/40 text-center mb-1">
                            Are you sure you want to delete
                        </p>
                        <p className="text-sm text-white/70 text-center font-medium mb-6 truncate px-2">
                            &ldquo;{deletingTitle}&rdquo;
                        </p>
                        <p className="text-xs text-red-400/60 text-center mb-6">
                            This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setDeletingId(null);
                                    setDeletingTitle('');
                                }}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-white/50 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        published: 'bg-green-500/15 text-green-400 border-green-500/20',
        pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
        rejected: 'bg-red-500/15 text-red-400 border-red-500/20',
    };

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${styles[status] || 'bg-white/5 text-white/40 border-white/10'}`}
        >
            {status}
        </span>
    );
}
