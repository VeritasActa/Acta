/**
 * Schema validators for Acta typed contributions and responses.
 *
 * These are pure functions — deterministic, no LLM, no external calls.
 * They implement Tier 1 enforcement from the Protocol Spec.
 */

// ── Contribution Types ──────────────────────────────────────────────

const CONTRIBUTION_TYPES = ['question', 'claim', 'prediction'];
const RESPONSE_TYPES = ['evidence', 'challenge', 'update', 'resolution'];
const CLAIM_CATEGORIES = ['factual', 'opinion', 'hypothesis'];
const CHALLENGE_BASES = ['counter_evidence', 'logical_error', 'source_unreliable', 'missing_context'];
const EVIDENCE_STANCES = ['supporting', 'refuting', 'contextual'];
const UPDATE_TYPES = ['correction', 'additional_context', 'scope_change', 'alternative_source'];
const RESOLUTION_TYPES = ['answered', 'confirmed', 'refuted', 'partially_confirmed', 'unresolvable'];

// ── Token costs per action ──────────────────────────────────────────
// Challenge cost is 1 (same as other responses).
// The schema friction on challenges (target_assertion, basis, argument ≥ 20 chars)
// is doing the real DDoS filtering, not economic cost.

export const TOKEN_COSTS = {
    question: 2,
    claim: 2,
    prediction: 2,
    evidence: 1,
    challenge: 1,
    update: 1,
    resolution: 1,
};

// ── Response Target Matrix ──────────────────────────────────────────
// Explicit rules for what response types can target which contribution types.
// - evidence: can target any contribution
// - challenge: can target any contribution OR a resolution response
// - update: can target any contribution (same-author enforcement is at the API layer)
// - resolution: can target question or prediction ONLY (claims never resolve)

export const RESPONSE_TARGET_MATRIX = {
    evidence: { contribution: ['question', 'claim', 'prediction'], response: [] },
    challenge: { contribution: ['question', 'claim', 'prediction'], response: ['resolution'] },
    update: { contribution: ['question', 'claim', 'prediction'], response: [] },
    resolution: { contribution: ['question', 'prediction'], response: [] },
    // NOTE: 'claim' is deliberately excluded from resolution targets.
    // The protocol shows argument structure; it never declares a claim true or false.
};

