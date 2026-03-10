import mongoose, { Schema, Document } from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// Security Log Model — tracks admin login attempts and blocked access
// ─────────────────────────────────────────────────────────────────────────────

export interface ISecurityLog extends Document {
    type: 'login_success' | 'login_failed' | 'blocked';
    ip: string;
    userAgent: string;
    details: string;
    timestamp: Date;
}

const SecurityLogSchema = new Schema<ISecurityLog>(
    {
        type: {
            type: String,
            enum: ['login_success', 'login_failed', 'blocked'],
            required: true,
        },
        ip: {
            type: String,
            required: true,
        },
        userAgent: {
            type: String,
            default: '',
        },
        details: {
            type: String,
            default: '',
        },
        timestamp: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        // Auto-delete logs older than 90 days
        expireAfterSeconds: 90 * 24 * 60 * 60,
    },
);

// TTL index on timestamp — MongoDB auto-deletes old entries
SecurityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.models.SecurityLog ||
    mongoose.model<ISecurityLog>('SecurityLog', SecurityLogSchema);
