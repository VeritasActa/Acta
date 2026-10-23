/**
 * Tests for Acta schema validators, state machine, token costs,
 * response target matrix, oracle specs, and source evidence envelope.
 *
 * Run: npx vitest
 */

import { describe, it, expect } from 'vitest';
import {
    validateContribution,
    validateResponse,
    validateResponseTarget,
    validateSourceEnvelope,
    computeState,
    TOKEN_COSTS,
    RESPONSE_TARGET_MATRIX,
} from '../src/validators/schema.js';

// ── Contribution Validation ─────────────────────────────────────────

describe('validateContribution', () => {
    // Questions
    it('accepts a valid question', () => {
        const result = validateContribution('question', { body: 'What is the capital of France?' });
        expect(result.valid).toBe(true);
    });

    it('rejects a question with empty body', () => {
        const result = validateContribution('question', { body: '' });
        expect(result.valid).toBe(false);
        expect(result.errors[0].field).toBe('body');
    });

    // Claims
    it('accepts a factual claim with source', () => {
        const result = validateContribution('claim', {
            body: 'The Earth orbits the Sun.',
            category: 'factual',
            source: 'https://nasa.gov/earth-orbit',
        });
        expect(result.valid).toBe(true);
    });

    it('accepts a factual claim with reasoning', () => {
        const result = validateContribution('claim', {
            body: 'The Earth orbits the Sun.',
            category: 'factual',
            reasoning: 'Observable planetary motion and gravitational models.',
        });
        expect(result.valid).toBe(true);
    });

    it('rejects a factual claim with no source or reasoning', () => {
        const result = validateContribution('claim', {
            body: 'The Earth orbits the Sun.',
            category: 'factual',
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.field === 'source')).toBe(true);
    });

    it('accepts an opinion with uncertainty', () => {
        const result = validateContribution('claim', {
            body: 'I think decentralized systems are better.',
            category: 'opinion',
            uncertainty: 'High confidence but depends on the use case. Better for censorship resistance, worse for latency.',
        });
        expect(result.valid).toBe(true);
    });

    it('rejects an opinion without uncertainty', () => {
        const result = validateContribution('claim', {
            body: 'Decentralized is better.',
            category: 'opinion',
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.field === 'uncertainty')).toBe(true);
    });

    it('rejects a claim with invalid category', () => {
        const result = validateContribution('claim', {
            body: 'Something.',
            category: 'rant',
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.field === 'category')).toBe(true);
    });

    it('rejects a claim with body over 10000 chars', () => {
        const result = validateContribution('claim', {
            body: 'x'.repeat(10001),
            category: 'opinion',
            uncertainty: 'test',
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.field === 'body')).toBe(true);
    });

    // Predictions with Oracle Specs
    it('accepts a valid prediction with oracle specs', () => {
        const futureDate = new Date(Date.now() + 86400000 * 30).toISOString();
        const result = validateContribution('prediction', {
            body: 'GPT-5 will be released by end of 2026.',
            resolution_criteria: 'OpenAI announces public availability of GPT-5.',
            resolution_date: futureDate,
            resolution_source: 'https://openai.com/blog',
            resolution_rule: 'Any contributor may resolve with link to official announcement.',
        });
        expect(result.valid).toBe(true);
    });

    it('accepts prediction with optional oracle fields', () => {
        const futureDate = new Date(Date.now() + 86400000 * 30).toISOString();
        const result = validateContribution('prediction', {
            body: 'Prediction with full oracle spec.',
            resolution_criteria: 'Checked against source.',
            resolution_date: futureDate,
            resolution_source: 'https://primary.example.com',
            resolution_rule: 'Automated check against primary source.',
            resolution_source_fallback: 'https://fallback.example.com',
            challenge_window_hours: 48,
        });
        expect(result.valid).toBe(true);
    });

    it('rejects a prediction without resolution_rule', () => {
        const futureDate = new Date(Date.now() + 86400000 * 30).toISOString();
        const result = validateContribution('prediction', {
            body: 'Missing oracle spec.',
            resolution_criteria: 'Something happens.',
            resolution_date: futureDate,
            resolution_source: 'https://example.com',
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.field === 'resolution_rule')).toBe(true);
    });

    it('rejects a prediction without resolution criteria', () => {
        const result = validateContribution('prediction', {
            body: 'Something will happen.',
            resolution_date: new Date(Date.now() + 86400000).toISOString(),
            resolution_source: 'https://example.com',
            resolution_rule: 'Anyone with evidence.',
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.field === 'resolution_criteria')).toBe(true);
    });

    it('rejects a prediction with past resolution date', () => {
        const result = validateContribution('prediction', {
            body: 'Something happened.',
            resolution_criteria: 'It happened.',
            resolution_date: '2020-01-01T00:00:00Z',
            resolution_source: 'https://example.com',
            resolution_rule: 'Anyone.',
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.field === 'resolution_date')).toBe(true);
    });

    it('rejects an invalid type', () => {
        const result = validateContribution('rant', { body: 'Something' });
        expect(result.valid).toBe(false);
    });
});