/**
 * Validate that a response type can target the given entry.
 * Called in the Worker after loading the target entry from the ledger.
 *
 * @param {string} responseType - evidence | challenge | update | resolution
 * @param {object} targetEntry - the entry being responded to
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateResponseTarget(responseType, targetEntry) {
    const matrix = RESPONSE_TARGET_MATRIX[responseType];
    if (!matrix) return { valid: false, error: `Unknown response type: ${responseType}` };

    if (targetEntry.type === 'contribution') {
        if (!matrix.contribution.includes(targetEntry.subtype)) {
            return {
                valid: false,
                error: `${responseType} cannot target a ${targetEntry.subtype}. ` +
                    (responseType === 'resolution'
                        ? 'Claims never resolve — the protocol shows argument structure, not verdicts.'
                        : `Allowed targets: ${matrix.contribution.join(', ')}`),
            };
        }
        return { valid: true };
    }

    if (targetEntry.type === 'response') {
        if (!matrix.response.includes(targetEntry.subtype)) {
            return {
                valid: false,
                error: `${responseType} cannot target a ${targetEntry.subtype} response. ` +
                    `Allowed response targets: ${matrix.response.length ? matrix.response.join(', ') : 'none'}`,
            };
        }
        return { valid: true };
    }

    return { valid: false, error: `Unknown target type: ${targetEntry.type}` };
}

// ── Contribution Validators ─────────────────────────────────────────

export function validateContribution(type, payload) {
    const errors = [];

    if (!CONTRIBUTION_TYPES.includes(type)) {
        return { valid: false, errors: [{ field: 'type', error: `Must be one of: ${CONTRIBUTION_TYPES.join(', ')}` }] };
    }

    // ASCII-only keys enforcement (JCS canonicalization safety)
    // Our JCS uses lexicographic Object.keys().sort(), which is correct for ASCII
    // but diverges from RFC 8785 for Unicode. Rejecting non-ASCII keys at ingest
    // makes our canonicalization globally deterministic across all languages.
    const keyErrors = validateAsciiKeys(payload, 'payload');
    if (keyErrors.length > 0) {
        return { valid: false, errors: keyErrors };
    }

    // Common: body is always required
    if (!payload.body || typeof payload.body !== 'string' || payload.body.trim().length < 1) {
        errors.push({ field: 'body', error: 'Required, must be a non-empty string' });
    }

    if (payload.body && payload.body.length > 10000) {
        errors.push({ field: 'body', error: 'Maximum 10,000 characters' });
    }

    switch (type) {
        case 'claim':
            errors.push(...validateClaim(payload));
            break;
        case 'prediction':
            errors.push(...validatePrediction(payload));
            break;
        case 'question':
            // No additional burden — questions are free
            break;
    }

    // Optional provenance metadata (AI authorship disclosure)
    if (payload.provenance) {
        const provResult = validateProvenance(payload.provenance);
        if (!provResult.valid) errors.push(...provResult.errors);
    }

    return errors.length ? { valid: false, errors } : { valid: true };
}

function validateClaim(payload) {
    const errors = [];

    if (!CLAIM_CATEGORIES.includes(payload.category)) {
        errors.push({
            field: 'category',
            error: `Required. Must be one of: ${CLAIM_CATEGORIES.join(', ')}`,
        });
    }

    // Factual claims have an evidence burden
    if (payload.category === 'factual') {
        if (!payload.source && !payload.reasoning) {
            errors.push({
                field: 'source',
                error: 'Factual claims require a source (URL/DOI/reference) or reasoning. Add one, or change category to opinion or hypothesis.',
            });
        }
    }

    // Opinion/hypothesis require explicit uncertainty
    if ((payload.category === 'opinion' || payload.category === 'hypothesis') && !payload.uncertainty) {
        errors.push({
            field: 'uncertainty',
            error: `${payload.category} contributions require an explicit uncertainty statement (confidence level, limitations, what would change your mind).`,
        });
    }

    return errors;
}

function validatePrediction(payload) {
    const errors = [];

    if (!payload.resolution_criteria || typeof payload.resolution_criteria !== 'string') {
        errors.push({ field: 'resolution_criteria', error: 'Required. Must describe how to determine if the prediction is confirmed or refuted.' });
    }

    if (!payload.resolution_date) {
        errors.push({ field: 'resolution_date', error: 'Required. ISO-8601 date.' });
    } else {
        const parsed = Date.parse(payload.resolution_date);
        if (isNaN(parsed)) {
            errors.push({ field: 'resolution_date', error: 'Must be a valid ISO-8601 date.' });
        } else if (parsed <= Date.now()) {
            errors.push({ field: 'resolution_date', error: 'Must be in the future.' });
        }
    }

    if (!payload.resolution_source || typeof payload.resolution_source !== 'string') {
        errors.push({ field: 'resolution_source', error: 'Required. URL or reference to the authoritative source for resolution.' });
    }

    // Oracle specs (from adversarial analysis)
    if (!payload.resolution_rule || typeof payload.resolution_rule !== 'string') {
        errors.push({ field: 'resolution_rule', error: 'Required. Who or what triggers resolution (e.g., "Any contributor with source evidence", "Automated check against resolution_source").' });
    }

    // Optional oracle fields
    if (payload.resolution_source_fallback && typeof payload.resolution_source_fallback !== 'string') {
        errors.push({ field: 'resolution_source_fallback', error: 'Must be a string (URL or reference) if provided.' });
    }

    if (payload.challenge_window_hours !== undefined) {
        if (typeof payload.challenge_window_hours !== 'number' || payload.challenge_window_hours < 1) {
            errors.push({ field: 'challenge_window_hours', error: 'Must be a positive number (hours) if provided.' });
        }
    }

    return errors;
}

// ── Response Validators ─────────────────────────────────────────────

export function validateResponse(type, payload) {
    const errors = [];

    if (!RESPONSE_TYPES.includes(type)) {
        return { valid: false, errors: [{ field: 'type', error: `Must be one of: ${RESPONSE_TYPES.join(', ')}` }] };
    }

    // ASCII-only keys enforcement (JCS canonicalization safety)
    const keyErrors = validateAsciiKeys(payload, 'payload');
    if (keyErrors.length > 0) {
        return { valid: false, errors: keyErrors };
    }

    // Common: target_id is always required for responses
    if (!payload.target_id || typeof payload.target_id !== 'string') {
        errors.push({ field: 'target_id', error: 'Required. Must reference the contribution this responds to.' });
    }

    // Common: body
    if (!payload.body || typeof payload.body !== 'string' || payload.body.trim().length < 1) {
        errors.push({ field: 'body', error: 'Required, must be a non-empty string' });
    }

    if (payload.body && payload.body.length > 10000) {
        errors.push({ field: 'body', error: 'Maximum 10,000 characters' });
    }

    switch (type) {
        case 'evidence':
            errors.push(...validateEvidence(payload));
            break;
        case 'challenge':
            errors.push(...validateChallenge(payload));
            break;
        case 'update':
            errors.push(...validateUpdate(payload));
            break;
        case 'resolution':
            errors.push(...validateResolution(payload));
            break;
    }

    // Optional provenance metadata (AI authorship disclosure)
    if (payload.provenance) {
        const provResult = validateProvenance(payload.provenance);
        if (!provResult.valid) errors.push(...provResult.errors);
    }

    return errors.length ? { valid: false, errors } : { valid: true };
}

// ── Source Evidence Envelope ─────────────────────────────────────────
// Accepts either a full envelope object or a plain URL string (backwards compat).

/**
 * Validate and normalize a source field into a source evidence envelope.
 * @param {string|object} source - Either a URL string or a full envelope
 * @returns {{ valid: boolean, envelope?: object, errors?: Array }}
 */
