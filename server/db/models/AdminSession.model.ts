import mongoose, { Schema, Document, Model } from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface IAdminSession {
    token: string;
    createdAt: Date;
    expiresAt: Date;
}

export interface IAdminSessionDocument extends Document, IAdminSession { }

// ─────────────────────────────────────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────────────────────────────────────

const AdminSessionSchema = new Schema<IAdminSessionDocument>({
    token: {
        type: String,
        required: [true, 'Token is required'],
        unique: true,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: [true, 'Expiration date is required'],
    },
});

// ─────────────────────────────────────────────────────────────────────────────
// TTL Index — MongoDB auto-deletes expired sessions
// ─────────────────────────────────────────────────────────────────────────────

AdminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ─────────────────────────────────────────────────────────────────────────────
// Export — safe for Next.js HMR
// ─────────────────────────────────────────────────────────────────────────────

const AdminSession: Model<IAdminSessionDocument> =
    (mongoose.models.AdminSession as Model<IAdminSessionDocument>) ||
    mongoose.model<IAdminSessionDocument>('AdminSession', AdminSessionSchema);

export default AdminSession;
