import mongoose from 'mongoose';

// ─────────────────────────────────────────────────────────────────────────────
// Singleton connection cache
//
// In development, Next.js hot-reloads clear the Node module cache on every
// edit, which would open a new Mongo connection each time. By stashing the
// pending connection promise on `globalThis` we reuse the same socket across
// hot reloads.
//
// In production (serverless), the same global cache keeps the connection alive
// for the lifetime of the warm container, avoiding a TCP + TLS handshake on
// every invocation.
// ─────────────────────────────────────────────────────────────────────────────

interface MongoCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

// Extend globalThis so TypeScript is happy
declare global {
    // eslint-disable-next-line no-var
    var __mongoCache: MongoCache | undefined;
}

const cached: MongoCache = globalThis.__mongoCache ?? { conn: null, promise: null };

if (!globalThis.__mongoCache) {
    globalThis.__mongoCache = cached;
}

// ─────────────────────────────────────────────────────────────────────────────
// connectDB — call from any API route / server action
// ─────────────────────────────────────────────────────────────────────────────

export default async function connectDB(): Promise<typeof mongoose> {
    // Already connected — return immediately
    if (cached.conn) {
        return cached.conn;
    }

    // Validate env
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error(
            '❌  MONGODB_URI is not defined.\n' +
            '    → Add it to .env.local (see .env.example for reference).',
        );
    }

    // Reuse an in-flight connection promise (prevents duplicate connects during
    // concurrent requests that hit the server before the first connect resolves)
    if (!cached.promise) {
        cached.promise = mongoose
            .connect(uri, {
                bufferCommands: false,            // fail fast instead of queueing ops before connect
                maxPoolSize: 10,                  // limit connection pool
                serverSelectionTimeoutMS: 5000,   // fail fast if server unreachable
                socketTimeoutMS: 45000,           // close stale sockets after 45s
            })
            .then((m) => {
                console.log('✅  MongoDB connected —', m.connection.host);
                return m;
            })
            .catch((err) => {
                // Reset so the next call retries instead of returning a rejected promise
                cached.promise = null;
                console.error('❌  MongoDB connection error:', err.message);
                throw err;
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