export function validateSourceEnvelope(source) {
    if (!source) {
        return { valid: false, errors: [{ field: 'source', error: 'Required. Verifiable reference (URL, DOI, public record).' }] };
    }

    // Plain string (backwards compatible) — treat as source_url only
    if (typeof source === 'string') {
        return {
            valid: true,
            envelope: {
                source_url: source,
                retrieved_at: null,
                content_hash: null,
                excerpt: null,
                excerpt_hash: null,
                archive_url: null,
            },
        };
    }

    // Full envelope object
    if (typeof source === 'object') {
        const errors = [];

        if (!source.source_url || typeof source.source_url !== 'string') {
            errors.push({ field: 'source.source_url', error: 'Required. URL or DOI.' });
        }

        if (source.retrieved_at) {
            const parsed = Date.parse(source.retrieved_at);
            if (isNaN(parsed)) {
                errors.push({ field: 'source.retrieved_at', error: 'Must be a valid ISO-8601 timestamp.' });
            }
        }

        if (source.content_hash && typeof source.content_hash !== 'string') {
            errors.push({ field: 'source.content_hash', error: 'Must be a string (SHA-256 hex).' });
        }

        if (errors.length) return { valid: false, errors };

        return {
            valid: true,
            envelope: {
                source_url: source.source_url,
                retrieved_at: source.retrieved_at || null,
                content_hash: source.content_hash || null,
                excerpt: source.excerpt || null,
                excerpt_hash: source.excerpt_hash || null,
                archive_url: source.archive_url || null,
            },
        };
    }

    return { valid: false, errors: [{ field: 'source', error: 'Must be a URL string or a source evidence envelope object.' }] };
}

// ── Provenance Validators ──────────────────────────────────────────
// Optional metadata about how a contribution was authored (model, prompt hashes, etc.)
// Enables reproducibility and AI authorship disclosure without requiring it.

// ── ASCII-Only Key Enforcement ──────────────────────────────────────
// JCS canonicalization safety: our implementation uses lexicographic
// Object.keys().sort() which is correct for ASCII but may diverge from
// RFC 8785 for Unicode keys. By rejecting non-ASCII keys at ingest,
// we make canonicalization globally deterministic across all languages.

const ASCII_KEY_PATTERN = /^[\x20-\x7E]+$/;

/**
 * Recursively validate that all object keys are ASCII-only.
 * @param {*} obj - value to check
 * @param {string} path - dot-separated path for error reporting
 * @returns {Array} validation errors
 */
