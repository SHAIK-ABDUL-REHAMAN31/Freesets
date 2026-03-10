'use client';

import { useState, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SubmissionRow {
    _id: string;
    title: string;
    category: string;
    status: string;
    submittedImageUrl: string;
    notes?: string;
    createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminSubmissionsPage() {
    const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/submissions?status=pending');
            const data = await res.json();
            if (data.success) {
                setSubmissions(data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch submissions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/submissions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve' }),
            });
            if (res.ok) {
                setSubmissions((prev) => prev.filter((s) => s._id !== id));
            }
        } catch (err) {
            console.error('Approve failed:', err);
        }
    };

    const handleReject = async () => {
        if (!rejectingId) return;
        try {
            const res = await fetch(`/api/admin/submissions/${rejectingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'reject',
                    rejectionReason: rejectionReason || 'Does not meet quality standards.',
                }),
            });
            if (res.ok) {
                setSubmissions((prev) => prev.filter((s) => s._id !== rejectingId));
            }
        } catch (err) {
            console.error('Reject failed:', err);
        } finally {
            setRejectingId(null);
            setRejectionReason('');
        }
    };

    return (
        <div className="max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-display font-bold text-white">
                    Review Submissions
                </h1>
                <p className="text-sm text-white/40 mt-1">
                    Approve or reject user-submitted prompts
                </p>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-6 h-6 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
                </div>
            ) : submissions.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-4xl mb-4">📭</p>
                    <p className="text-white/30 text-sm">No pending submissions</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {submissions.map((sub) => (
                        <div
                            key={sub._id}
                            className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5"
                        >
                            {/* Image preview */}
                            {sub.submittedImageUrl && (
                                <img
                                    src={sub.submittedImageUrl}
                                    alt=""
                                    className="w-full sm:w-24 h-40 sm:h-24 rounded-lg object-cover bg-white/5 flex-shrink-0"
                                />
                            )}

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-white/80 mb-1">
                                    {sub.title}
                                </h3>
                                <p className="text-xs text-white/30 font-mono mb-1">
                                    {sub.category}
                                </p>
                                {sub.notes && (
                                    <p className="text-xs text-white/20 italic">
                                        &ldquo;{sub.notes}&rdquo;
                                    </p>
                                )}
                                <p className="text-[10px] text-white/20 mt-2">
                                    Submitted {new Date(sub.createdAt).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center sm:items-start gap-2 flex-shrink-0">
                                <button
                                    onClick={() => handleApprove(sub._id)}
                                    className="flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg transition-colors"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => setRejectingId(sub._id)}
                                    className="flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Rejection Reason Modal */}
            {rejectingId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="bg-[#141414] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-display font-bold text-white mb-4">
                            Rejection Reason
                        </h3>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={3}
                            placeholder="Provide a reason for rejection..."
                            className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#7C3AED]/40 resize-none mb-4"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setRejectingId(null);
                                    setRejectionReason('');
                                }}
                                className="px-4 py-2 text-sm text-white/40 hover:text-white/60 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="px-4 py-2 text-sm font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                                Reject Submission
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
