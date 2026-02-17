#!/usr/bin/env node

/**
 * Link Category Images Script
 *
 * Updates each Sanity Category to use the 'mainImage' of the most recent Post
 * in that category.
 *
 * Usage:
 *   node scripts/link-category-images.mjs
 */

import 'dotenv/config';
import { createClient } from '@sanity/client';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// ─── Load .env from scripts/ directory ───────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env'), override: true });

// ─── Configuration ───────────────────────────────────────────────────
const sanity = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    token: process.env.SANITY_TOKEN,
    apiVersion: '2024-02-09',
    useCdn: false,
});

async function main() {
    console.log('═══════════════════════════════════════════════════');
    console.log('  Linking Category Images to Latest Post Images');
    console.log('═══════════════════════════════════════════════════\n');

    // Validate token
    if (!process.env.SANITY_TOKEN || process.env.SANITY_TOKEN.includes('YOUR_SANITY_WRITE_TOKEN')) {
        console.error('❌ Error: Please set your SANITY_TOKEN in scripts/.env');
        process.exit(1);
    }

    // 1. Fetch all categories
    console.log('🔍 Fetching categories...');
    const categories = await sanity.fetch(`*[_type == "category"]{ _id, title }`);
    console.log(`   Found ${categories.length} categories.\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    // 2. Process each category
    for (const category of categories) {
        const title = category.title.sv || category.title.en || 'Untitled';
        console.log(`📂 Processing category: "${title}" (${category._id})`);

        // Find the latest post in this category that has a mainImage
        const query = `*[_type == "post" && references($catId) && defined(mainImage)] | order(publishedAt desc)[0]`;
        const latestPost = await sanity.fetch(query, { catId: category._id });

        if (!latestPost) {
            console.log(`   🔸 No posts with images found for this category.`);
            skippedCount++;
            continue;
        }

        const postTitle = latestPost.title.sv || latestPost.title.en;
        console.log(`   Found latest post: "${postTitle}"`);

        if (!latestPost.mainImage) {
            console.log(`   🔸 Post has no mainImage. Skipping.`);
            skippedCount++;
            continue;
        }

        // 3. Update the category with the post's mainImage
        try {
            await sanity
                .patch(category._id)
                .set({ image: latestPost.mainImage })
                .commit();
            console.log(`   ✅ Updated category image from post.`);
            updatedCount++;
        } catch (err) {
            console.error(`   ❌ Failed to update category: ${err.message}`);
        }
        console.log(''); // Empty line for readability
    }

    // ─── Summary ───
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Update complete!`);
    console.log(`  ✅ Updated: ${updatedCount}`);
    console.log(`  ⏭ Skipped: ${skippedCount}`);
    console.log('═══════════════════════════════════════════════════\n');
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
