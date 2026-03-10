/**
 * Acta — Worker Entry Point
 *
 * Routes API requests to the appropriate handlers.
 * Full pipeline: Identity → Schema → Response Matrix → Duplicate → Moderation → Budget → Ledger → KV
 *
 * Key architectural decisions (from adversarial analysis):
 *   - device_id is private (for budget checks only)
 *   - topic_pseudonym is public (goes in the ledger, unlinkable across topics)
 *   - Moderation runs before budget (don't charge for held/rejected content)
 *   - Tier 1A rejects get public receipts; Tier 1B silently dropped with public counter
 *   - Response target matrix enforced (claims never resolve)
 *   - Shot clock with configurable decay for challenge state
 */

import { validateContribution, validateResponse, validateResponseTarget, computeState, TOKEN_COSTS } from './validators/schema.js';
import { replicateToKV, getEntryFromKV, getTopicForEntry, listTopics, getFeedFromKV } from './kv-index.js';
import { classifyContent, createRejectionReceipt, logSilentDrop, queueForHumanReview } from './moderation.js';
import { resolveIdentity } from './identity.js';
import { checkDuplicate, recordSubmission } from './duplicate-detection.js';
import { handleScheduled, getAnchorPublicKey } from './chain-publication.js';
import { renderHTML } from './ui.js';

// Re-export Durable Objects for wrangler
export { LedgerChain } from './durable-objects/ledger-chain.js';
export { DeviceBudget } from './durable-objects/device-budget.js';

// ── Policy Constants ────────────────────────────────────────────────

const CHALLENGE_DECAY_HOURS = 168; // 7 days default shot clock

// ── CORS ────────────────────────────────────────────────────────────

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, DPoP, X-Device-Id',
    'Access-Control-Max-Age': '86400',
};

function corsJson(body, init = {}) {
    const headers = { 'Content-Type': 'application/json', ...CORS_HEADERS, ...init.headers };
    return new Response(JSON.stringify(body), { ...init, headers });
}

function corsHtml(body, init = {}) {
    const headers = { 'Content-Type': 'text/html; charset=utf-8', ...init.headers };
    return new Response(body, { ...init, headers });
}

