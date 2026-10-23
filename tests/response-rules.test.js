/**
 * API-level tests for who may respond, and how responses change state,
 * run through the real Worker with in-memory bindings.
 */

import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { makeEnv, call, dpopIdentity, offlineFetch } from './support/worker-env.js';

const DAY = 24 * 60 * 60 * 1000;

beforeAll(() => vi.stubGlobal('fetch', offlineFetch));
afterAll(() => vi.unstubAllGlobals());
afterEach(() => vi.useRealTimers());

function travel(ms) {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(Date.now() + ms);
}

function topicClient(topic) {
    const env = makeEnv('production');
    const post = (path, type, payload, who) => call(env, 'POST', path, { type, topic, payload }, who());
    return {
        contribute: (type, payload, who) => post('/api/contribute', type, payload, who),
        respond: (type, payload, who) => post('/api/respond', type, payload, who),
        state: async id => (await call(env, 'GET', `/api/entry/${id}`)).json.computed_state,
        feed: async () => (await call(env, 'GET', `/api/feed?topic=${topic}`)).json,
    };
}

const alice = dpopIdentity();
const bob = dpopIdentity();
const carol = dpopIdentity();
const mallory = dpopIdentity();

const claim = { body: 'The policy rate has peaked for this cycle.', category: 'opinion', uncertainty: 'medium' };
const challengeOf = target_id => ({ target_id, body: 'This does not follow.', target_assertion: 'the rate has peaked', basis: 'logical_error', argument: 'A pause in hikes is not a peak; the cited data only shows a pause.' });
const evidenceOn = (target_id, stance) => ({ target_id, body: 'Published minutes.', stance, source: 'https://example.org/minutes' });
const updateOf = (target_id, update_type) => ({ target_id, body: 'Narrowing the claim.', update_type });
const resolutionOf = (target_id, resolution_type) => ({ target_id, body: 'Settled by the source.', outcome: resolution_type, resolution_type, source: 'https://example.org/outcome' });

describe('updates', () => {
    it('only the author of a contribution can update it', async () => {
        const t = topicClient('updates');
        const c = (await t.contribute('claim', claim, alice)).json;

        const forged = await t.respond('update', updateOf(c.entry_id, 'scope_change'), mallory);
        expect(forged.status).toBe(403);
        expect(forged.json.error).toBe('not_author');
        expect(await t.state(c.entry_id)).toBe('open');

        expect((await t.respond('update', updateOf(c.entry_id, 'scope_change'), alice)).status).toBe(201);
        expect(await t.state(c.entry_id)).toBe('superseded');
    });

    it('an update answering a challenge must come from the author of the challenged claim', async () => {
        const t = topicClient('update-answers');
        const c = (await t.contribute('claim', claim, alice)).json;
        const ch = (await t.respond('challenge', challengeOf(c.entry_id), bob)).json;

        expect((await t.respond('update', updateOf(ch.entry_id, 'scope_change'), mallory)).json.error).toBe('not_author');
        expect((await t.respond('update', updateOf(ch.entry_id, 'scope_change'), bob)).json.error).toBe('not_author');
        expect((await t.respond('update', updateOf(ch.entry_id, 'correction'), alice)).status).toBe(201);

        // An answer to the challenge does not supersede the claim; it starts the shot clock.
        expect(await t.state(c.entry_id)).toBe('contested');
        travel(8 * DAY);
        expect(await t.state(c.entry_id)).toBe('open');
    });
});

describe('challenges of claims', () => {
    it('refuting evidence answers a challenge, and the claim heals when the shot clock expires', async () => {
        const t = topicClient('healing');
        const c = (await t.contribute('claim', claim, alice)).json;
        const ch = (await t.respond('challenge', challengeOf(c.entry_id), bob)).json;
        expect(await t.state(c.entry_id)).toBe('contested');

        expect((await t.respond('evidence', evidenceOn(ch.entry_id, 'refuting'), carol)).status).toBe(201);
        expect(await t.state(c.entry_id)).toBe('contested');

        travel(8 * DAY);
        expect(await t.state(c.entry_id)).toBe('open');
        expect((await t.feed()).contributions.find(e => e.entry_id === c.entry_id).computed_state).toBe('open');
    });

    it('evidence supporting the challenge does not answer it', async () => {
        const t = topicClient('support-challenge');
        const c = (await t.contribute('claim', claim, alice)).json;
        const ch = (await t.respond('challenge', challengeOf(c.entry_id), bob)).json;
        expect((await t.respond('evidence', evidenceOn(ch.entry_id, 'supporting'), carol)).status).toBe(201);

        travel(8 * DAY);
        expect(await t.state(c.entry_id)).toBe('contested');
    });
});