function validateAsciiKeys(obj, path) {
    if (obj === null || obj === undefined || typeof obj !== 'object') return [];
    if (Array.isArray(obj)) {
        const errors = [];
        obj.forEach((item, i) => {
            errors.push(...validateAsciiKeys(item, `${path}[${i}]`));
        });
        return errors;
    }

    const errors = [];
    for (const key of Object.keys(obj)) {
        if (!ASCII_KEY_PATTERN.test(key)) {
            errors.push({
                field: `${path}.${key}`,
                error: `Object keys must contain only printable ASCII characters (0x20-0x7E). Non-ASCII key: "${key}"`,
            });
        }
        errors.push(...validateAsciiKeys(obj[key], `${path}.${key}`));
    }
    return errors;
}

const DISCLOSURE_LEVELS = ['private', 'reproducible', 'full'];

export function validateProvenance(provenance) {
    if (!provenance) return { valid: true };
    if (typeof provenance !== 'object' || Array.isArray(provenance)) {
        return { valid: false, errors: [{ field: 'provenance', error: 'Must be an object if provided.' }] };
    }

    const errors = [];

    if (provenance.authored_with_model !== undefined && typeof provenance.authored_with_model !== 'string') {
        errors.push({ field: 'provenance.authored_with_model', error: 'Must be a string (model identifier).' });
    }
    if (provenance.system_prompt_hash !== undefined) {
        if (typeof provenance.system_prompt_hash !== 'string' || !/^[a-f0-9]{64}$/.test(provenance.system_prompt_hash)) {
            errors.push({ field: 'provenance.system_prompt_hash', error: 'Must be a SHA-256 hex string (64 chars).' });
        }
    }
    if (provenance.prompt_hash !== undefined) {
        if (typeof provenance.prompt_hash !== 'string' || !/^[a-f0-9]{64}$/.test(provenance.prompt_hash)) {
            errors.push({ field: 'provenance.prompt_hash', error: 'Must be a SHA-256 hex string (64 chars).' });
        }
    }
    if (provenance.tool_version !== undefined && typeof provenance.tool_version !== 'string') {
        errors.push({ field: 'provenance.tool_version', error: 'Must be a string.' });
    }
    if (provenance.disclosure_level !== undefined && !DISCLOSURE_LEVELS.includes(provenance.disclosure_level)) {
        errors.push({ field: 'provenance.disclosure_level', error: `Must be one of: ${DISCLOSURE_LEVELS.join(', ')}` });
    }

    return errors.length ? { valid: false, errors } : { valid: true };
}

function validateEvidence(payload) {
    const errors = [];

    // Source (accepts string or envelope)
    const sourceResult = validateSourceEnvelope(payload.source);
    if (!sourceResult.valid) {
        errors.push(...sourceResult.errors);
    }

    if (!EVIDENCE_STANCES.includes(payload.stance)) {
        errors.push({ field: 'stance', error: `Required. Must be one of: ${EVIDENCE_STANCES.join(', ')}` });
    }

    return errors;
}

/**
 * Challenge validation — ASYMMETRIC FRICTION.
 * Challenges have stricter SCHEMA requirements than other responses to prevent
 * semantic DDoS (Brandolini's Law countermeasure). Token cost is the same (1).
 */
function validateChallenge(payload) {
    const errors = [];

    if (!payload.target_assertion || typeof payload.target_assertion !== 'string' || payload.target_assertion.trim().length < 5) {
        errors.push({
            field: 'target_assertion',
            error: 'Required. Must quote or reference the specific assertion being challenged (min 5 chars).',
        });
    }

    if (!CHALLENGE_BASES.includes(payload.basis)) {
        errors.push({
            field: 'basis',
            error: `Required. Must be one of: ${CHALLENGE_BASES.join(', ')}`,
        });
    }

    if (!payload.argument || typeof payload.argument !== 'string' || payload.argument.trim().length < 20) {
        errors.push({
            field: 'argument',
            error: 'Required. Substantive refutation (min 20 chars). Must include counter-evidence, identification of a specific logical error, or demonstration of source unreliability.',
        });
    }

    // Source required for certain basis types (accepts string or envelope)
    if (['counter_evidence', 'source_unreliable'].includes(payload.basis)) {
        const sourceResult = validateSourceEnvelope(payload.source);
        if (!sourceResult.valid) {
            errors.push({ field: 'source', error: `Source required when basis is ${payload.basis}.` });
        }
    }

    return errors;
}

