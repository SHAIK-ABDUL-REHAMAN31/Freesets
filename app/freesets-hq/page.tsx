import connectDB from '@/server/db/connect';
import Prompt from '@/server/db/models/Prompt.model';
import Link from 'next/link';
import CloudinaryAccountStatus from '@/components/admin/CloudinaryAccountStatus';

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Stats loader
// ─────────────────────────────────────────────────────────────────────────────

async function getStats() {
    await connectDB();

    const [totalPrompts, published, pending, downloadAgg, recentPrompts] = await Promise.all([
        Prompt.countDocuments({}),
        Prompt.countDocuments({ status: 'published' }),
        Prompt.countDocuments({ status: 'pending' }),
        Prompt.aggregate([
            { $group: { _id: null, totalDownloads: { $sum: '$downloadCount' } } },
        ]),
        Prompt.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title category status createdAt thumbnailUrl')
            .lean(),
    ]);

    const totalDownloads = downloadAgg[0]?.totalDownloads ?? 0;

    return { totalPrompts, published, pending, totalDownloads, recentPrompts };
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
    const stats = await getStats();
    const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/freesets-hq';

    const STAT_CARDS = [
        {
            label: 'Total Prompts',
            value: stats.totalPrompts,
            icon: '📦',
            color: 'from-blue-500/20 to-blue-600/5',
            border: 'border-blue-500/20',
        },
        {
            label: 'Published',
            value: stats.published,
            icon: '✅',
            color: 'from-green-500/20 to-green-600/5',
            border: 'border-green-500/20',
        },
        {
            label: 'Pending Review',
            value: stats.pending,
            icon: '⏳',
            color: 'from-yellow-500/20 to-yellow-600/5',
            border: 'border-yellow-500/20',
        },
        {
            label: 'Total Downloads',
            value: stats.totalDownloads.toLocaleString(),
            icon: '📥',
            color: 'from-purple-500/20 to-purple-600/5',
            border: 'border-purple-500/20',
        },
    ];

    return (
        <div className="max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
                <p className="text-sm text-white/40 mt-1">
                    Welcome back, {process.env.ADMIN_USERNAME || 'Admin'}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {STAT_CARDS.map((card) => (
                    <div
                        key={card.label}
                        className={`bg-gradient-to-br ${card.color} border ${card.border} rounded-xl p-5`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl">{card.icon}</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{card.value}</p>
                        <p className="text-xs text-white/40 mt-1">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mb-10">
                <Link
                    href={`${adminPath}/prompts/new`}
                    className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium rounded-lg transition-colors"
                >
                    + Add New Prompt
                </Link>
                <Link
                    href={`${adminPath}/submissions`}
                    className="px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white/70 text-sm font-medium rounded-lg border border-white/[0.08] transition-colors"
                >
                    📥 Review Submissions
                </Link>
            </div>

            {/* Recent Prompts */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-display font-bold text-white">Recent Prompts</h2>
                    <Link
                        href={`${adminPath}/prompts`}
                        className="text-xs text-[#A78BFA] hover:text-white transition-colors"
                    >
                        View all →
                    </Link>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-x-auto">
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
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentPrompts.map((prompt: any) => (
                                <tr
                                    key={prompt._id.toString()}
                                    className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            {prompt.thumbnailUrl && (
                                                <img
                                                    src={prompt.thumbnailUrl}
                                                    alt=""
                                                    className="w-8 h-8 rounded object-cover bg-white/5"
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
                                    <td className="px-5 py-3 text-xs text-white/30">
                                        {new Date(prompt.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {stats.recentPrompts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-5 py-8 text-center text-white/20 text-sm">
                                        No prompts yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cloudinary Accounts Status */}
            <div className="mt-10">
                <CloudinaryAccountStatus />
            </div>
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
