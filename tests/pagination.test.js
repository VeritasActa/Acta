/**
 * The ledger Durable Object serves at most 200 entries per request. These
 * tests run the Worker past that page size and check the export with the
 * independent verifier (tools/verify.js).
 */

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { execFile } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { makeEnv, call, dpopIdentity, offlineFetch } from './support/worker-env.js';

const run = promisify(execFile);
const VERIFY = fileURLToPath(new URL('../tools/verify.js', import.meta.url));

beforeAll(() => vi.stubGlobal('fetch', offlineFetch));
afterAll(() => vi.unstubAllGlobals());

async function verifyWithCli(exported) {
    const dir = mkdtempSync(join(tmpdir(), 'acta-export-'));
    try {
        const file = join(dir, 'export.json');
        writeFileSync(file, JSON.stringify(exported));
        return await run(process.execPath, [VERIFY, file]).then(
            ({ stdout }) => ({ code: 0, stdout }),
            ({ code, stdout }) => ({ code, stdout }),
        );
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
}

describe('topics longer than one ledger page', () => {
    it('export, feed and entry state include every entry past the first 200', async () => {
        const env = makeEnv('production');
        const topic = 'past-one-page';
        // A self-generated DPoP key is an agent with 4 tokens a day: two questions.
        let identity;
        const ask = async i => {
            if (i % 2 === 0) identity = dpopIdentity();
            const body = `Question ${i}: what is the value of item ${i * 7919}?`;
            return (await call(env, 'POST', '/api/contribute', { type: 'question', topic, payload: { body } }, identity())).json;
        };
        const first = await ask(0);
        for (let i = 1; i <= 204; i++) expect((await ask(i)).sequence).toBe(i);
        const resolution = await call(env, 'POST', '/api/respond', {
            type: 'resolution', topic,
            payload: { target_id: first.entry_id, body: 'Answered.', outcome: 'answered', resolution_type: 'answered', source: 'https://example.org/answer' },
        }, dpopIdentity()());
        expect(resolution.json.sequence).toBe(205);

        const exported = (await call(env, 'GET', `/api/export/${topic}`)).json;
        expect(exported.entries).toHaveLength(206);
        expect(exported.total).toBe(206);
        expect(exported.chain_head.chain_length).toBe(206);
        const cli = await verifyWithCli(exported);
        expect(cli.stdout).toContain('Chain intact');
        expect(cli.stdout).toMatch(/Entries:\s+206/);
        expect(cli.code).toBe(0);

        const feed = (await call(env, 'GET', `/api/feed?topic=${topic}`)).json;
        expect(feed.entries.map(e => e.sequence)).toEqual([...Array(206).keys()]);

        const entry = (await call(env, 'GET', `/api/entry/${first.entry_id}`)).json;
        expect(entry.computed_state).toBe('resolved');
        expect(entry.responses).toHaveLength(1);
    }, 30000);

    for (const route of ['/entries', '/chain-head']) {
        it(`an export matches its chain head when a write lands after its ${route} read`, async () => {
            const env = makeEnv('production');
            const topic = 'concurrent-write';
            const author = dpopIdentity();
            const ask = body => call(env, 'POST', '/api/contribute', { type: 'question', topic, payload: { body } }, author());
            await ask('Which entries does an export include?');

            const get = env.LEDGER_CHAIN.get.bind(env.LEDGER_CHAIN);
            let raced = false;
            env.LEDGER_CHAIN.get = id => {
                const stub = get(id);
                return {
                    fetch: async request => {
                        const response = await stub.fetch(request);
                        if (!raced && new URL(request.url).pathname === route) {
                            raced = true;
                            await ask('Was this question posted during the export?');
                        }
                        return response;
                    },
                };
            };

            const exported = (await call(env, 'GET', `/api/export/${topic}`)).json;
            expect(raced).toBe(true);
            const cli = await verifyWithCli(exported);
            expect(cli.stdout).toContain('Chain intact');
            expect(cli.code).toBe(0);
        });
    }
});