function validateUpdate(payload) {
    const errors = [];

    if (!UPDATE_TYPES.includes(payload.update_type)) {
        errors.push({ field: 'update_type', error: `Required. Must be one of: ${UPDATE_TYPES.join(', ')}` });
    }

    return errors;
}

function validateResolution(payload) {
    const errors = [];

    if (!payload.outcome || typeof payload.outcome !== 'string') {
        errors.push({ field: 'outcome', error: 'Required. The resolution outcome.' });
    }

    // Source (accepts string or envelope)
    const sourceResult = validateSourceEnvelope(payload.source);
    if (!sourceResult.valid) {
        errors.push(...sourceResult.errors);
    }

    if (!RESOLUTION_TYPES.includes(payload.resolution_type)) {
        errors.push({ field: 'resolution_type', error: `Required. Must be one of: ${RESOLUTION_TYPES.join(', ')}` });
    }

    return errors;
}

// ── State Machine ───────────────────────────────────────────────────

// Default shot clock: 168 hours (7 days). Configurable per-topic in Policy.
const DEFAULT_CHALLENGE_DECAY_HOURS = 168;

/**
 * Compute the current state of a contribution based on its responses.
 * "supported" is a DISPLAY HINT, not an official state transition.
 * The protocol shows evidence structure — it never declares truth.
 *
 * @param {object} contribution - the contribution entry
 * @param {Array} responses - response entries linked to this contribution
 * @param {object} options - { challenge_decay_hours: number }
 */
/**
 * Check if a response entry targets a specific entry ID.
 * The target is stored in linked_to[0] (primary) or payload.target_id (fallback).
 */
function targetsEntry(response, entryId) {
    if (!entryId) return false;
    const linked = response.linked_to || [];
    if (linked.includes(entryId)) return true;
    if (response.payload?.target_id === entryId) return true;
    if (response.target_id === entryId) return true; // legacy compat
    return false;
}

export function computeState(contribution, responses, options = {}) {
    const type = contribution.subtype;
    const decayHours = options.challenge_decay_hours || DEFAULT_CHALLENGE_DECAY_HOURS;

    switch (type) {
        case 'question':
            return computeQuestionState(contribution, responses);
        case 'claim':
            return computeClaimState(contribution, responses, decayHours);
        case 'prediction':
            return computePredictionState(contribution, responses);
        default:
            return { state: contribution.state || 'open', display_hint: null };
    }
}

function computeQuestionState(question, responses) {
    // Check for resolution
    const resolutions = responses.filter(r => r.subtype === 'resolution');
    if (resolutions.length > 0) {
        // Check if any resolution has been challenged
        const lastResolution = resolutions[resolutions.length - 1];
        const resolutionChallenged = responses.some(
            r => r.subtype === 'challenge' && r.target_id === lastResolution.entry_id
        );
        if (!resolutionChallenged) {
            return { state: 'resolved', display_hint: null };
        }
    }

    if (question.state === 'closed') {
        return { state: 'closed', display_hint: null };
    }

    return { state: 'open', display_hint: null };
}