describe('resolutions', () => {
    it('a challenged resolution reopens the question', async () => {
        const t = topicClient('questions');
        const q = (await t.contribute('question', { body: 'Will the committee publish its minutes?' }, alice)).json;
        const r = (await t.respond('resolution', resolutionOf(q.entry_id, 'answered'), bob)).json;
        expect(await t.state(q.entry_id)).toBe('resolved');

        expect((await t.respond('challenge', challengeOf(r.entry_id), carol)).status).toBe(201);
        expect(await t.state(q.entry_id)).toBe('open');
        expect((await t.feed()).contributions.find(e => e.entry_id === q.entry_id).computed_state).toBe('open');
    });

    const prediction = due => ({
        body: 'The cash rate will be lower by the resolution date.',
        resolution_criteria: 'The published cash rate target is below today\'s.',
        resolution_date: new Date(due).toISOString(),
        resolution_source: 'https://example.org/cash-rate',
        resolution_rule: 'Any contributor with source evidence',
    });
    const trackRecord = async (t, author) => {
        const { trackRecords } = await t.feed();
        const [record] = Object.values(trackRecords).filter(record => record.author.topic_pseudonym === author);
        return { resolved: record.resolved, incorrect: record.incorrect };
    };

    it('a prediction cannot be resolved before its resolution_date', async () => {
        const t = topicClient('early');
        const p = (await t.contribute('prediction', prediction(Date.now() + 30 * DAY), alice)).json;

        const early = await t.respond('resolution', resolutionOf(p.entry_id, 'refuted'), mallory);
        expect(early.status).toBe(422);
        expect(early.json.error).toBe('resolution_not_due');
        expect(await t.state(p.entry_id)).toBe('open');
        const author = (await t.feed()).contributions[0].author.topic_pseudonym;
        expect(await trackRecord(t, author)).toEqual({ resolved: 0, incorrect: 0 });

        travel(31 * DAY);
        expect((await t.respond('resolution', resolutionOf(p.entry_id, 'refuted'), mallory)).status).toBe(201);
        expect(await t.state(p.entry_id)).toBe('resolved_refuted');
        expect(await trackRecord(t, author)).toEqual({ resolved: 1, incorrect: 1 });
    });

    it('any participant may propose an alternative source for a prediction, and only that', async () => {
        const t = topicClient('alternative-source');
        const p = (await t.contribute('prediction', prediction(Date.now() + 30 * DAY), alice)).json;
        expect((await t.respond('update', updateOf(p.entry_id, 'alternative_source'), mallory)).status).toBe(201);
        expect(await t.state(p.entry_id)).toBe('open');
        expect((await t.respond('update', updateOf(p.entry_id, 'correction'), mallory)).json.error).toBe('not_author');

        // On a claim, or as an answer to a challenge, it is an update like any other.
        const c = (await t.contribute('claim', claim, carol)).json;
        const ch = (await t.respond('challenge', challengeOf(c.entry_id), bob)).json;
        expect((await t.respond('update', updateOf(c.entry_id, 'alternative_source'), mallory)).json.error).toBe('not_author');
        expect((await t.respond('update', updateOf(ch.entry_id, 'alternative_source'), mallory)).json.error).toBe('not_author');
        expect(await t.state(c.entry_id)).toBe('contested');
    });

    it('a challenged prediction resolution makes the prediction contested', async () => {
        const t = topicClient('contested-prediction');
        const p = (await t.contribute('prediction', prediction(Date.now() + DAY), alice)).json;
        travel(2 * DAY);
        const r = (await t.respond('resolution', resolutionOf(p.entry_id, 'refuted'), mallory)).json;
        expect(await t.state(p.entry_id)).toBe('resolved_refuted');

        expect((await t.respond('challenge', challengeOf(r.entry_id), alice)).status).toBe(201);
        expect(await t.state(p.entry_id)).toBe('contested');
        const author = (await t.feed()).contributions[0].author.topic_pseudonym;
        expect(await trackRecord(t, author)).toEqual({ resolved: 0, incorrect: 0 });
    });
});
