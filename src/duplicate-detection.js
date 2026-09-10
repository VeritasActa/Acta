/**
 * Duplicate Detection: Tier 1 deterministic check.
 *
 * Policy §4.1: >80% content similarity from same device within 24h → reject.
 *
 * Uses a simple n-gram similarity (Jaccard index on word trigrams).
 * Not fuzzy ML: deterministic and fast.
 */

/**
 * Check if a contribution is a duplicate of a recent entry from the same device.
 * Returns { duplicate: false } or { duplicate: true, similar_entry_id, similarity }
 */
export async function checkDuplicate(env, entry) {
    const kv = env.ACTA_KV;
    if (!kv) return { duplicate: false };

    const deviceHash = entry.author?.device_attestation_hash;
    if (!deviceHash) return { duplicate: false };

    // Get recent entries from this device (last 24h)
    const recentKey = `device-recent:${deviceHash}`;
    const recent = await kv.get(recentKey, { type: 'json' }) || [];

    const body = entry.payload?.body || '';
    if (body.length < 20) return { duplicate: false }; // Too short to meaningfully compare

    const bodyGrams = trigrams(body);

    for (const prev of recent) {
        const similarity = jaccardSimilarity(bodyGrams, trigrams(prev.body));
        if (similarity > 0.8) {
            return {
                duplicate: true,
                similar_entry_id: prev.entry_id,
                similarity: Math.round(similarity * 100),
            };
        }
    }

    return { duplicate: false };
}

/**
 * Record a submission for future duplicate detection.
 * Called after a successful ledger append.
 */
export async function recordSubmission(env, ctx, entry, entryId) {
    const kv = env.ACTA_KV;
    if (!kv) return;

    const deviceHash = entry.author?.device_attestation_hash;
    if (!deviceHash) return;

    const work = async () => {
        const recentKey = `device-recent:${deviceHash}`;
        const recent = await kv.get(recentKey, { type: 'json' }) || [];

        recent.push({
            entry_id: entryId,
            body: (entry.payload?.body || '').slice(0, 500), // Truncate for storage
            timestamp: new Date().toISOString(),
        });

        // Keep only last 20 entries per device
        const trimmed = recent.slice(-20);

        await kv.put(recentKey, JSON.stringify(trimmed), {
            expirationTtl: 86400, // 24h TTL: auto-cleans
        });
    };

    if (ctx?.waitUntil) {
        ctx.waitUntil(work());
    } else {
        await work();
    }
}

// ── Similarity Functions ────────────────────────────────────────────

/**
 * Generate word-level trigrams from text.
 */
function trigrams(text) {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    const grams = new Set();
    for (let i = 0; i <= words.length - 3; i++) {
        grams.add(words.slice(i, i + 3).join(' '));
    }
    return grams;
}

/**
 * Jaccard similarity index between two sets.
 */
function jaccardSimilarity(setA, setB) {
    if (setA.size === 0 && setB.size === 0) return 1;
    if (setA.size === 0 || setB.size === 0) return 0;

    let intersection = 0;
    for (const gram of setA) {
        if (setB.has(gram)) intersection++;
    }

    const union = setA.size + setB.size - intersection;
    return union === 0 ? 0 : intersection / union;
}