// ── Main Handler ────────────────────────────────────────────────────

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: CORS_HEADERS });
        }

        try {
            // ── Web UI ──
            if (request.method === 'GET' && url.pathname === '/') {
                return corsHtml(renderHTML('home', { topics: await listTopics(env) }));
            }

            if (request.method === 'GET' && url.pathname.startsWith('/topic/')) {
                const topic = decodeURIComponent(url.pathname.slice(7));
                return corsHtml(await renderTopicPage(env, topic));
            }

            if (request.method === 'GET' && url.pathname === '/about') {
                return corsHtml(renderHTML('about'));
            }

            if (request.method === 'GET' && url.pathname === '/moderation-log') {
                return corsHtml(await renderModerationLog(env));
            }

            // ── API: Read ──

            if (request.method === 'GET') {
                if (url.pathname === '/api/charter') {
                    return corsJson({
                        mission: 'A contestable, checkable public record for humans and AI.',
                        charter_url: 'https://github.com/VeritasActa/Acta/blob/main/CHARTER.md',
                        invariants: [
                            'Contributions are typed, each type carries an explicit burden',
                            'Every object has authorship provenance and revision history',
                            'Claims and decisions can be challenged',
                            'No entity can dominate attention through scale',
                            'Agents are disclosed delegates, not default peers',
                            'The record maintains fidelity, traceability, checkability, and integrity',
                            'Resolution and supersession are explicit',
                            'No automated system exercises epistemic discretion',
                            'Core procedures are public, versioned, and equally applied',
                            'Verification and exit do not depend on operator permission',
                        ],
                    });
                }

                if (url.pathname === '/api/topics') {
                    return corsJson(await listTopics(env));
                }

                if (url.pathname === '/api/feed') {
                    const topic = url.searchParams.get('topic');
                    if (!topic) return corsJson({ error: 'topic_required' }, { status: 400 });
                    return corsJson(await getTopicFeedWithState(env, topic.trim().toLowerCase()));
                }

                // Single entry lookup
                const entryMatch = url.pathname.match(/^\/api\/entry\/([a-f0-9-]{36})$/);
                if (entryMatch) {
                    return handleGetEntry(env, entryMatch[1]);
                }

                if (url.pathname === '/api/verify') {
                    const topic = url.searchParams.get('topic');
                    if (!topic) return corsJson({ error: 'topic_required' }, { status: 400 });
                    const chainDO = getChainDO(env, topic.trim().toLowerCase());
                    const resp = await chainDO.fetch(new Request('http://internal/verify'));
                    return corsJson(await resp.json());
                }

                // Chain heads for external anchoring
                if (url.pathname === '/api/chain-heads') {
                    return corsJson(await getChainHeads(env));
                }

                // Data export (full topic dump for independent verification)
                const exportMatch = url.pathname.match(/^\/api\/export\/(.+)$/);
                if (exportMatch) {
                    const topic = decodeURIComponent(exportMatch[1]).trim().toLowerCase();
                    return handleExport(env, topic);
                }

                // Moderation log API
                if (url.pathname === '/api/moderation-log') {
                    return corsJson(await getModerationEntries(env));
                }

                // Signed anchor — latest daily checkpoint
                if (url.pathname === '/api/anchor/latest') {
                    const raw = await env.ACTA_KV?.get('anchor:latest', { type: 'json' });
                    if (!raw) return corsJson({ error: 'no_anchors_yet' }, { status: 404 });
                    return corsJson(raw, {
                        headers: { 'Cache-Control': 'public, max-age=3600' },
                    });
                }

                // Public verification key for anchor signatures
                if (url.pathname === '/.well-known/acta-anchor-key') {
                    const publicKey = await getAnchorPublicKey(env);
                    if (!publicKey) {
                        return corsJson({ error: 'signing_not_configured' }, { status: 404 });
                    }
                    return corsJson({
                        algorithm: 'Ed25519',
                        public_key: publicKey,
                        usage: 'Verify acta:anchor checkpoint signatures. See tools/verify.js',
                        charter: 'https://github.com/VeritasActa/Acta/blob/main/CHARTER.md',
                    }, {
                        headers: { 'Cache-Control': 'public, max-age=86400' },
                    });
                }
            }

            // ── API: Write ──

            if (request.method === 'POST') {
                if (url.pathname === '/api/contribute') {
                    return handleContribute(request, env, ctx);
                }
                if (url.pathname === '/api/respond') {
                    return handleRespond(request, env, ctx);
                }
            }

            // 404
            if (url.pathname.startsWith('/api/')) {
                return corsJson({ error: 'not_found' }, { status: 404 });
            }
            return corsHtml(renderHTML('404'), { status: 404 });

        } catch (err) {
            console.error('[ACTA]', err);
            return corsJson({
                error: 'internal_error',
                message: env.ENVIRONMENT === 'development' ? err.message : 'An error occurred',
            }, { status: 500 });
        }
    },

    // Cron trigger: daily Merkle root anchoring of all chain heads
    async scheduled(event, env, ctx) {
        ctx.waitUntil(handleScheduled(env));
    },
};

// ── Write Handlers ──────────────────────────────────────────────────