// ── Response Validation ─────────────────────────────────────────────

describe('validateResponse', () => {
    // Evidence with source envelope
    it('accepts evidence with string source (backwards compat)', () => {
        const result = validateResponse('evidence', {
            target_id: 'abc-123',
            body: 'Supporting evidence from NASA.',
            source: 'https://nasa.gov/data',
            stance: 'supporting',
        });
        expect(result.valid).toBe(true);
    });

    it('accepts evidence with full source envelope', () => {
        const result = validateResponse('evidence', {
            target_id: 'abc-123',
            body: 'Evidence with full envelope.',
            source: {
                source_url: 'https://nasa.gov/data',
                retrieved_at: new Date().toISOString(),
                content_hash: 'abcdef1234567890',
                excerpt: 'The relevant section states...',
                archive_url: 'https://web.archive.org/web/...',
            },
            stance: 'supporting',
        });
        expect(result.valid).toBe(true);
    });

    it('rejects evidence without source', () => {
        const result = validateResponse('evidence', {
            target_id: 'abc-123',
            body: 'Trust me.',
            stance: 'supporting',
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.field === 'source')).toBe(true);
    });

    // Challenges — ASYMMETRIC FRICTION (schema, not cost)
    it('accepts a well-formed challenge', () => {
        const result = validateResponse('challenge', {
            target_id: 'abc-123',
            body: 'The source cited is unreliable because it was retracted.',
            target_assertion: 'The Earth orbits the Sun at constant speed',
            basis: 'source_unreliable',
            argument: 'The cited paper was retracted in 2024 due to data fabrication. See retraction notice.',
            source: 'https://retractionwatch.com/example',
        });
        expect(result.valid).toBe(true);
    });

    it('rejects a challenge without target_assertion (anti-DDoS)', () => {
        const result = validateResponse('challenge', {
            target_id: 'abc-123',
            body: 'I disagree.',
            basis: 'logical_error',
            argument: 'This is wrong for many reasons that I will now explain at length.',
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.field === 'target_assertion')).toBe(true);
    });

    it('rejects a challenge with too-short argument', () => {
        const result = validateResponse('challenge', {
            target_id: 'abc-123',
            body: 'Wrong.',
            target_assertion: 'The claim about speed',
            basis: 'logical_error',
            argument: 'Wrong.',
        });
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.field === 'argument')).toBe(true);
    });

    it('rejects a challenge with counter_evidence basis but no source', () => {
        const result = validateResponse('challenge', {
            target_id: 'abc-123',
            body: 'Counter evidence exists.',
            target_assertion: 'The claim about temperature',
            basis: 'counter_evidence',
            argument: 'Multiple studies show the opposite temperature trend over the last decade.',
        });
        expect(result.valid).toBe(false);
    });

    // Resolution
    it('accepts a valid resolution', () => {
        const result = validateResponse('resolution', {
            target_id: 'abc-123',
            body: 'The prediction was confirmed.',
            outcome: 'GPT-5 was released on March 1, 2026.',
            source: 'https://openai.com/blog/gpt-5',
            resolution_type: 'confirmed',
        });
        expect(result.valid).toBe(true);
    });

    // Update
    it('accepts a valid update', () => {
        const result = validateResponse('update', {
            target_id: 'abc-123',
            body: 'New data available.',
            update_type: 'additional_context',
        });
        expect(result.valid).toBe(true);
    });
});

// ── Source Evidence Envelope ─────────────────────────────────────────

describe('validateSourceEnvelope', () => {
    it('accepts a plain string source', () => {
        const result = validateSourceEnvelope('https://example.com');
        expect(result.valid).toBe(true);
        expect(result.envelope.source_url).toBe('https://example.com');
        expect(result.envelope.content_hash).toBeNull();
    });

    it('accepts a full envelope object', () => {
        const result = validateSourceEnvelope({
            source_url: 'https://example.com',
            retrieved_at: '2026-01-01T00:00:00Z',
            content_hash: 'abc123',
            excerpt: 'Relevant section',
            archive_url: 'https://archive.org/...',
        });
        expect(result.valid).toBe(true);
        expect(result.envelope.source_url).toBe('https://example.com');
        expect(result.envelope.content_hash).toBe('abc123');
    });

    it('rejects empty source', () => {
        const result = validateSourceEnvelope(null);
        expect(result.valid).toBe(false);
    });

    it('rejects envelope without source_url', () => {
        const result = validateSourceEnvelope({ content_hash: 'abc' });
        expect(result.valid).toBe(false);
    });
});

