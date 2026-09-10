/**
 * KV Index: Replication layer for fast reads.
 *
 * After a ledger entry is committed to the hash chain (source of truth),
 * we replicate index data to KV for fast global reads:
 *
 *   entry:{entry_id}           → { topic, sequence, type, subtype, state, timestamp, entry_hash }
 *   topic:{topic}:entries      → [entry_id, ...] (ordered)
 *   topic:{topic}:meta         → { entry_count, last_entry_at, last_entry_hash }
 *   topics:list                → [{ topic, entry_count, last_entry_at }, ...]
 *   contributions:{topic}      → [entry_id, ...] (contributions only, for feed)
 *
 * KV is eventually consistent: the Ledger Chain DO is the source of truth.
 * KV is for reads. DO is for writes.
 */

/**
 * Replicate a new entry to KV indexes.
 * Called after successful append to the Ledger Chain DO.
 * Uses ctx.waitUntil() so it doesn't block the response.
 */
export async function replicateToKV(env, ctx, entry, chainResult) {
    const work = async () => {
        const kv = env.ACTA_KV;
        if (!kv) return; // KV not configured: skip silently

        const entryMeta = {
            entry_id: chainResult.entry_id,
            topic: entry.topic,
            sequence: chainResult.sequence,
            type: entry.type,
            subtype: entry.subtype,
            state: entry.state,
            author_type: entry.author.type,
            timestamp: new Date().toISOString(),
            entry_hash: chainResult.entry_hash,
            prev_hash: chainResult.prev_hash,
            linked_to: entry.linked_to || [],
            // Payload summary for feed display (truncated)
            body_preview: truncate(entry.payload?.body, 200),
            category: entry.payload?.category || null,
            tags: entry.payload?.tags || [],
            moderation_tags: entry.moderation_tags || [],
        };

        // 1. Entry index: fast lookup by entry_id
        await kv.put(
            `entry:${chainResult.entry_id}`,
            JSON.stringify(entryMeta),
            { expirationTtl: 86400 * 365 } // 1 year
        );

        // 2. Topic entries list: append entry_id
        const topicEntriesKey = `topic:${entry.topic}:entries`;
        const existing = await kv.get(topicEntriesKey, { type: 'json' }) || [];
        existing.push(chainResult.entry_id);
        await kv.put(topicEntriesKey, JSON.stringify(existing));

        // 3. Topic metadata: count, last entry
        await kv.put(`topic:${entry.topic}:meta`, JSON.stringify({
            topic: entry.topic,
            entry_count: existing.length,
            last_entry_at: entryMeta.timestamp,
            last_entry_hash: chainResult.entry_hash,
        }));

        // 4. Contributions-only index (for feed display)
        if (entry.type === 'contribution') {
            const contribKey = `contributions:${entry.topic}`;
            const contribs = await kv.get(contribKey, { type: 'json' }) || [];
            contribs.push(chainResult.entry_id);
            await kv.put(contribKey, JSON.stringify(contribs));
        }

        // 5. Global topics list: update
        await updateTopicsList(kv, entry.topic, existing.length, entryMeta.timestamp);
    };

    // Non-blocking replication
    if (ctx && ctx.waitUntil) {
        ctx.waitUntil(work());
    } else {
        await work();
    }
}

/**
 * Read an entry from KV by entry_id.
 * Returns null if not found (caller should fall back to DO).
 */
export async function getEntryFromKV(env, entryId) {
    const kv = env.ACTA_KV;
    if (!kv) return null;
    return kv.get(`entry:${entryId}`, { type: 'json' });
}

/**
 * Get the topic for an entry_id (for routing to the right DO).
 */
export async function getTopicForEntry(env, entryId) {
    const meta = await getEntryFromKV(env, entryId);
    return meta?.topic || null;
}

/**
 * List all topics with metadata.
 */
export async function listTopics(env) {
    const kv = env.ACTA_KV;
    if (!kv) return [];
    const topics = await kv.get('topics:list', { type: 'json' });
    return topics || [];
}

/**
 * Get feed entries for a topic from KV (fast global reads).
 * Returns entry metadata (not full payloads: those come from the DO).
 */
export async function getFeedFromKV(env, topic, { offset = 0, limit = 20 } = {}) {
    const kv = env.ACTA_KV;
    if (!kv) return null;

    const entryIds = await kv.get(`topic:${topic}:entries`, { type: 'json' });
    if (!entryIds) return { entries: [], total: 0 };

    // Reverse chronological
    const reversed = [...entryIds].reverse();
    const slice = reversed.slice(offset, offset + limit);

    const entries = [];
    for (const id of slice) {
        const meta = await kv.get(`entry:${id}`, { type: 'json' });
        if (meta) entries.push(meta);
    }

    return {
        entries,
        total: entryIds.length,
        offset,
        limit,
        has_more: offset + limit < entryIds.length,
    };
}

// ── Helpers ─────────────────────────────────────────────────────────

function truncate(str, maxLen) {
    if (!str || typeof str !== 'string') return null;
    return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}

async function updateTopicsList(kv, topic, entryCount, lastEntryAt) {
    const topics = await kv.get('topics:list', { type: 'json' }) || [];
    const idx = topics.findIndex(t => t.topic === topic);

    const topicMeta = { topic, entry_count: entryCount, last_entry_at: lastEntryAt };

    if (idx >= 0) {
        topics[idx] = topicMeta;
    } else {
        topics.push(topicMeta);
    }

    // Sort by most recent activity
    topics.sort((a, b) => new Date(b.last_entry_at) - new Date(a.last_entry_at));

    await kv.put('topics:list', JSON.stringify(topics));
}