async function handleContribute(request, env, ctx) {
    const body = await request.json();
    const { type, topic, payload } = body;

    if (!topic || typeof topic !== 'string' || topic.trim().length < 1) {
        return corsJson({ error: 'schema_validation_failed', errors: [{ field: 'topic', error: 'Required' }] }, { status: 422 });
    }

    const normalizedTopic = topic.trim().toLowerCase();

    // Tier 0: Identity (pass topic for per-topic pseudonym derivation)
    const identity = await resolveIdentity(request, env, normalizedTopic);
    if (!identity && env.ENVIRONMENT !== 'development') {
        return corsJson({ error: 'identity_required' }, { status: 401 });
    }

    const authorType = identity?.type || 'human';
    const deviceId = identity?.device_id || 'dev-anonymous';
    const topicPseudonym = identity?.topic_pseudonym || 'anon';

    // Tier 1: Schema validation
    const validation = validateContribution(type, payload || {});
    if (!validation.valid) {
        return corsJson({ error: 'schema_validation_failed', action: 'return_for_revision', errors: validation.errors }, { status: 422 });
    }

    // Build entry with per-topic pseudonym (public) — device_id never exposed
    const entry = {
        type: 'contribution',
        subtype: type,
        topic: normalizedTopic,
        author: {
            type: authorType,
            topic_pseudonym: topicPseudonym,   // PUBLIC: per-topic, unlinkable
            method: identity?.method || 'none',
            trust_level: identity?.trust_level || 'none',
            agent_operator: body.agent_operator || null,
            // Note: device_id is NOT stored in the entry. Budget checks use it server-side only.
        },
        payload,
        state: 'open',
        linked_to: [],
    };

    // Tier 1: Duplicate detection (uses device_id via author hash internally)
    const dupCheck = await checkDuplicate(env, entry);
    if (dupCheck.duplicate) {
        return corsJson({
            error: 'duplicate_detected',
            similarity: dupCheck.similarity,
            similar_entry_id: dupCheck.similar_entry_id,
            message: `This contribution is ${dupCheck.similarity}% similar to a recent submission from the same device.`,
        }, { status: 409 });
    }

    // Tier 2: Content classification (before budget — don't charge for held content)
    const classification = await classifyContent(env, entry);

    // Tier 1B: Silent drop (CSAM, malware, credible violence)
    if (classification.action === 'tier_1b_reject') {
        if (ctx?.waitUntil) ctx.waitUntil(logSilentDrop(env, classification));
        return corsJson({ error: 'submission_rejected' }, { status: 403 });
    }

    // Tier 1A: Public rejection receipt (doxxing, impersonation)
    if (classification.action === 'tier_1a_reject') {
        const receiptWork = async () => {
            await createRejectionReceipt(env, entry, classification);
            await queueForHumanReview(env, entry, classification);
        };
        if (ctx?.waitUntil) ctx.waitUntil(receiptWork());
        return corsJson({
            status: 'rejected',
            reason: 'Content flagged for review. A public rejection receipt has been created.',
            content_hash: classification.content_hash,
            appeal_state: 'open',
        }, { status: 422 });
    }

    if (classification.tags?.length > 0) entry.moderation_tags = classification.tags;

    // Tier 1: Budget check (after moderation — only charge for accepted content)
    const cost = TOKEN_COSTS[type] || 2;
    const budgetResult = await checkBudget(env, deviceId, authorType, cost);
    if (!budgetResult.allowed) {
        return corsJson({
            error: 'budget_exceeded',
            tokens_remaining: budgetResult.tokens_remaining,
            resets_at: budgetResult.resets_at,
        }, { status: 429 });
    }

    // Append to ledger chain
    const chainResult = await appendToChain(env, normalizedTopic, entry);

    // Async: KV replication + duplicate recording
    const asyncWork = async () => {
        await replicateToKV(env, null, entry, chainResult);
        await recordSubmission(env, null, entry, chainResult.entry_id);
    };
    if (ctx?.waitUntil) { ctx.waitUntil(asyncWork()); } else { await asyncWork(); }

    return corsJson({
        status: 'accepted',
        entry_id: chainResult.entry_id,
        entry_hash: chainResult.entry_hash,
        payload_hash: chainResult.payload_hash,
        sequence: chainResult.sequence,
        state: entry.state,
        moderation_tags: entry.moderation_tags || [],
        tokens_remaining: budgetResult.tokens_remaining,
    }, { status: 201 });
}