// ── Response Target Matrix ──────────────────────────────────────────

describe('validateResponseTarget', () => {
    it('allows evidence targeting a claim', () => {
        const result = validateResponseTarget('evidence', { type: 'contribution', subtype: 'claim' });
        expect(result.valid).toBe(true);
    });

    it('allows challenge targeting a resolution response', () => {
        const result = validateResponseTarget('challenge', { type: 'response', subtype: 'resolution' });
        expect(result.valid).toBe(true);
    });

    it('rejects resolution targeting a claim (claims never resolve)', () => {
        const result = validateResponseTarget('resolution', { type: 'contribution', subtype: 'claim' });
        expect(result.valid).toBe(false);
        expect(result.error).toContain('Claims never resolve');
    });

    it('allows resolution targeting a question', () => {
        const result = validateResponseTarget('resolution', { type: 'contribution', subtype: 'question' });
        expect(result.valid).toBe(true);
    });

    it('allows resolution targeting a prediction', () => {
        const result = validateResponseTarget('resolution', { type: 'contribution', subtype: 'prediction' });
        expect(result.valid).toBe(true);
    });

    it('allows evidence and updates targeting a challenge response (to answer it)', () => {
        expect(validateResponseTarget('evidence', { type: 'response', subtype: 'challenge' }).valid).toBe(true);
        expect(validateResponseTarget('update', { type: 'response', subtype: 'challenge' }).valid).toBe(true);
    });

    it('rejects evidence targeting a resolution response', () => {
        const result = validateResponseTarget('evidence', { type: 'response', subtype: 'resolution' });
        expect(result.valid).toBe(false);
    });

    it('rejects challenge targeting an evidence response', () => {
        const result = validateResponseTarget('challenge', { type: 'response', subtype: 'evidence' });
        expect(result.valid).toBe(false);
    });
});

// ── State Machine ───────────────────────────────────────────────────

