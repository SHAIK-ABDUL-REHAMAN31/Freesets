// ─────────────────────────────────────────────────────────────────────────────
// scripts/add-indexes.ts
//
// Run once to create/update MongoDB indexes on the Prompt collection.
// Usage: npm run add-indexes
// ─────────────────────────────────────────────────────────────────────────────

import dotenv from 'dotenv';
import path from 'path';

// Load .env.local (Next.js convention)
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

import connectDB from '../server/db/connect';
import Prompt from '../server/db/models/Prompt.model';

async function addIndexes() {
    try {
        console.log('Connecting to MongoDB...');
        await connectDB();

        console.log('Creating indexes on Prompt collection...');
        await Prompt.createIndexes();

        console.log('✅ Indexes created successfully:');
        const indexes = await Prompt.collection.indexes();
        indexes.forEach((idx) => {
            console.log(`   → ${idx.name}: ${JSON.stringify(idx.key)}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to create indexes:', error);
        process.exit(1);
    }
}

addIndexes();
