/**
 * Tier 2 Moderation: LLM-assisted content classification.
 *
 * Rules (from Protocol Spec):
 *   ✓ LLMs may classify, tag, and flag
 *   ✗ LLMs may NOT make irreversible epistemic decisions alone
 *   ✗ LLMs may NOT declare claims true/false
 *   ✗ LLMs may NOT override state transitions
 *
 * Hard-reject bifurcation (from adversarial analysis):
 *   Tier 1A (doxxing, impersonation): Public rejection receipt with content hash.
 *       Challengeable. Receipt contains: content_hash, category, timestamp, appeal_state.
 *       No content stored, just the hash.
 *   Tier 1B (CSAM, malware, credible violence): Silent drop. Internal-only log.
 *       No public receipt, no hash, no appeal. Legally necessary carve-out.
 *       Public counter incremented so the count of silent drops is visible.
 */

import { jcsSerialize } from './durable-objects/ledger-chain.js';

// ── Hard-Reject Categories (Bifurcated) ────────────────────────────

// Tier 1B: Silent drop: no public receipt (legally mandated)
const TIER_1B_SILENT = ['csam', 'malware', 'credible_violent_threat'];

// Tier 1A: Public receipt: challengeable
const TIER_1A_RECEIPT = ['doxxing', 'impersonation'];

const ALL_HARD_REJECT = [...TIER_1B_SILENT, ...TIER_1A_RECEIPT];

// ── Classification Tags ─────────────────────────────────────────────

const CONTENT_TAGS = [
    'likely_opinion',
    'unsubstantiated',
    'potentially_misleading',
    'review_pending',
];

// ── Main Classification Function ────────────────────────────────────

/**
 * Classify content using Workers AI.
 *
 * Returns:
 *   { action: 'accept', tags: [...] }                   : enters ledger with tags
 *   { action: 'tier_1a_reject', category, content_hash }: public receipt, challengeable
 *   { action: 'tier_1b_reject', category }              : silent drop, no receipt
 *   { action: 'accept', tags: [] }                      : clean, no tags
 */
export async function classifyContent(env, entry) {
    if (!env.AI) {
        return { action: 'accept', tags: [], skipped: true, reason: 'ai_not_configured' };
    }

    const content = entry.payload?.body || '';
    if (!content || content.length < 5) {
        return { action: 'accept', tags: [] };
    }

    try {
        const result = await runClassification(env, content, entry);
        return result;
    } catch (err) {
        // LLM failure → accept without tags (fail open for epistemic content)
        console.error('[TIER2] Classification failed:', err.message);
        return {
            action: 'accept',
            tags: ['classification_failed'],
            error: err.message,
        };
    }
}

/**
 * Run the actual LLM classification.
 */
async function runClassification(env, content, entry) {
    const systemPrompt = `You are a content classifier for a public record system called Acta.

Your job is to classify content into categories. You DO NOT judge whether content is true or false.
You DO NOT make editorial decisions. You only classify structure and safety.

For each piece of content, respond with a JSON object:
{
  "safety": "safe" | "flag_for_review",
  "safety_category": null | "csam" | "malware" | "doxxing" | "impersonation" | "credible_violent_threat",
  "safety_reasoning": "brief explanation if flagged",
  "content_tags": [],
  "tag_reasoning": "brief explanation for each tag"
}

Content tag rules:
- Add "likely_opinion" if the content expresses a subjective view but the contribution type is "claim" with category "factual"
- Add "unsubstantiated" only if the contribution type is "claim", category is "factual", and no source or reasoning is provided
- Add "potentially_misleading" only if the content contains well-known false claims
  Do NOT tag things as misleading just because you disagree
- Add "review_pending" if you are uncertain about any of the above classifications

CRITICAL RULES:
- "credible_violent_threat" means SPECIFIC, OPERATIONAL threats: "I will [act] at [target] at [time]"
  Discussion of violence, historical accounts, policy debate about conflict = NOT a threat
- Never classify based on political viewpoint
- When uncertain, classify as safe with "review_pending" tag
- You must respond with valid JSON only, no other text`;

    const userPrompt = `Classify this ${entry.type} (subtype: ${entry.subtype}${entry.payload?.category ? `, category: ${entry.payload.category}` : ''}):

"""
${content.slice(0, 2000)}
"""`;

    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        max_tokens: 300,
        temperature: 0.1,
    });

    const parsed = parseClassificationResponse(response.response || '');

    if (!parsed) {
        return { action: 'accept', tags: ['classification_parse_failed'] };
    }

    // Check for hard-reject categories
    if (parsed.safety === 'flag_for_review' && ALL_HARD_REJECT.includes(parsed.safety_category)) {
        // Bifurcate: Tier 1B (silent) vs Tier 1A (receipt)
        if (TIER_1B_SILENT.includes(parsed.safety_category)) {
            return {
                action: 'tier_1b_reject',
                category: parsed.safety_category,
                reasoning: parsed.safety_reasoning,
                // No content hash, no public receipt. Internal log only.
            };
        }

        // Tier 1A: public rejection receipt with content hash
        const contentHash = await computeSha256(jcsSerialize(entry.payload || {}));
        return {
            action: 'tier_1a_reject',
            category: parsed.safety_category,
            reasoning: parsed.safety_reasoning,
            content_hash: contentHash,
        };
    }

    // Otherwise, accept with any content tags
    const tags = (parsed.content_tags || []).filter(t => CONTENT_TAGS.includes(t));

    return {
        action: 'accept',
        tags,
        tag_reasoning: parsed.tag_reasoning || null,
    };
}

