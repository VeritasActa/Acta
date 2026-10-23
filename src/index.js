/**
 * Acta: Worker Entry Point
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

import { validateContribution, validateResponse, validateResponseTarget, computeState, isResolutionDue, TOKEN_COSTS } from './validators/schema.js';
import { replicateToKV, getEntryFromKV, getTopicForEntry, listTopics, getFeedFromKV } from './kv-index.js';
import { classifyContent, createRejectionReceipt, logSilentDrop, queueForHumanReview } from './moderation.js';
import { resolveIdentity } from './identity.js';
import { checkDuplicate, recordSubmission } from './duplicate-detection.js';
import { handleScheduled, getAnchorPublicKey } from './chain-publication.js';
import { witnessStatus } from './witness-status.js';
import { PROTOCOL_IDENTITY, INSTANCE_POLICY, DOCUMENT_URLS } from './protocol-identity.js';
import { renderHTML } from './ui.js';
import { protocolPage, protocolLayout } from './protocol-ui.js';
import RELEASE from '../public/release-manifest.json';
import BROWSER_BUILD from '../public/browser-build.json';
import BROWSER_ENGINE from '../public/receipt-verifier.js.txt';
import VERIFIER_UI from '../public/verifier-ui.js.txt';
import RECEIPT_SAMPLE from '../public/receipt-sample.js.txt';
import CURRENT_RECEIPT from '../public/current-receipt.json';
import SAMPLE_KEY from '../public/current-receipt-key.txt';
import VERIFIER_LICENSES from '../public/verifier-licenses.txt';
import IDENTITY_CHARTER from '../docs/identity/v1.0.0/CHARTER.md';

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

// ── Privacy-Preserving Usage Counters ───────────────────────────────
// Counts API calls by category per day. No device IDs, no IPs, no user data.
// Stored in KV as stats:YYYY-MM-DD:{category} → integer count.
function classifyRequest(method, pathname) {
    if (method === 'OPTIONS') return null;
    if (pathname === '/') return 'page:home';
    if (pathname.startsWith('/topic/')) return 'page:topic';
    if (pathname === '/about' || pathname === '/docs' || pathname === '/verify' || pathname === '/ontology' || pathname === '/privacy') return 'page:other';
    if (pathname.startsWith('/blog')) return 'page:blog';
    if (pathname === '/api/contribute') return 'api:contribute';
    if (pathname === '/api/respond') return 'api:respond';
    if (pathname.startsWith('/api/feed')) return 'api:feed';
    if (pathname.startsWith('/api/topics')) return 'api:topics';
    if (pathname.startsWith('/api/verify')) return 'api:verify';
    if (pathname.startsWith('/api/export/')) return 'api:export';
    if (pathname === '/api/anchor/latest') return 'api:anchor';
    if (pathname === '/api/conformance') return 'api:conformance';
    if (pathname === '/api/chain-heads') return 'api:chain-heads';
    if (pathname.startsWith('/.well-known/')) return 'api:well-known';
    if (pathname.startsWith('/api/')) return 'api:other';
    return null;
}

async function incrementCounter(env, category) {
    if (!env.ACTA_KV || !category) return;
    const date = new Date().toISOString().slice(0, 10);
    const key = `stats:${date}:${category}`;
    try {
        const current = parseInt(await env.ACTA_KV.get(key) || '0', 10);
        await env.ACTA_KV.put(key, String(current + 1), { expirationTtl: 86400 * 90 }); // 90 day retention
    } catch { /* non-critical */ }
}

