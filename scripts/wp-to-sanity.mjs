#!/usr/bin/env node

/**
 * WordPress → Sanity Migration Script
 *
 * Fetches all posts from the WordPress REST API for dagsaktuell.wordpress.com
 * and creates corresponding documents in Sanity CMS.
 *
 * Usage:
 *   node scripts/wp-to-sanity.mjs --single   # Migrate first post only (test)
 *   node scripts/wp-to-sanity.mjs             # Migrate all posts
 */

import 'dotenv/config';
import { createClient } from '@sanity/client';
import { JSDOM } from 'jsdom';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// ─── Load .env from scripts/ directory ───────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Re-load dotenv pointing at scripts/.env
import dotenv from 'dotenv';
dotenv.config({ path: resolve(__dirname, '.env'), override: true });

// ─── Configuration ───────────────────────────────────────────────────
const WP_BASE = 'https://public-api.wordpress.com/wp/v2/sites/dagsaktuell.wordpress.com';
const SINGLE_MODE = process.argv.includes('--single');

const sanity = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    token: process.env.SANITY_TOKEN,
    apiVersion: '2024-02-09',
    useCdn: false,
});

// ─── Helpers ─────────────────────────────────────────────────────────
function randomKey() {
    return randomUUID().replace(/-/g, '').slice(0, 12);
}

/** Decode HTML entities like &amp; &#8220; etc. */
function decodeHtml(html) {
    const dom = new JSDOM(`<!DOCTYPE html><body>${html}</body>`);
    return dom.window.document.body.textContent || '';
}

/** Strip all HTML tags and return plain text (for excerpts) */
function stripHtml(html) {
    return decodeHtml(html).trim();
}

/** Sleep helper for rate-limiting */
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

// ─── WordPress API Fetchers ──────────────────────────────────────────

/** Fetch all pages of a paginated WP endpoint */
async function wpFetchAll(endpoint, perPage = 10) {
    const results = [];
    let page = 1;
    while (true) {
        const url = `${WP_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}per_page=${perPage}&page=${page}`;
        console.log(`  ↳ Fetching ${url}`);
        const res = await fetch(url);
        if (!res.ok) {
            // WP returns 400 when page is out of range
            if (res.status === 400) break;
            throw new Error(`WP API error ${res.status}: ${await res.text()}`);
        }
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) break;
        results.push(...data);
        page++;
        await sleep(300); // be polite
    }
    return results;
}