async function handleRespond(request, env, ctx) {
    const body = await request.json();
    const { type, topic, payload } = body;

    if (!topic || typeof topic !== 'string') {
        return corsJson({ error: 'schema_validation_failed', errors: [{ field: 'topic', error: 'Required' }] }, { status: 422 });
    }

    const normalizedTopic = topic.trim().toLowerCase();

    // Tier 0: Identity
    const identity = await resolveIdentity(request, env, normalizedTopic);
    if (!identity && env.ENVIRONMENT !== 'development') {
        return corsJson({ error: 'identity_required' }, { status: 401 });
    }

    const authorType = identity?.type || 'human';
    const deviceId = identity?.device_id || 'dev-anonymous';
    const topicPseudonym = identity?.topic_pseudonym || 'anon';

    // Tier 1: Schema
    const validation = validateResponse(type, payload || {});
    if (!validation.valid) {
        return corsJson({ error: 'schema_validation_failed', action: 'return_for_revision', errors: validation.errors }, { status: 422 });
    }

    // Tier 1: Response target matrix — check if this response type can target the given entry
    if (payload?.target_id) {
        const targetEntry = await getEntryFromKV(env, payload.target_id);
        if (targetEntry) {
            const matrixCheck = validateResponseTarget(type, targetEntry);
            if (!matrixCheck.valid) {
                return corsJson({
                    error: 'invalid_response_target',
                    message: matrixCheck.error,
                }, { status: 422 });
            }
        }
        // If target not found in KV (eventual consistency), allow — DO is source of truth
    }

    const entry = {
        type: 'response',
        subtype: type,
        topic: normalizedTopic,
        author: {
            type: authorType,
            topic_pseudonym: topicPseudonym,
            method: identity?.method || 'none',
            trust_level: identity?.trust_level || 'none',
            agent_operator: body.agent_operator || null,
        },
        payload,
        state: null,
        linked_to: [payload.target_id],
    };

    // Tier 2: classify (before budget — don't charge for held content)
    const classification = await classifyContent(env, entry);

    if (classification.action === 'tier_1b_reject') {
        if (ctx?.waitUntil) ctx.waitUntil(logSilentDrop(env, classification));
        return corsJson({ error: 'submission_rejected' }, { status: 403 });
    }

    if (classification.action === 'tier_1a_reject') {
        const receiptWork = async () => {
            await createRejectionReceipt(env, entry, classification);
            await queueForHumanReview(env, entry, classification);
        };
        if (ctx?.waitUntil) ctx.waitUntil(receiptWork());
        return corsJson({
            status: 'rejected',
            content_hash: classification.content_hash,
            appeal_state: 'open',
        }, { status: 422 });
    }

    if (classification.tags?.length > 0) entry.moderation_tags = classification.tags;

    // Tier 1: Budget (after moderation — only charge for accepted content)
    const cost = TOKEN_COSTS[type] || 1;
    const budgetResult = await checkBudget(env, deviceId, authorType, cost);
    if (!budgetResult.allowed) {
        return corsJson({ error: 'budget_exceeded', tokens_remaining: budgetResult.tokens_remaining, resets_at: budgetResult.resets_at }, { status: 429 });
    }

    const chainResult = await appendToChain(env, normalizedTopic, entry);

    const asyncWork = async () => {
        await replicateToKV(env, null, entry, chainResult);
        await recordSubmission(env, null, entry, chainResult.entry_id);
    };
    if (ctx?.waitUntil) { ctx.waitUntil(asyncWork()); } else { await asyncWork(); }

    return corsJson({
        status: 'accepted',
        entry_id: chainResult.entry_id,
        entry_hash: chainResult.entry_hash,
        payload_hash: chainResult.payload_hash,
        sequence: chainResult.sequence,
        moderation_tags: entry.moderation_tags || [],
        tokens_remaining: budgetResult.tokens_remaining,
    }, { status: 201 });
}

// ── Read Handlers ───────────────────────────────────────────────────

async function handleGetEntry(env, entryId) {
    const meta = await getEntryFromKV(env, entryId);
    if (!meta) return corsJson({ error: 'not_found' }, { status: 404 });

    if (meta.topic) {
        const chainDO = getChainDO(env, meta.topic);
        const resp = await chainDO.fetch(new Request('http://internal/entries?offset=0&limit=200&order=asc'));
        const data = await resp.json();
        const allEntries = data.entries || [];

        const responses = allEntries.filter(e =>
            e.type === 'response' && (e.linked_to || []).includes(entryId)
        );

        const computed = computeState(meta, responses, { challenge_decay_hours: CHALLENGE_DECAY_HOURS });

        return corsJson({
            ...meta,
            computed_state: computed.state,
            display_hint: computed.display_hint,
            responses,
        });
    }

    return corsJson(meta);
}