const worker = {
    async fetch(request, env, ctx) {
        // HEAD is GET without a body. The routes below match on GET, so a HEAD
        // request used to fall through to 404 and link checkers, uptime probes
        // and some crawlers reported the site down while GET returned 200.
        if (request.method === 'HEAD') {
            const res = await worker.fetch(new Request(request, { method: 'GET' }), env, ctx);
            return new Response(null, { status: res.status, statusText: res.statusText, headers: res.headers });
        }
        const url = new URL(request.url);

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: CORS_HEADERS });
        }

        // Fire-and-forget counter increment: never slows the response
        const category = classifyRequest(request.method, url.pathname);
        if (category) {
            ctx.waitUntil(incrementCounter(env, category));
        }

        try {
            if (request.method === 'GET') {
                const assets = {
                    '/assets/receipt-verifier.js': [BROWSER_ENGINE, 'text/javascript; charset=utf-8'],
                    '/assets/verifier-ui.js': [VERIFIER_UI, 'text/javascript; charset=utf-8'],
                    '/assets/receipt-sample.js': [RECEIPT_SAMPLE, 'text/javascript; charset=utf-8'],
                    '/assets/browser-build.json': [JSON.stringify(BROWSER_BUILD), 'application/json'],
                    '/assets/verifier-licenses.txt': [VERIFIER_LICENSES, 'text/plain; charset=utf-8'],
                    '/.well-known/veritasacta-release.json': [JSON.stringify(RELEASE, null, 2), 'application/json'],
                    '/samples/current-receipt.json': [JSON.stringify(CURRENT_RECEIPT, null, 2), 'application/json'],
                    '/samples/current-receipt-key.txt': [SAMPLE_KEY, 'text/plain; charset=utf-8'],
                };
                if (Object.hasOwn(assets, url.pathname)) {
                    const [body, type] = assets[url.pathname];
                    return new Response(body, { headers: { 'Content-Type': type, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' } });
                }
                const page = protocolPage(url.pathname);
                if (page) return corsHtml(page, { headers: {
                    'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; font-src data:; img-src 'self' data:; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'",
                    'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff',
                    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
                    'Cache-Control': 'no-cache',
                } });
            }

            // ── Static assets ──
            if (request.method === 'GET' && url.pathname === '/logo.svg') {
                return new Response(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><rect width="512" height="512" fill="#f4f4f0"/><text x="256" y="320" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="280" font-weight="700" fill="#1a1a2e" letter-spacing="-8">VA</text></svg>`, {
                    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000', ...CORS_HEADERS }
                });
            }

            // ── llms.txt (machine-readable index for AI coding assistants) ──
            if (request.method === 'GET' && url.pathname === '/llms.txt') {
                return new Response(`# Veritas Acta

Signed records that recipients can verify themselves.

Verifier: @veritasacta/verify@${RELEASE.verifier.version}
${RELEASE.self_check}
${RELEASE.verification_boundary}

## Start here
- Verify an individual receipt locally: https://veritasacta.com/verify
- Integrate signed receipts: https://veritasacta.com/integrate
- Receipt specification: https://veritasacta.com/specification
- Conformance evidence: https://veritasacta.com/conformance
- Maintainers and governance: https://veritasacta.com/maintainers
- Release manifest: https://veritasacta.com/.well-known/veritasacta-release.json

## Standards status (reviewed ${RELEASE.reviewed_at})
${RELEASE.standards.map(s => '- ' + s.name + '-' + s.revision + ': ' + s.status + (s.expired_at ? ', expired ' + s.expired_at : '') + '. ' + s.url).join('\n')}
${RELEASE.standards_notice}

## Separate applications
Acta public record: https://veritasacta.com/record
Application API and state machine: https://veritasacta.com/docs
Application charter: https://veritasacta.com/about
ScopeBlind: commercial applications, https://scopeblind.com

Verification does not require issuance, onboarding, a proxy or a daemon.
`, {
                    headers: {
                        'Content-Type': 'text/plain; charset=utf-8',
                        'Cache-Control': 'public, max-age=3600',
                        ...CORS_HEADERS,
                    },
                });
            }

            // ── Sitemap ──
            if (request.method === 'GET' && url.pathname === '/sitemap.xml') {
                const today = new Date().toISOString().slice(0, 10);
                const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://veritasacta.com/</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://veritasacta.com/about</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://veritasacta.com/docs</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://veritasacta.com/verify</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>https://veritasacta.com/ontology</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://veritasacta.com/privacy</loc><lastmod>${today}</lastmod><changefreq>yearly</changefreq><priority>0.5</priority></url>
  <url><loc>https://veritasacta.com/blog</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>https://veritasacta.com/.well-known/acta-instance.json</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.6</priority></url>
  <url><loc>https://veritasacta.com/specification</loc><changefreq>monthly</changefreq></url>
  <url><loc>https://veritasacta.com/integrate</loc><changefreq>monthly</changefreq></url>
  <url><loc>https://veritasacta.com/maintainers</loc><changefreq>monthly</changefreq></url>
  <url><loc>https://veritasacta.com/conformance</loc><changefreq>monthly</changefreq></url>
  <url><loc>https://veritasacta.com/record</loc><changefreq>monthly</changefreq></url>
  <url><loc>https://veritasacta.com/record/docs</loc><changefreq>monthly</changefreq></url>
  <url><loc>https://veritasacta.com/charter</loc><changefreq>monthly</changefreq></url>
  <url><loc>https://veritasacta.com/llms.txt</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>
</urlset>`;
                return new Response(sitemap, {
                    headers: {
                        'Content-Type': 'application/xml',
                        'Cache-Control': 'public, max-age=3600',
                        ...CORS_HEADERS,
                    },
                });
            }

            // ── Passive Federation Manifest ──
            if (request.method === 'GET' && url.pathname === '/.well-known/acta-instance.json') {
                const publicKey = await getAnchorPublicKey(env);
                const [latestAnchor, latestWitness] = await Promise.all([
                    env.ACTA_KV?.get('anchor:latest', { type: 'json' }).catch(() => null),
                    env.ACTA_KV?.get('witness:latest', { type: 'json' }).catch(() => null),
                ]);
                return corsJson({
                    protocol: "acta",
                    version: PROTOCOL_IDENTITY.protocol_version,
                    // Protocol identity: defines the protocol
                    charter_hash: PROTOCOL_IDENTITY.charter_hash,
                    charter_url: DOCUMENT_URLS.charter,
                    protocol_spec_hash: PROTOCOL_IDENTITY.protocol_spec_hash,
                    protocol_spec_url: DOCUMENT_URLS.protocol_spec,
                    // Instance policy: operator-tunable, separate from identity
                    policy_hash: INSTANCE_POLICY.policy_hash,
                    policy_url: DOCUMENT_URLS.policy,
                    repository: "https://github.com/VeritasActa/acta",
                    instance_url: "https://veritasacta.com",
                    endpoints: {
                        topics: "/api/topics",
                        feed: "/api/feed?topic={topic}",
                        contribute: "/api/contribute",
                        respond: "/api/respond",
                        verify: "/api/verify?topic={topic}",
                        export: "/api/export/{topic}",
                        anchor_latest: "/api/anchor/latest",
                        chain_heads: "/api/chain-heads",
                        charter: "/api/charter",
                        moderation_log: "/api/moderation-log",
                        conformance: "/api/conformance",
                    },
                    anchor: {
                        algorithm: "Ed25519",
                        public_key: publicKey || null,
                        public_key_url: "/.well-known/acta-anchor-key",
                        latest: latestAnchor ? {
                            timestamp: latestAnchor.timestamp,
                            merkle_root: latestAnchor.merkle_root,
                            topic_count: latestAnchor.topic_count,
                        } : null,
                    },
                    witness: {
                        type: "bluesky",
                        handle: "veritasacta.bsky.social",
                        profile_url: "https://bsky.app/profile/veritasacta.bsky.social",
                        ...witnessStatus(latestAnchor, latestWitness),
                        latest: latestWitness ? {
                            anchor_timestamp: latestWitness.anchor_timestamp,
                            post_uri: latestWitness.post_uri,
                            post_url: latestWitness.post_url,
                            witnessed_at: latestWitness.witnessed_at,
                        } : null,
                    },
                    identity: {
                        provider: "ScopeBlind",
                        methods: ["dpop", "pass_token"],
                        jwks_url: env.SCOPEBLIND_JWKS_URL || null,
                    },
                    mcp: {
                        server: "acta-mcp",
                        repository: "https://github.com/VeritasActa/acta-mcp",
                    },
                }, {
                    headers: { 'Cache-Control': 'public, max-age=300' },
                });
            }

            // ── Web UI: reference application ──
            if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/record')) {
                const [topics, anchor, latestWitness] = await Promise.all([
                    listTopics(env),
                    env.ACTA_KV?.get('anchor:latest', { type: 'json' }).catch(() => null),
                    env.ACTA_KV?.get('witness:latest', { type: 'json' }).catch(() => null),
                ]);
                const anchorPublicKey = await getAnchorPublicKey(env);

                // Fetch featured record and predictions across all topics
                let featuredRecord = null;
                const predictions = [];
                const topicInsights = {};
                const featureCandidates = ['protocol-trust-models', 'acta-protocol'];

                // Fetch all topic feeds (for predictions + featured record)
                const topicSlugs = topics.map(t => t.topic);
                const feedResults = await Promise.allSettled(
                    topicSlugs.map(t => getTopicFeedWithState(env, t))
                );

                for (let i = 0; i < topicSlugs.length; i++) {
                    const result = feedResults[i];
                    if (result.status !== 'fulfilled') continue;
                    const feedData = result.value;
                    const topicSlug = topicSlugs[i];

                    const contributions = feedData.contributions || [];
                    const allEntries = feedData.entries || [];
                    const responses = allEntries.filter(e => e.type === 'response');

                    const dueSoonCount = contributions.filter(c => {
                        if (c.subtype !== 'prediction') return false;
                        if ((c.computed_state || '').startsWith('resolved')) return false;
                        const resolutionDate = c.payload?.resolution_date ? new Date(c.payload.resolution_date) : null;
                        if (!resolutionDate || Number.isNaN(resolutionDate.getTime())) return false;
                        const daysUntil = Math.ceil((resolutionDate.getTime() - Date.now()) / 86400000);
                        return daysUntil >= 0 && daysUntil <= 7;
                    }).length;

                    topicInsights[topicSlug] = {
                        contested_count: contributions.filter(c => c.computed_state === 'contested').length,
                        open_count: contributions.filter(c => (c.computed_state || c.state || 'open') === 'open').length,
                        prediction_count: contributions.filter(c => c.subtype === 'prediction').length,
                        awaiting_resolution_count: contributions.filter(c => c.display_hint === 'awaiting_resolution').length,
                        due_soon_count: dueSoonCount,
                        response_count: responses.length,
                        last_activity_at: allEntries.reduce((latest, entry) => {
                            if (!entry?.timestamp) return latest;
                            return !latest || entry.timestamp > latest ? entry.timestamp : latest;
                        }, null),
                    };

                    // Collect predictions
                    for (const c of contributions) {
                        if (c.subtype === 'prediction') {
                            const linkedResponses = allEntries.filter(e =>
                                e.type === 'response' && (e.linked_to || []).includes(c.entry_id)
                            );
                            predictions.push({ ...c, topic: topicSlug, response_count: linkedResponses.length });
                        }
                    }

                    // Featured: first contested from priority topics
                    if (!featuredRecord && featureCandidates.includes(topicSlug)) {
                        const contested = feedData.contributions?.find(c => c.computed_state === 'contested');
                        if (contested) {
                            const linkedResponses = (feedData.entries || []).filter(e =>
                                e.type === 'response' && (e.linked_to || []).includes(contested.entry_id)
                            );
                            featuredRecord = {
                                contribution: contested,
                                responses: linkedResponses,
                                topic: topicSlug,
                            };
                        }
                    }
                }

                // Sort predictions: unresolved first (by resolution_date), then resolved
                predictions.sort((a, b) => {
                    const aResolved = (a.computed_state || '').startsWith('resolved');
                    const bResolved = (b.computed_state || '').startsWith('resolved');
                    if (aResolved !== bResolved) return aResolved ? 1 : -1;
                    const aDate = a.payload?.resolution_date || '';
                    const bDate = b.payload?.resolution_date || '';
                    return aDate.localeCompare(bDate);
                });

                // Find the most recent entry across all topics for the "Latest Activity" card
                let latestEntry = null;
                for (let i = 0; i < topicSlugs.length; i++) {
                    const result = feedResults[i];
                    if (result.status !== 'fulfilled') continue;
                    const feedData = result.value;
                    const allEntries = feedData.entries || [];
                    for (const entry of allEntries) {
                        if (!entry?.timestamp) continue;
                        if (!latestEntry || entry.timestamp > latestEntry.timestamp) {
                            latestEntry = { ...entry, topic: topicSlugs[i] };
                        }
                    }
                }

                return corsHtml(renderHTML('home', { topics, anchor, anchorPublicKey, featuredRecord, latestWitness, predictions, topicInsights, latestEntry }));
            }

            if (request.method === 'GET' && url.pathname.startsWith('/topic/')) {
                const topic = decodeURIComponent(url.pathname.slice(7));
                return corsHtml(await renderTopicPage(env, topic));
            }

            if (request.method === 'GET' && (url.pathname === '/about' || url.pathname === '/charter')) {
                const charterData = await fetchCharter(env);
                return corsHtml(renderHTML('about', charterData));
            }

            if (request.method === 'GET' && (url.pathname === '/docs' || url.pathname === '/record/docs')) {
                return corsHtml(renderHTML('docs'));
            }


            if (request.method === 'GET' && url.pathname === '/ontology') {
                return corsHtml(renderHTML('ontology'));
            }

            if (request.method === 'GET' && url.pathname === '/privacy') {
                return corsHtml(renderPrivacyPage());
            }

            // in-toto predicate type URI (must resolve per convention)
            if (request.method === 'GET' && url.pathname.startsWith('/attestation/decision-receipt/')) {
                const version = url.pathname.split('/').pop();
                return new Response(JSON.stringify({
                    predicateType: `https://veritasacta.com/attestation/decision-receipt/${version}`,
                    name: 'Decision Receipt',
                    description: 'Attests to access control decisions made by AI agents and physical sensor devices. Captures decision outcome, policy evidence, and hash-chain links.',
                    spec: 'https://github.com/in-toto/attestation/blob/main/spec/predicates/decision-receipt.md',
                    ietf: 'https://datatracker.ietf.org/doc/draft-farley-acta-signed-receipts/',
                    implementations: {
                        'protect-mcp': 'https://www.npmjs.com/package/protect-mcp',
                        '@veritasacta/verify': 'https://www.npmjs.com/package/@veritasacta/verify',
                    },
                    version: version,
                }, null, 2), {
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                });
            }

            if (request.method === 'GET' && url.pathname.startsWith('/blog')) {
                return corsHtml(renderHTML('blog'));
            }

            if (request.method === 'GET' && url.pathname === '/moderation-log') {
                return corsHtml(await renderModerationLog(env));
            }

            // ── API: Read ──

            if (request.method === 'GET') {
                if (url.pathname === '/api/charter') {
                    return corsJson({
                        mission: 'A contestable, checkable public record for humans and AI.',
                        charter_url: DOCUMENT_URLS.charter,
                        charter_hash: PROTOCOL_IDENTITY.charter_hash,
                        protocol_version: PROTOCOL_IDENTITY.protocol_version,
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
                    let topics = await listTopics(env);
                    const q = url.searchParams.get('q');
                    if (q) {
                        const query = q.toLowerCase();
                        topics = topics.filter(t => t.topic.toLowerCase().includes(query));
                    }
                    return corsJson(topics);
                }

                if (url.pathname === '/api/feed') {
                    const topic = url.searchParams.get('topic');

                    // Discovery mode: no topic = latest entries across all topics
                    if (!topic) {
                        const allTopics = await listTopics(env);
                        const allEntries = [];

                        for (const t of allTopics) {
                            try {
                                const feed = await getFeedFromKV(env, t.topic, { offset: 0, limit: 20 });
                                for (const entry of (feed.entries || [])) {
                                    allEntries.push({ ...entry, topic: t.topic });
                                }
                            } catch { /* skip unavailable topics */ }
                        }

                        // Sort by timestamp descending, take top 20
                        allEntries.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
                        const limited = allEntries.slice(0, 20);

                        return corsJson({
                            entries: limited,
                            total: allEntries.length,
                            returned: limited.length,
                            topics: allTopics.map(t => t.topic),
                            generated_at: new Date().toISOString(),
                        });
                    }

                    const feedData = await getTopicFeedWithState(env, topic.trim().toLowerCase());

                    // Optional type/state filtering
                    const typeFilter = url.searchParams.get('type');
                    const stateFilter = url.searchParams.get('state');
                    if (typeFilter || stateFilter) {
                        feedData.contributions = feedData.contributions.filter(c => {
                            if (typeFilter && c.subtype !== typeFilter) return false;
                            if (stateFilter && c.computed_state !== stateFilter) return false;
                            return true;
                        });
                    }

                    return corsJson(feedData);
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

                // Signed anchor: latest daily checkpoint
                if (url.pathname === '/api/anchor/latest') {
                    const raw = await env.ACTA_KV?.get('anchor:latest', { type: 'json' });
                    if (!raw) return corsJson({ error: 'no_anchors_yet' }, { status: 404 });
                    return corsJson(raw, {
                        headers: { 'Cache-Control': 'public, max-age=3600' },
                    });
                }

                // Self-reported conformance status
                if (url.pathname === '/api/conformance') {
                    return handleConformance(env);
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
                        charter: DOCUMENT_URLS.charter,
                    }, {
                        headers: { 'Cache-Control': 'public, max-age=86400' },
                    });
                }
            }

            // ── API: Write ──

            if (request.method === 'POST') {
                // Internal: witness bot reports latest post
                if (url.pathname === '/api/internal/witness-report') {
                    const secret = request.headers.get('X-Witness-Secret');
                    if (!secret || secret !== env.WITNESS_SECRET) {
                        return corsJson({ error: 'unauthorized' }, { status: 401 });
                    }
                    const body = await request.json();
                    if (!body.post_uri || !body.anchor_timestamp) {
                        return corsJson({ error: 'missing post_uri or anchor_timestamp' }, { status: 400 });
                    }
                    await env.ACTA_KV.put('witness:latest', JSON.stringify({
                        post_uri: body.post_uri,
                        post_url: body.post_url || null,
                        anchor_timestamp: body.anchor_timestamp,
                        witnessed_at: new Date().toISOString(),
                    }));
                    return corsJson({ ok: true });
                }

                if (url.pathname === '/api/contribute') {
                    return handleContribute(request, env, ctx);
                }
                if (url.pathname === '/api/respond') {
                    return handleRespond(request, env, ctx);
                }
            }

            // ── API: Usage stats (coarse, no PII) ──
            if (request.method === 'GET' && url.pathname === '/api/stats') {
                const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
                const categories = [
                    'page:home', 'page:topic', 'page:other',
                    'api:contribute', 'api:respond', 'api:feed', 'api:topics',
                    'api:verify', 'api:export', 'api:anchor', 'api:conformance',
                    'api:chain-heads', 'api:well-known', 'api:other',
                ];
                const counts = {};
                await Promise.all(categories.map(async (cat) => {
                    const val = await env.ACTA_KV.get(`stats:${date}:${cat}`);
                    if (val) counts[cat] = parseInt(val, 10);
                }));
                return corsJson({ date, counts, total: Object.values(counts).reduce((a, b) => a + b, 0) }, {
                    headers: { 'Cache-Control': 'public, max-age=60' },
                });
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

export default worker;

// ── Privacy Page ────────────────────────────────────────────────

function renderPrivacyPage() {
    return protocolLayout('Privacy', `<main id="main" class="va-wrap va-main"><h1>Privacy Policy</h1>

<h2>What Veritas Acta collects</h2>
<p>The Acta reference application is a public record. Contributions to the public ledger are visible by design. The protocol collects:</p>
<p><strong>Public data:</strong> Topic pseudonyms, contribution content, timestamps, evidence links, and cryptographic signatures. These are intentionally public and permanent: that is the purpose of a public record.</p>
<p><strong>Private data:</strong> Device identifiers (hashed) are used solely for budget enforcement (preventing spam). Device IDs are never published, never shared, and never correlated across topics. They exist only in the budget enforcement layer and are not stored in the public ledger.</p>

<h2>What Veritas Acta does not collect</h2>
<p>No accounts. No email addresses. No passwords. No personal names (unless voluntarily included in contribution content). No tracking cookies. No analytics scripts. No advertising identifiers.</p>

<h2>Verification tools</h2>
<p>The browser verifier checks pasted or selected receipts locally. Receipt contents and supplied keys are not uploaded; the page enforces <code>connect-src 'none'</code> and has no form submission. Loading the page and scripts contacts this host. The CLI checks local files with locally supplied keys offline after installation. Installation, URL inputs and explicitly requested JWKS lookups use the network; signing/proxy services have their own data flows.</p>

<h2>acta.today Knowledge Units</h2>
<p>The acta.today wiki produces Knowledge Units through multi-model AI deliberation. The models are called via OpenRouter. Questions submitted for deliberation may be stored in a production queue. No personal data is associated with queued questions. Published Knowledge Units are public.</p>

<h2>Third-party services</h2>
<p>Veritas Acta is hosted on Cloudflare Workers. Cloudflare's privacy policy applies to infrastructure-level data (IP addresses, request metadata). The application also keeps coarse daily request counts by route category for up to 90 days. Those counters do not contain receipt contents, keys, IP addresses or device identifiers. No analytics script runs in the verifier.</p>

<h2>Data retention</h2>
<p>Public ledger entries are permanent by design: that is the core promise of the protocol. Device budget data is ephemeral and may be cleared at any time. There is no mechanism to delete public ledger entries because immutability is a feature, not a limitation.</p>

<h2>Contact</h2>
<p>For privacy questions: <a href="mailto:hello@acta.today">hello@acta.today</a></p>

<p class="va-note">Verification and counter disclosures updated 13 October 2026. Public-record policy retained.</p></main>`);
}

// ── Charter edition ──────────────────────────────────────────────────
// Serve the exact archived edition committed by the manifest and anchors.
// Build checks verify its bytes. A mutable GitHub branch or old KV cache must
// never silently replace the document associated with this protocol identity.
async function fetchCharter() {
    return { charter: IDENTITY_CHARTER, charter_fetched_from: 'identity' };
}

// ── Source Snapshotting ──────────────────────────────────────────────

/**
 * Snapshot a source URL for evidence durability.
 * Fetches the URL, computes SHA-256 of the response body, records timestamp.
 * Best-effort: if fetch fails, returns null (contribution still accepted).
 *
 * Security: only HTTPS URLs, no private IPs, 5s timeout, 1MB limit.
 */
async function snapshotSource(sourceUrl) {
    if (!sourceUrl || typeof sourceUrl !== 'string') return null;

    try {
        const url = new URL(sourceUrl);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

        // Block private/internal IPs
        const hostname = url.hostname.toLowerCase();
        if (hostname === 'localhost' || hostname === '127.0.0.1' ||
            hostname.startsWith('10.') || hostname.startsWith('192.168.') ||
            hostname.startsWith('172.') || hostname === '0.0.0.0' ||
            hostname.endsWith('.local') || hostname.endsWith('.internal')) {
            return null;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const resp = await fetch(sourceUrl, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Acta/1.0 (source-snapshot)' },
            redirect: 'follow',
        });
        clearTimeout(timeout);

        if (!resp.ok) return null;

        // Limit to 1MB
        const contentLength = parseInt(resp.headers.get('content-length') || '0');
        if (contentLength > 1048576) return null;

        const body = await resp.text();
        if (body.length > 1048576) return null;

        // Compute SHA-256
        const hash = await crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(body)
        );
        const contentHash = [...new Uint8Array(hash)]
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        return {
            content_hash: contentHash,
            retrieved_at: new Date().toISOString(),
        };
    } catch {
        return null;
    }
}

/**
 * Enrich a payload's source field with snapshot data.
 * Modifies payload in-place if source is a URL string.
 */
async function enrichSourceSnapshot(payload) {
    if (!payload?.source) return;

    const sourceUrl = typeof payload.source === 'string'
        ? payload.source
        : payload.source?.source_url;

    if (!sourceUrl) return;

    const snapshot = await snapshotSource(sourceUrl);
    if (!snapshot) return;

    if (typeof payload.source === 'string') {
        payload.source = {
            source_url: payload.source,
            content_hash: snapshot.content_hash,
            retrieved_at: snapshot.retrieved_at,
            excerpt: null,
            excerpt_hash: null,
            archive_url: null,
        };
    } else {
        payload.source.content_hash = payload.source.content_hash || snapshot.content_hash;
        payload.source.retrieved_at = payload.source.retrieved_at || snapshot.retrieved_at;
    }
}

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

    // Build entry with per-topic pseudonym (public): device_id never exposed
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

    // Tier 2: Content classification (before budget: don't charge for held content)
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

    // Source snapshotting (best-effort, non-blocking on failure)
    if (payload?.source) {
        await enrichSourceSnapshot(payload);
    }

    // Tier 1: Budget check (after moderation: only charge for accepted content)
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
        try {
            await replicateToKV(env, null, entry, chainResult);
            await recordSubmission(env, null, entry, chainResult.entry_id);
        } catch (err) {
            console.error('[KV_REPLICATION] Failed for entry', chainResult.entry_id, ':', err.message);
            // Non-fatal: Durable Object is source of truth. KV will be stale until next write succeeds.
        }
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

    // Tier 1: Response target matrix: check if this response type can target the given entry
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
        // If target not found in KV (eventual consistency), allow: DO is source of truth
    }

    // Updates and resolutions are checked against the target as the ledger holds
    // it: the KV index can lag, and it has neither the author nor the payload.
    if (type === 'update' || type === 'resolution') {
        const chainDO = getChainDO(env, normalizedTopic);
        const target = await getChainEntry(chainDO, payload.target_id);
        const matrixCheck = target
            ? validateResponseTarget(type, target)
            : { valid: false, error: 'Target not found in this topic.' };
        if (!matrixCheck.valid) {
            return corsJson({ error: 'invalid_response_target', message: matrixCheck.error }, { status: 422 });
        }

        // Only an entry's author may update it. An update that answers a
        // challenge speaks for the entry the challenge disputes. The one
        // exception is the protocol's: any participant may propose an
        // alternative resolution source for a prediction (spec 3.4, step 5).
        const proposesSource = payload.update_type === 'alternative_source' &&
            target.type === 'contribution' && target.subtype === 'prediction';
        if (type === 'update' && !proposesSource) {
            const owner = target.type === 'response' ? await getChainEntry(chainDO, target.linked_to?.[0]) : target;
            if (owner?.author?.topic_pseudonym !== topicPseudonym) {
                return corsJson({
                    error: 'not_author',
                    message: 'Only the author of the entry being updated can post an update.',
                }, { status: 403 });
            }
        }

        if (type === 'resolution' && target.subtype === 'prediction' && !isResolutionDue(target)) {
            return corsJson({
                error: 'resolution_not_due',
                message: `This prediction cannot be resolved before its resolution_date (${target.payload?.resolution_date ?? 'not set'}).`,
            }, { status: 422 });
        }
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

    // Tier 2: classify (before budget: don't charge for held content)
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

    // Source snapshotting for responses (best-effort)
    if (payload?.source) {
        await enrichSourceSnapshot(payload);
    }

    // Tier 1: Budget (after moderation: only charge for accepted content)
    const cost = TOKEN_COSTS[type] || 1;
    const budgetResult = await checkBudget(env, deviceId, authorType, cost);
    if (!budgetResult.allowed) {
        return corsJson({ error: 'budget_exceeded', tokens_remaining: budgetResult.tokens_remaining, resets_at: budgetResult.resets_at }, { status: 429 });
    }

    const chainResult = await appendToChain(env, normalizedTopic, entry);

    const asyncWork = async () => {
        try {
            await replicateToKV(env, null, entry, chainResult);
            await recordSubmission(env, null, entry, chainResult.entry_id);
        } catch (err) {
            console.error('[KV_REPLICATION] Failed for entry', chainResult.entry_id, ':', err.message);
            // Non-fatal: Durable Object is source of truth. KV will be stale until next write succeeds.
        }
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
        const allEntries = await getAllEntries(chainDO);

        const responses = allEntries.filter(e =>
            e.type === 'response' && (e.linked_to || []).includes(entryId)
        );

        // State needs the full entry (a prediction's resolution_date is in its
        // payload, which the KV index does not carry) and the replies.
        const entry = allEntries.find(e => e.entry_id === entryId) || meta;
        const computed = computeState(entry, withReplies(allEntries, responses), { challenge_decay_hours: CHALLENGE_DECAY_HOURS });

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
    const allEntries = await getAllEntries(chainDO);

    const contributions = allEntries.filter(e => e.type === 'contribution');
    const responses = allEntries.filter(e => e.type === 'response');

    for (const c of contributions) {
        const linked = responses.filter(r => (r.linked_to || []).includes(c.entry_id));
        const computed = computeState(c, withReplies(responses, linked), { challenge_decay_hours: CHALLENGE_DECAY_HOURS });
        c.computed_state = computed.state;
        c.display_hint = computed.display_hint;
        c.response_count = linked.length;
    }

    // Compute track records: per-pseudonym prediction accuracy
    const trackRecords = {};
    for (const c of contributions) {
        if (c.subtype !== 'prediction') continue;
        const pseudonym = c.author?.topic_pseudonym;
        if (!pseudonym) continue;
        if (!trackRecords[pseudonym]) {
            trackRecords[pseudonym] = { predictions: 0, resolved: 0, correct: 0, incorrect: 0, author: c.author };
        }
        trackRecords[pseudonym].predictions++;
        const state = c.computed_state || '';
        if (state.startsWith('resolved_')) {
            trackRecords[pseudonym].resolved++;
            if (state === 'resolved_confirmed') trackRecords[pseudonym].correct++;
            if (state === 'resolved_refuted') trackRecords[pseudonym].incorrect++;
        }
    }

    return {
        entries: allEntries,
        contributions,
        total: allEntries.length,
        trackRecords,
    };
}

async function renderTopicPage(env, topic) {
    const feedData = await getTopicFeedWithState(env, topic.trim().toLowerCase());
    return renderHTML('topic', {
        topic,
        entries: feedData.entries,
        trackRecords: feedData.trackRecords,
    });
}

/**
 * Get chain heads for all topics (for external anchoring / witnesses).
 * Returns the latest entry hash for each topic: federation peers use this
 * to verify chain integrity.
 */
async function getChainHeads(env) {
    const topics = await listTopics(env);
    const topicHeads = [];

    for (const t of topics) {
        try {
            const chainDO = getChainDO(env, t.topic);
            const resp = await chainDO.fetch(new Request('http://internal/chain-head'));
            const head = await resp.json();
            topicHeads.push({
                topic: t.topic,
                chain_head: head.chain_head_hash,
                entry_count: t.entry_count || head.chain_length || 0,
                last_updated: t.last_entry_at || head.last_entry_at || null,
            });
        } catch (err) {
            topicHeads.push({ topic: t.topic, error: err.message });
        }
    }

    return {
        topics: topicHeads,
        generated_at: new Date().toISOString(),
    };
}

/**
 * Export all entries for a topic (for independent verification).
 */
async function handleExport(env, topic) {
    const chainDO = getChainDO(env, topic);

    // Read the chain head first, then only the entries it covers: the chain
    // is append-only, so an entry appended mid-export cannot make the export
    // disagree with its own head.
    const headResp = await chainDO.fetch(new Request('http://internal/chain-head'));
    const head = await headResp.json();
    const entries = (await getAllEntries(chainDO)).slice(0, head.chain_length);

    return corsJson({
        topic,
        exported_at: new Date().toISOString(),
        chain_head: head,
        entries,
        total: entries.length,
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

// ── Self-Reported Conformance ────────────────────────────────────────
// Reports what the instance knows about itself. NOT the same as the external
// CLI verifier (tools/verify.js), which checks anchors and exported hash chains.
// Cached for 5 minutes.

async function handleConformance(env) {
    // Check cache
    const cached = await env.ACTA_KV?.get('conformance:report:v2', { type: 'json' }).catch(() => null);
    if (cached) {
        return corsJson(cached, { headers: { 'Cache-Control': 'public, max-age=300' } });
    }

    const report = {
        type: 'self-reported',
        generated_at: new Date().toISOString(),
        disclaimer: 'Operator-reported self-assessment. Use tools/verify.js to check anchor signatures against an independently obtained issuer key or verify exported hash chains. This endpoint does not independently verify external witness posts.',
    };

    // 1. Protocol identity
    report.protocol_identity = {
        charter_hash: PROTOCOL_IDENTITY.charter_hash,
        protocol_spec_hash: PROTOCOL_IDENTITY.protocol_spec_hash,
        protocol_version: PROTOCOL_IDENTITY.protocol_version,
    };
    report.instance_policy = {
        policy_hash: INSTANCE_POLICY.policy_hash,
    };

    // 2. Anchor status
    const latestAnchor = await env.ACTA_KV?.get('anchor:latest', { type: 'json' }).catch(() => null);
    if (latestAnchor) {
        const anchorAge = Date.now() - new Date(latestAnchor.timestamp).getTime();
        report.anchor = {
            status: 'active',
            timestamp: latestAnchor.timestamp,
            age_hours: Math.round(anchorAge / (1000 * 60 * 60) * 10) / 10,
            algorithm: 'Ed25519',
            signed: !!latestAnchor.signature,
            topic_count: latestAnchor.topic_count,
            merkle_root: latestAnchor.merkle_root,
            identity_bound: !!latestAnchor.charter_hash,
        };
    } else {
        report.anchor = { status: 'pending', note: 'No anchor signed yet.' };
    }

    // 3. Witness status
    const latestWitness = await env.ACTA_KV?.get('witness:latest', { type: 'json' }).catch(() => null);
    report.witness = {
        ...witnessStatus(latestAnchor, latestWitness),
        latest_timestamp: latestWitness?.witnessed_at || null,
        anchor_timestamp: latestWitness?.anchor_timestamp || null,
        post_uri: latestWitness?.post_uri || null,
        post_url: latestWitness?.post_url || null,
    };

    // 4. Chain integrity (verify all topics)
    const topics = await listTopics(env);
    report.chains = {
        total_topics: topics.length,
        total_entries: topics.reduce((sum, t) => sum + (t.entry_count || 0), 0),
        topics: [],
    };

    for (const t of topics) {
        try {
            const chainDO = getChainDO(env, t.topic);
            const verifyResp = await chainDO.fetch(new Request('http://internal/verify'));
            const verifyResult = await verifyResp.json();
            report.chains.topics.push({
                topic: t.topic,
                entry_count: t.entry_count,
                chain_valid: verifyResult.valid,
            });
        } catch (err) {
            report.chains.topics.push({
                topic: t.topic,
                entry_count: t.entry_count,
                chain_valid: null,
                error: err.message,
            });
        }
    }
    report.chains.all_valid = report.chains.topics.every(t => t.chain_valid === true);

    // Cache for 5 minutes
    await env.ACTA_KV?.put('conformance:report:v2', JSON.stringify(report), { expirationTtl: 300 }).catch(() => {});

    return corsJson(report, { headers: { 'Cache-Control': 'public, max-age=300' } });
}

// ── Helpers ─────────────────────────────────────────────────────────

function getChainDO(env, topic) {
    const id = env.LEDGER_CHAIN.idFromName(topic);
    return env.LEDGER_CHAIN.get(id);
}

// The ledger serves at most 200 entries per request. Read every page, so a
// topic longer than one page is not cut short.
async function getAllEntries(chainDO) {
    const entries = [];
    let offset = 0;
    while (true) {
        const resp = await chainDO.fetch(new Request(`http://internal/entries?offset=${offset}&limit=200&order=asc`));
        const data = await resp.json();
        entries.push(...(data.entries || []));
        if (!data.has_more) return entries;
        offset += data.limit;
    }
}

async function getChainEntry(chainDO, entryId) {
    if (!entryId) return null;
    const resp = await chainDO.fetch(new Request(`http://internal/entry?id=${encodeURIComponent(entryId)}`));
    return resp.ok ? resp.json() : null;
}

// A reply to a response (evidence answering a challenge, a challenge of a
// resolution) is linked to that response, not to the contribution, but the
// contribution's state depends on it. Add those replies to its responses.
function withReplies(allEntries, responses) {
    const ids = new Set(responses.map(r => r.entry_id));
    const replies = allEntries.filter(e =>
        e.type === 'response' && !ids.has(e.entry_id) && (e.linked_to || []).some(id => ids.has(id))
    );
    return responses.concat(replies);
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