/** Fetch a single WP entity */
async function wpFetch(endpoint) {
    const url = `${WP_BASE}${endpoint}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
}

// ─── Sanity "upsert" helpers ─────────────────────────────────────────

/** Find or create a Sanity category, returns its _id */
async function findOrCreateCategory(wpCat) {
    // Search by Swedish title
    const existing = await sanity.fetch(
        `*[_type == "category" && title.sv == $name][0]._id`,
        { name: wpCat.name }
    );
    if (existing) {
        console.log(`  ✓ Category "${wpCat.name}" already exists (${existing})`);
        return existing;
    }

    const doc = await sanity.create({
        _type: 'category',
        title: { _type: 'localeString', sv: wpCat.name, en: '' },
        description: { _type: 'localeString', sv: wpCat.description || '', en: '' },
    });
    console.log(`  + Created category "${wpCat.name}" → ${doc._id}`);
    return doc._id;
}

/** Find or create a Sanity author, returns its _id */
async function findOrCreateAuthor(name) {
    const existing = await sanity.fetch(
        `*[_type == "author" && name == $name][0]._id`,
        { name }
    );
    if (existing) {
        console.log(`  ✓ Author "${name}" already exists (${existing})`);
        return existing;
    }

    const slug = name
        .toLowerCase()
        .replace(/[åä]/g, 'a')
        .replace(/ö/g, 'o')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const doc = await sanity.create({
        _type: 'author',
        name,
        slug: { _type: 'slug', current: slug },
    });
    console.log(`  + Created author "${name}" → ${doc._id}`);
    return doc._id;
}

// ─── Image handling ──────────────────────────────────────────────────

/** Download an image URL and upload it to Sanity, returns asset reference */
async function uploadImageToSanity(imageUrl) {
    try {
        console.log(`  📷 Downloading ${imageUrl.slice(0, 80)}…`);
        const res = await fetch(imageUrl);
        if (!res.ok) {
            console.warn(`  ⚠ Failed to download image (${res.status}): ${imageUrl}`);
            return null;
        }
        const buffer = Buffer.from(await res.arrayBuffer());

        // Extract a filename from the URL
        const urlPath = new URL(imageUrl).pathname;
        const filename = urlPath.split('/').pop() || 'image.jpg';

        const asset = await sanity.assets.upload('image', buffer, { filename });
        console.log(`  📷 Uploaded → ${asset._id}`);
        return {
            _type: 'image',
            asset: { _type: 'reference', _ref: asset._id },
        };
    } catch (err) {
        console.warn(`  ⚠ Image upload failed for ${imageUrl}: ${err.message}`);
        return null;
    }
}

// ─── HTML → Portable Text Conversion ────────────────────────────────

/**
 * Convert an HTML string (WP content.rendered) to a Sanity Portable Text array.
 * Also handles image extraction & upload.
 */
async function htmlToPortableText(html) {
    const dom = new JSDOM(`<!DOCTYPE html><body>${html}</body>`);
    const body = dom.window.document.body;
    const blocks = [];

    // Process top-level nodes
    for (const node of body.childNodes) {
        const result = await processNode(node);
        if (result) {
            if (Array.isArray(result)) {
                blocks.push(...result);
            } else {
                blocks.push(result);
            }
        }
    }

    return blocks;
}

/** Process a single DOM node into Portable Text block(s) */
async function processNode(node) {
    // Skip pure whitespace text nodes
    if (node.nodeType === 3) {  // TEXT_NODE
        const text = node.textContent.trim();
        if (!text) return null;
        // Standalone text → normal paragraph
        return makeTextBlock(text, 'normal');
    }

    if (node.nodeType !== 1) return null; // Only process ELEMENT_NODE

    const tag = node.tagName.toLowerCase();

    // ── Figures with images ──
    if (tag === 'figure') {
        return await processFigure(node);
    }

    // ── Standalone images ──
    if (tag === 'img') {
        return await processImage(node, null);
    }

    // ── Headings ──
    if (/^h[1-4]$/.test(tag)) {
        const spans = extractSpans(node);
        if (spans.children.length === 0) return null;
        return {
            _type: 'block',
            _key: randomKey(),
            style: tag,
            markDefs: spans.markDefs,
            children: spans.children,
        };
    }

    // ── Blockquote ──
    if (tag === 'blockquote') {
        // Blockquote may contain <p> tags inside
        const innerText = node.textContent.trim();
        if (!innerText) return null;
        const spans = extractSpans(node);
        return {
            _type: 'block',
            _key: randomKey(),
            style: 'blockquote',
            markDefs: spans.markDefs,
            children: spans.children,
        };
    }

    // ── Unordered lists ──
    if (tag === 'ul') {
        const items = [];
        for (const li of node.querySelectorAll('li')) {
            const spans = extractSpans(li);
            if (spans.children.length === 0) continue;
            items.push({
                _type: 'block',
                _key: randomKey(),
                style: 'normal',
                listItem: 'bullet',
                level: 1,
                markDefs: spans.markDefs,
                children: spans.children,
            });
        }
        return items.length > 0 ? items : null;
    }

    // ── Ordered lists ──
    if (tag === 'ol') {
        const items = [];
        for (const li of node.querySelectorAll('li')) {
            const spans = extractSpans(li);
            if (spans.children.length === 0) continue;
            items.push({
                _type: 'block',
                _key: randomKey(),
                style: 'normal',
                listItem: 'number',
                level: 1,
                markDefs: spans.markDefs,
                children: spans.children,
            });
        }
        return items.length > 0 ? items : null;
    }

    // ── Paragraphs & divs ──
    if (tag === 'p' || tag === 'div') {
        // Check if this paragraph contains only an image
        const img = node.querySelector('img');
        if (img && node.textContent.trim().length === 0) {
            return await processImage(img, null);
        }

        // Check if contains a figure
        const figure = node.querySelector('figure');
        if (figure) {
            return await processFigure(figure);
        }

        const spans = extractSpans(node);
        if (spans.children.length === 0) return null;

        return {
            _type: 'block',
            _key: randomKey(),
            style: 'normal',
            markDefs: spans.markDefs,
            children: spans.children,
        };
    }

    // ── Fallback: try to extract text from unknown elements ──
    const text = node.textContent.trim();
    if (text) {
        return makeTextBlock(text, 'normal');
    }
    return null;
}

/** Process a <figure> element containing an <img> and optional <figcaption> */
async function processFigure(figure) {
    const img = figure.querySelector('img');
    if (!img) return null;

    const caption = figure.querySelector('figcaption');
    const captionText = caption ? caption.textContent.trim() : '';
    return await processImage(img, captionText);
}

/** Download an image and return a Sanity image block */
async function processImage(imgEl, captionText) {
    // Try various src attributes (WP sometimes uses data-orig-file, etc.)
    const src = imgEl.getAttribute('data-orig-file')
        || imgEl.getAttribute('src')
        || '';

    if (!src) return null;

    const imageAsset = await uploadImageToSanity(src);
    if (!imageAsset) return null;

    return {
        _type: 'image',
        _key: randomKey(),
        asset: imageAsset.asset,
        caption: captionText || undefined,
        alt: imgEl.getAttribute('alt') || '',
    };
}

/** Create a simple text block */
function makeTextBlock(text, style) {
    return {
        _type: 'block',
        _key: randomKey(),
        style,
        markDefs: [],
        children: [
            { _type: 'span', _key: randomKey(), text, marks: [] },
        ],
    };
}

/**
 * Extract inline spans from an element, handling <strong>, <em>, <a>, and nested elements.
 * Returns { children: [...], markDefs: [...] }
 */
function extractSpans(element) {
    const children = [];
    const markDefs = [];

    function walk(node, currentMarks) {
        if (node.nodeType === 3) {  // TEXT_NODE
            const text = node.textContent;
            if (text === '') return;
            children.push({
                _type: 'span',
                _key: randomKey(),
                text,
                marks: [...currentMarks],
            });
            return;
        }

        if (node.nodeType !== 1) return;

        const tag = node.tagName.toLowerCase();
        const newMarks = [...currentMarks];

        if (tag === 'strong' || tag === 'b') {
            newMarks.push('strong');
        } else if (tag === 'em' || tag === 'i') {
            newMarks.push('em');
        } else if (tag === 'a') {
            const href = node.getAttribute('href');
            if (href) {
                const markKey = randomKey();
                markDefs.push({
                    _type: 'link',
                    _key: markKey,
                    href,
                });
                newMarks.push(markKey);
            }
        }

        // Skip image elements inside paragraphs (handled separately)
        if (tag === 'img' || tag === 'figure') return;

        for (const child of node.childNodes) {
            walk(child, newMarks);
        }
    }

    walk(element, []);
    return { children, markDefs };
}

// ─── Resolve WP Author ──────────────────────────────────────────────

/** Try to get author name from WP API, fall back gracefully */
async function resolveAuthorName(wpAuthorId) {
    // Try the user endpoint
    const user = await wpFetch(`/users/${wpAuthorId}`);
    if (user && user.name) {
        return user.name;
    }
    // Fallback
    return 'Dagsaktuellt';
}

// ─── Main Migration ──────────────────────────────────────────────────

async function main() {
    console.log('═══════════════════════════════════════════════════');
    console.log('  WordPress → Sanity Migration');
    console.log(`  Mode: ${SINGLE_MODE ? 'SINGLE POST (test)' : 'ALL POSTS'}`);
    console.log('═══════════════════════════════════════════════════\n');

    // Validate token
    if (!process.env.SANITY_TOKEN || process.env.SANITY_TOKEN === 'YOUR_SANITY_WRITE_TOKEN_HERE') {
        console.error('❌ Error: Please set your SANITY_TOKEN in scripts/.env');
        console.error('   Get one at https://manage.sanity.io → Project → Settings → API → Tokens');
        process.exit(1);
    }

    // ── Step 1: Fetch and sync WP categories ──
    console.log('\n📂 Step 1: Syncing categories…');
    const wpCategories = await wpFetchAll('/categories', 100);
    console.log(`   Found ${wpCategories.length} WP categories`);

    const categoryMap = {}; // wpCatId → sanityCatId
    for (const wpCat of wpCategories) {
        categoryMap[wpCat.id] = await findOrCreateCategory(wpCat);
    }

    // ── Step 2: Fetch all WP posts ──
    console.log('\n📝 Step 2: Fetching WP posts…');
    let wpPosts;
    if (SINGLE_MODE) {
        const url = `${WP_BASE}/posts?per_page=1&page=1`;
        console.log(`  ↳ Fetching ${url}`);
        const res = await fetch(url);
        wpPosts = await res.json();
    } else {
        wpPosts = await wpFetchAll('/posts', 10);
    }
    console.log(`   Found ${wpPosts.length} posts to migrate\n`);

    // ── Step 3 & 4 & 5: Process each post ──
    const authorMap = {}; // wpAuthorId → sanityAuthorId
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < wpPosts.length; i++) {
        const wp = wpPosts[i];
        const title = decodeHtml(wp.title.rendered);
        console.log(`\n───────────────────────────────────────────────`);
        console.log(`📄 [${i + 1}/${wpPosts.length}] "${title}"`);
        console.log(`   Slug: ${wp.slug} | Date: ${wp.date}`);

        try {
            // ── Check if post already exists in Sanity ──
            const existingPost = await sanity.fetch(
                `*[_type == "post" && slug.current == $slug][0]._id`,
                { slug: wp.slug }
            );
            if (existingPost) {
                console.log(`   ⏭ Post already exists in Sanity (${existingPost}), skipping…`);
                continue;
            }

            // ── Resolve author ──
            if (!authorMap[wp.author]) {
                console.log(`\n   👤 Resolving author (WP ID: ${wp.author})…`);
                const authorName = await resolveAuthorName(wp.author);
                authorMap[wp.author] = await findOrCreateAuthor(authorName);
            }

            // ── Convert body HTML → Portable Text ──
            console.log(`   📝 Converting body HTML → Portable Text…`);
            const portableText = await htmlToPortableText(wp.content.rendered);
            console.log(`   📝 Generated ${portableText.length} blocks`);

            // ── Handle featured image ──
            let mainImage = undefined;
            if (wp.jetpack_featured_media_url) {
                console.log(`   🖼 Processing featured image…`);
                const imageAsset = await uploadImageToSanity(wp.jetpack_featured_media_url);
                if (imageAsset) {
                    mainImage = {
                        _type: 'image',
                        asset: imageAsset.asset,
                        alt: title,
                    };
                }
            }

            // ── Build category references ──
            const categoryRefs = (wp.categories || [])
                .filter((catId) => categoryMap[catId])
                .map((catId) => ({
                    _type: 'reference',
                    _ref: categoryMap[catId],
                    _key: randomKey(),
                }));

            // ── Create the Sanity post document ──
            const sanityPost = {
                _type: 'post',
                title: {
                    _type: 'localeString',
                    sv: title,
                    en: '',
                },
                slug: {
                    _type: 'slug',
                    current: wp.slug,
                },
                author: {
                    _type: 'reference',
                    _ref: authorMap[wp.author],
                },
                publishedAt: wp.date,
                body: {
                    _type: 'localeBlock',
                    sv: portableText,
                },
            };

            if (mainImage) {
                sanityPost.mainImage = mainImage;
            }

            if (categoryRefs.length > 0) {
                sanityPost.categories = categoryRefs;
            }

            const created = await sanity.create(sanityPost);
            console.log(`   ✅ Created post "${title}" → ${created._id}`);
            successCount++;
        } catch (err) {
            console.error(`   ❌ Error migrating "${title}": ${err.message}`);
            if (err.response?.body) {
                console.error(`      ${JSON.stringify(err.response.body)}`);
            }
            errorCount++;
        }

        // Rate-limit to be kind to both APIs
        await sleep(500);
    }

    // ── Summary ──
    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  Migration complete!`);
    console.log(`  ✅ Succeeded: ${successCount}`);
    console.log(`  ❌ Failed:    ${errorCount}`);
    console.log(`  ⏭ Skipped:   ${wpPosts.length - successCount - errorCount}`);
    console.log('═══════════════════════════════════════════════════\n');
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
