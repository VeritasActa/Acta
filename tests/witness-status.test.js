import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import worker from '../src/index.js';
import { witnessStatus } from '../src/witness-status.js';

const now = Date.parse('2026-10-16T12:00:00.000Z');
const anchor = { timestamp: '2026-10-16T00:00:00.000Z', merkle_root: 'a'.repeat(64), signature: 'historical-signature' };
const oldWitness = {
    anchor_timestamp: '2026-09-24T00:00:00.000Z',
    witnessed_at: '2026-09-24T00:05:00.000Z',
    post_uri: 'at://did:plc:example/app.bsky.feed.post/example',
    post_url: 'https://bsky.app/profile/example.test/post/example',
};
const currentWitness = { ...oldWitness, anchor_timestamp: anchor.timestamp, witnessed_at: '2026-10-16T00:05:00.000Z' };

describe('witness freshness', () => {
    it('distinguishes historical publication from coverage of the latest anchor', () => {
        expect(witnessStatus(anchor, oldWitness, now)).toMatchObject({
            status: 'behind', latest_anchor_reported: false, anchor_lag_hours: 528,
            latest_anchor_timestamp: anchor.timestamp, assessment: 'operator-reported',
        });
        expect(witnessStatus(anchor, oldWitness, now).note).toContain('Historical publications remain available');
    });

    it('reports matching coverage without claiming independent verification', () => {
        const result = witnessStatus(anchor, currentWitness, now);
        expect(result).toMatchObject({ status: 'active', freshness: 'current', latest_anchor_reported: true, age_hours: 11.9, anchor_lag_hours: 0 });
        expect(result.note).toContain('has not been checked');
    });

    it('accepts equivalent timestamp representations', () => {
        expect(witnessStatus(anchor, { ...currentWitness, anchor_timestamp: '2026-10-16T01:00:00+01:00' }, now).freshness).toBe('current');
    });

    it('reports no publication separately from historical publication', () => {
        expect(witnessStatus(anchor, null, now)).toMatchObject({ status: 'not_reported', latest_anchor_reported: null, age_hours: null });
    });

    it('does not infer coverage when the latest anchor is unavailable', () => {
        expect(witnessStatus(null, oldWitness, now)).toMatchObject({ status: 'unknown', latest_anchor_reported: null, latest_anchor_timestamp: null });
    });

    it('does not treat a future-dated anchor as current', () => {
        expect(witnessStatus({ ...anchor, timestamp: '2026-10-17T00:00:00.000Z' }, currentWitness, now))
            .toMatchObject({ status: 'unknown', latest_anchor_reported: null });
    });

    it.each([
        { anchor_timestamp: 'not-a-date' },
        { anchor_timestamp: '2' },
        { anchor_timestamp: '2026-02-31T00:00:00.000Z' },
        { anchor_timestamp: '2026-10-17T00:00:00.000Z' },
        { witnessed_at: '2026-10-17T00:05:00.000Z' },
        { witnessed_at: 'not-a-date' },
        { witnessed_at: '2026-10-15T00:05:00.000Z' },
    ])('does not report malformed or inconsistent timestamps as current: %j', patch => {
        const result = witnessStatus(anchor, { ...currentWitness, ...patch }, now);
        expect(result.status).toBe('unknown');
        expect(result.latest_anchor_reported).toBeNull();
        expect(result.age_hours === null || result.age_hours >= 0).toBe(true);
    });
});

function bindings(witness = oldWitness) {
    const values = new Map([
        ['anchor:latest', anchor], ['witness:latest', witness], ['topics:list', []],
        ['conformance:report', { witness: { status: 'active' }, obsolete: true }],
    ]);
    return {
        ACTA_KV: {
            async get(key, options) {
                const value = values.get(key);
                if (value === undefined) return null;
                return options?.type === 'json' && typeof value === 'string' ? JSON.parse(value) : value;
            },
            async put(key, value) { values.set(key, value); },
        },
    };
}

describe('public witness status', () => {
    beforeEach(() => vi.useFakeTimers({ now }));
    afterEach(() => vi.useRealTimers());
    it('keeps the legacy active value only for a current publication report', async () => {
        const env = bindings(currentWitness);
        for (const path of ['/.well-known/acta-instance.json', '/api/conformance']) {
            const response = await worker.fetch(new Request(`https://veritasacta.com${path}`), env, { waitUntil() {} });
            const json = await response.json();
            expect(json.witness).toMatchObject({ status: 'active', freshness: 'current', latest_anchor_reported: true });
        }
    });

    it('reports consistent current-head coverage and preserves the historical post in both endpoints', async () => {
        const env = bindings();
        const ctx = { waitUntil() {} };
        const manifest = await worker.fetch(new Request('https://veritasacta.com/.well-known/acta-instance.json'), env, ctx).then(r => r.json());
        const report = await worker.fetch(new Request('https://veritasacta.com/api/conformance'), env, ctx).then(r => r.json());
        expect(manifest.witness.status).toBe('behind');
        expect(report.witness.status).toBe('behind');
        expect(report.obsolete).toBeUndefined();
        expect(manifest.witness.latest.post_url).toBe(oldWitness.post_url);
        expect(report.witness.post_url).toBe(oldWitness.post_url);
        expect(manifest.witness.latest_anchor_reported).toBe(false);
        expect(report.witness.latest_timestamp).toBe(oldWitness.witnessed_at);
        expect(report.disclaimer).toContain('tools/verify.js');
    });

    it('never hardcodes active when no witness publication has been reported', async () => {
        const env = bindings(null);
        for (const path of ['/.well-known/acta-instance.json', '/api/conformance']) {
            const response = await worker.fetch(new Request(`https://veritasacta.com${path}`), env, { waitUntil() {} });
            const json = await response.json();
            expect(json.witness.status).toBe('not_reported');
            expect(json.witness.latest_anchor_reported).toBeNull();
        }
    });
});
