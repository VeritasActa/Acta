import { describe, expect, it } from 'vitest';
import { makeEnv, call, dpopIdentity } from './support/worker-env.js';

const question = { type: 'question', topic: 'identity', payload: { body: 'Which identities does this instance accept?' } };

describe('X-Device-Id header identity', () => {
    it('is ignored in production: a request with the header gets the same 401 as one without', async () => {
        const env = makeEnv('production');
        const without = await call(env, 'POST', '/api/contribute', question);
        expect(without).toEqual({ status: 401, json: { error: 'identity_required' } });
        expect(await call(env, 'POST', '/api/contribute', question, { 'X-Device-Id': 'any-value' })).toEqual(without);

        const response = { type: 'evidence', topic: 'identity', payload: { target_id: crypto.randomUUID(), body: 'Evidence.', stance: 'supporting', source: 'https://example.org/source' } };
        expect(await call(env, 'POST', '/api/respond', response, { 'X-Device-Id': 'any-value' })).toEqual(without);

        // A signed identity is still accepted, and nothing the header sent was recorded.
        expect((await call(env, 'POST', '/api/contribute', question, dpopIdentity()())).status).toBe(201);
        const { json } = await call(env, 'GET', '/api/export/identity');
        expect(json.entries.map(entry => entry.author.method)).toEqual(['dpop']);
    });

    it('is still accepted in development', async () => {
        const env = makeEnv('development');
        expect((await call(env, 'POST', '/api/contribute', question, { 'X-Device-Id': 'local-device' })).status).toBe(201);
        const { json } = await call(env, 'GET', '/api/export/identity');
        expect(json.entries.map(entry => entry.author.method)).toEqual(['header']);
    });
});