/**
 * Parse LLM JSON response, handling common formatting issues.
 */
function parseClassificationResponse(text) {
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
            try { return JSON.parse(jsonMatch[1]); } catch { /* fall through */ }
        }

        const objMatch = text.match(/\{[\s\S]*\}/);
        if (objMatch) {
            try { return JSON.parse(objMatch[0]); } catch { /* fall through */ }
        }
    }

    return null;
}

// ── Tier 1A: Public Rejection Receipts ──────────────────────────────

/**
 * Create a public, challengeable rejection receipt in KV.
 * Contains: content_hash, category, timestamp, appeal_state.
 * Does NOT contain the content itself.
 */
export async function createRejectionReceipt(env, entry, classification) {
    const kv = env.ACTA_KV;
    if (!kv) return;

    const receipt = {
        type: 'rejection_receipt',
        content_hash: classification.content_hash,
        category: classification.category,
        reasoning: classification.reasoning,
        timestamp: new Date().toISOString(),
        appeal_state: 'open', // Challengeable
        topic: entry.topic,
        entry_type: entry.type,
        entry_subtype: entry.subtype,
    };

    const receiptId = `receipt:${crypto.randomUUID()}`;
    await kv.put(receiptId, JSON.stringify(receipt), { expirationTtl: 86400 * 365 });

    return receiptId;
}

// ── Tier 1B: Silent Drop (Internal Log Only) ────────────────────────

/**
 * Log a Tier 1B silent drop internally and increment public counter.
 * The public sees HOW MANY were dropped but not WHAT was dropped.
 */
export async function logSilentDrop(env, classification) {
    const kv = env.ACTA_KV;
    if (!kv) return;

    // Internal log (not public, for NCMEC/LE reporting)
    const logKey = `internal:tier1b:${crypto.randomUUID()}`;
    await kv.put(logKey, JSON.stringify({
        category: classification.category,
        reasoning: classification.reasoning,
        timestamp: new Date().toISOString(),
    }), { expirationTtl: 86400 * 90 }); // 90 day retention

    // Public counter: visible at /api/moderation-log
    const count = parseInt(await kv.get('moderation:tier1b_count') || '0');
    await kv.put('moderation:tier1b_count', String(count + 1));
}

// ── Tier 3: Human Review Queue ──────────────────────────────────────

/**
 * Queue items for human review in KV.
 * Used for Tier 1A items that need human decision.
 */
export async function queueForHumanReview(env, entry, classification) {
    const kv = env.ACTA_KV;
    if (!kv) return;

    const reviewItem = {
        entry,
        classification,
        queued_at: new Date().toISOString(),
        status: 'pending',
        reviewer: null,
        decision: null,
    };

    const queueKey = `review:${crypto.randomUUID()}`;
    await kv.put(queueKey, JSON.stringify(reviewItem), { expirationTtl: 86400 * 30 });

    const pendingCount = parseInt(await kv.get('review:pending_count') || '0');
    await kv.put('review:pending_count', String(pendingCount + 1));
}

// ── Helpers ─────────────────────────────────────────────────────────

async function computeSha256(str) {
    const buffer = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(str)
    );
    return [...new Uint8Array(buffer)]
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}