function computeClaimState(claim, responses, decayHours) {
    // Claims NEVER resolve. They can be: open, contested, superseded, tombstoned.
    //
    // NOTE: `responses` is pre-filtered by the caller to entries whose
    // linked_to includes claim.entry_id. The target_id of a response lives
    // in linked_to[0] or payload.target_id, NOT as a top-level field.

    // Check for supersession
    const superseded = responses.some(
        r => r.subtype === 'update' && r.payload?.update_type === 'scope_change'
    );
    if (superseded) {
        return { state: 'superseded', display_hint: null };
    }

    // Get all challenges against the claim itself
    const challenges = responses.filter(
        r => r.subtype === 'challenge' && targetsEntry(r, claim.entry_id)
    );

    // Check which challenges are active (not stale via shot clock)
    const now = Date.now();
    const activeChallenges = challenges.filter(challenge => {
        // Find refuting evidence responses to this challenge
        // NOTE: responses to the challenge have linked_to=[challenge.entry_id],
        // which may not be in the pre-filtered array. If not found,
        // the challenge is treated as active (unanswered).
        const refutingResponses = responses.filter(
            r => targetsEntry(r, challenge.entry_id) &&
                (r.subtype === 'evidence' || r.subtype === 'update')
        );

        if (refutingResponses.length === 0) {
            // No response to this challenge — it's active (unaddressed)
            return true;
        }

        // There IS a response. Check the shot clock:
        // If the earliest response is older than decayHours and no counter from
        // the challenger, the challenge is stale.
        const earliestResponse = refutingResponses.reduce((min, r) => {
            const ts = new Date(r.timestamp).getTime();
            return ts < min ? ts : min;
        }, Infinity);

        const hoursSinceResponse = (now - earliestResponse) / (1000 * 60 * 60);

        // Has the challenger countered since the response?
        const challengerCountered = responses.some(
            r => r.subtype === 'challenge' &&
                !targetsEntry(r, claim.entry_id) && // Not targeting the claim directly
                new Date(r.timestamp).getTime() > earliestResponse
        );

        if (hoursSinceResponse > decayHours && !challengerCountered) {
            // Shot clock expired — challenge is stale, claim heals
            return false;
        }

        // Challenge is still active (within shot clock or challenger countered)
        return true;
    });

    if (activeChallenges.length > 0) {
        return { state: 'contested', display_hint: null };
    }

    // Check if claim started as unsubstantiated and now has evidence
    if (claim.state === 'unsubstantiated') {
        const supportingEvidence = responses.filter(
            r => r.subtype === 'evidence' && r.payload?.stance === 'supporting'
        );
        if (supportingEvidence.length === 0) {
            return { state: 'unsubstantiated', display_hint: null };
        }
    }

    // Compute display hint
    const supportingEvidence = responses.filter(
        r => r.subtype === 'evidence' && r.payload?.stance === 'supporting'
    );
    const displayHint = supportingEvidence.length > 0 && challenges.length === 0
        ? 'supported'
        : null;

    return { state: 'open', display_hint: displayHint };
}

function computePredictionState(prediction, responses) {
    const resolutions = responses.filter(r => r.subtype === 'resolution');
    if (resolutions.length > 0) {
        const lastResolution = resolutions[resolutions.length - 1];

        // Check if resolution has been challenged
        const resolutionChallenged = responses.some(
            r => r.subtype === 'challenge' && targetsEntry(r, lastResolution.entry_id)
        );

        if (resolutionChallenged) {
            return { state: 'contested', display_hint: null };
        }

        // Map resolution_type to state
        const stateMap = {
            confirmed: 'resolved_confirmed',
            refuted: 'resolved_refuted',
            partially_confirmed: 'resolved_confirmed',
            unresolvable: 'unresolvable',
        };

        return {
            state: stateMap[lastResolution.payload?.resolution_type] || 'resolved_confirmed',
            display_hint: null,
        };
    }

    // Check for direct challenges to the prediction itself (before resolution)
    const directChallenges = responses.filter(
        r => r.subtype === 'challenge' && targetsEntry(r, prediction.entry_id)
    );
    if (directChallenges.length > 0) {
        return { state: 'contested', display_hint: null };
    }

    // Check evidence for display hint
    const evidence = responses.filter(r => r.subtype === 'evidence');
    let displayHint = null;
    if (evidence.length > 0) {
        const supporting = evidence.filter(r => r.payload?.stance === 'supporting').length;
        const refuting = evidence.filter(r => r.payload?.stance === 'refuting').length;
        if (supporting > 0 && refuting === 0) displayHint = 'supported';
    }

    // Check if past resolution date
    if (prediction.payload?.resolution_date) {
        const resolutionDate = new Date(prediction.payload.resolution_date);
        if (resolutionDate <= new Date()) {
            return { state: 'open', display_hint: 'awaiting_resolution' };
        }
    }

    return { state: 'open', display_hint: displayHint };
}