async function getTopicFeedWithState(env, topic) {
    const chainDO = getChainDO(env, topic);
    const resp = await chainDO.fetch(new Request('http://internal/entries?offset=0&limit=200&order=asc'));
    const data = await resp.json();
    const allEntries = data.entries || [];

    const contributions = allEntries.filter(e => e.type === 'contribution');
    const responses = allEntries.filter(e => e.type === 'response');

    for (const c of contributions) {
        const linked = responses.filter(r => (r.linked_to || []).includes(c.entry_id));
        const computed = computeState(c, linked, { challenge_decay_hours: CHALLENGE_DECAY_HOURS });
        c.computed_state = computed.state;
        c.display_hint = computed.display_hint;
        c.response_count = linked.length;
    }

    return {
        entries: allEntries,
        contributions,
        total: allEntries.length,
    };
}

async function renderTopicPage(env, topic) {
    const feedData = await getTopicFeedWithState(env, topic.trim().toLowerCase());
    return renderHTML('topic', {
        topic,
        entries: feedData.entries,
    });
}

/**
 * Get chain heads for all topics (for external anchoring / witnesses).
 */
async function getChainHeads(env) {
    const topics = await listTopics(env);
    const heads = [];

    for (const t of topics) {
        try {
            const chainDO = getChainDO(env, t.topic);
            const resp = await chainDO.fetch(new Request('http://internal/chain-head'));
            const head = await resp.json();
            heads.push({
                topic: t.topic,
                ...head,
            });
        } catch (err) {
            heads.push({ topic: t.topic, error: err.message });
        }
    }

    return {
        timestamp: new Date().toISOString(),
        chain_heads: heads,
    };
}

/**
 * Export all entries for a topic (for independent verification).
 */
async function handleExport(env, topic) {
    const chainDO = getChainDO(env, topic);
    const resp = await chainDO.fetch(new Request('http://internal/entries?offset=0&limit=200&order=asc'));
    const data = await resp.json();

    // Also get chain head
    const headResp = await chainDO.fetch(new Request('http://internal/chain-head'));
    const head = await headResp.json();

    return corsJson({
        topic,
        exported_at: new Date().toISOString(),
        chain_head: head,
        entries: data.entries || [],
        total: data.total || 0,
        note: 'This export can be independently verified by recomputing all entry hashes. Payload hashes are computed via JCS-SHA256 (RFC 8785 canonicalization).',
    });
}

async function getModerationEntries(env) {
    const kv = env.ACTA_KV;
    if (!kv) return { entries: [], tier1b_silent_drop_count: 0 };

    // Get public Tier 1B counter
    const tier1bCount = parseInt(await kv.get('moderation:tier1b_count') || '0');

    // List Tier 1A rejection receipts
    const receiptList = await kv.list({ prefix: 'receipt:' });
    const receipts = [];
    for (const key of receiptList.keys) {
        const item = await kv.get(key.name, { type: 'json' });
        if (item) receipts.push({ id: key.name, ...item });
    }

    // List Tier 3 review items
    const reviewList = await kv.list({ prefix: 'review:' });
    const reviews = [];
    for (const key of reviewList.keys) {
        if (key.name === 'review:pending_count') continue;
        const item = await kv.get(key.name, { type: 'json' });
        if (item) {
            reviews.push({
                id: key.name,
                action: item.classification?.action || 'unknown',
                category: item.classification?.category || null,
                reasoning: item.classification?.reasoning || null,
                status: item.status,
                queued_at: item.queued_at,
            });
        }
    }

    return {
        tier1b_silent_drop_count: tier1bCount,
        rejection_receipts: receipts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
        human_review_queue: reviews.sort((a, b) => new Date(b.queued_at) - new Date(a.queued_at)),
    };
}

async function renderModerationLog(env) {
    const data = await getModerationEntries(env);
    return renderHTML('moderation', data);
}

// ── Helpers ─────────────────────────────────────────────────────────

function getChainDO(env, topic) {
    const id = env.LEDGER_CHAIN.idFromName(topic);
    return env.LEDGER_CHAIN.get(id);
}

async function checkBudget(env, deviceId, authorType, cost) {
    const id = env.DEVICE_BUDGET.idFromName(deviceId);
    const stub = env.DEVICE_BUDGET.get(id);
    const resp = await stub.fetch(new Request('http://internal/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cost, author_type: authorType }),
    }));
    return resp.json();
}

async function appendToChain(env, topic, entry) {
    const chainDO = getChainDO(env, topic);
    const resp = await chainDO.fetch(new Request('http://internal/append', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    }));
    return resp.json();
}