describe('computeState', () => {
    it('returns open for a new claim with no responses', () => {
        const claim = { entry_id: 'c1', subtype: 'claim', state: 'open' };
        const result = computeState(claim, []);
        expect(result.state).toBe('open');
    });

    // Responses in the shape the API stores them: the target is in linked_to
    // and payload.target_id, and the ledger sets the timestamp. Callers pass a
    // contribution's responses together with the replies to them.
    const DAY = 24 * 60 * 60 * 1000;
    const ago = days => new Date(Date.now() - days * DAY).toISOString();
    const response = (entry_id, subtype, target_id, payload = {}, timestamp = ago(0)) => ({
        entry_id, type: 'response', subtype, linked_to: [target_id], payload: { target_id, ...payload }, timestamp,
    });

    it('returns contested when an unaddressed challenge exists', () => {
        const claim = { entry_id: 'c1', subtype: 'claim', state: 'open' };
        const responses = [response('ch1', 'challenge', 'c1')];
        const result = computeState(claim, responses);
        expect(result.state).toBe('contested');
    });

    it('returns open with supported hint when evidence exists and no challenges', () => {
        const claim = { entry_id: 'c1', subtype: 'claim', state: 'open' };
        const responses = [response('e1', 'evidence', 'c1', { stance: 'supporting' })];
        const result = computeState(claim, responses);
        expect(result.state).toBe('open');
        expect(result.display_hint).toBe('supported');
    });

    it('returns contested when challenge is within shot clock', () => {
        const claim = { entry_id: 'c1', subtype: 'claim', state: 'open' };
        const responses = [
            response('ch1', 'challenge', 'c1'),
            response('e1', 'evidence', 'ch1', { stance: 'refuting' }),
        ];
        // Within shot clock (default 168h): still contested because the answer is fresh
        const result = computeState(claim, responses, { challenge_decay_hours: 168 });
        expect(result.state).toBe('contested');
    });

    it('returns open when shot clock expires (challenge decays to stale)', () => {
        const claim = { entry_id: 'c1', subtype: 'claim', state: 'open' };
        // The answer is 8 days old (beyond the 7-day default shot clock)
        const responses = [
            response('ch1', 'challenge', 'c1', {}, ago(9)),
            response('e1', 'evidence', 'ch1', { stance: 'refuting' }, ago(8)),
        ];
        const result = computeState(claim, responses, { challenge_decay_hours: 168 });
        expect(result.state).toBe('open');
    });

    it('does not treat evidence supporting a challenge as an answer to it', () => {
        const claim = { entry_id: 'c1', subtype: 'claim', state: 'open' };
        const responses = [
            response('ch1', 'challenge', 'c1', {}, ago(9)),
            response('e1', 'evidence', 'ch1', { stance: 'supporting' }, ago(8)),
        ];
        expect(computeState(claim, responses, { challenge_decay_hours: 168 }).state).toBe('contested');
    });

    it('supersedes a claim only by an update aimed at the claim itself', () => {
        const claim = { entry_id: 'c1', subtype: 'claim', state: 'open' };
        const answer = [response('ch1', 'challenge', 'c1'), response('u1', 'update', 'ch1', { update_type: 'scope_change' })];
        expect(computeState(claim, answer).state).toBe('contested');
        expect(computeState(claim, [response('u2', 'update', 'c1', { update_type: 'scope_change' })]).state).toBe('superseded');
    });

    it('returns resolved for a question with a resolution', () => {
        const question = { entry_id: 'q1', subtype: 'question', state: 'open' };
        const responses = [response('r1', 'resolution', 'q1', { resolution_type: 'answered' })];
        const result = computeState(question, responses);
        expect(result.state).toBe('resolved');
    });

    it('returns open when a resolution is challenged', () => {
        const question = { entry_id: 'q1', subtype: 'question', state: 'open' };
        const responses = [
            response('r1', 'resolution', 'q1', { resolution_type: 'answered' }),
            response('ch1', 'challenge', 'r1'),
        ];
        const result = computeState(question, responses);
        expect(result.state).toBe('open');
    });

    const prediction = { entry_id: 'p1', subtype: 'prediction', state: 'open', payload: { resolution_date: ago(2) } };

    it('returns resolved_confirmed for prediction with confirmed resolution', () => {
        const responses = [response('r1', 'resolution', 'p1', { resolution_type: 'confirmed' }, ago(1))];
        const result = computeState(prediction, responses);
        expect(result.state).toBe('resolved_confirmed');
    });

    it('returns contested when a prediction resolution is challenged', () => {
        const responses = [
            response('r1', 'resolution', 'p1', { resolution_type: 'refuted' }, ago(1)),
            response('ch1', 'challenge', 'r1'),
        ];
        expect(computeState(prediction, responses).state).toBe('contested');
    });

    it('ignores a resolution posted before the resolution date', () => {
        const responses = [response('r1', 'resolution', 'p1', { resolution_type: 'refuted' }, ago(3))];
        expect(computeState(prediction, responses)).toEqual({ state: 'open', display_hint: 'awaiting_resolution' });
        const undated = { ...prediction, payload: {} };
        expect(computeState(undated, [response('r2', 'resolution', 'p1', { resolution_type: 'confirmed' })]).state).toBe('open');
    });
});

// ── Token Costs ─────────────────────────────────────────────────────

describe('TOKEN_COSTS', () => {
    it('charges 2 tokens for contributions', () => {
        expect(TOKEN_COSTS.question).toBe(2);
        expect(TOKEN_COSTS.claim).toBe(2);
        expect(TOKEN_COSTS.prediction).toBe(2);
    });

    it('charges 1 token for all responses (including challenges)', () => {
        expect(TOKEN_COSTS.evidence).toBe(1);
        expect(TOKEN_COSTS.update).toBe(1);
        expect(TOKEN_COSTS.resolution).toBe(1);
        expect(TOKEN_COSTS.challenge).toBe(1);
    });

    it('challenge cost is 1 (schema friction does the filtering, not cost)', () => {
        // Explicitly test that challenge is NOT 2.
        // The schema friction (target_assertion, basis, argument >= 20 chars)
        // is the Brandolini countermeasure, not economic cost.
        expect(TOKEN_COSTS.challenge).toBe(1);
    });
});

// ── Response Target Matrix Structure ────────────────────────────────

describe('RESPONSE_TARGET_MATRIX', () => {
    it('excludes claim from resolution targets', () => {
        expect(RESPONSE_TARGET_MATRIX.resolution.contribution).not.toContain('claim');
    });

    it('includes question and prediction in resolution targets', () => {
        expect(RESPONSE_TARGET_MATRIX.resolution.contribution).toContain('question');
        expect(RESPONSE_TARGET_MATRIX.resolution.contribution).toContain('prediction');
    });

    it('allows challenges to target resolutions', () => {
        expect(RESPONSE_TARGET_MATRIX.challenge.response).toContain('resolution');
    });

    it('allows evidence and updates to target a challenge, and no other response', () => {
        expect(RESPONSE_TARGET_MATRIX.evidence.response).toEqual(['challenge']);
        expect(RESPONSE_TARGET_MATRIX.update.response).toEqual(['challenge']);
    });
});
