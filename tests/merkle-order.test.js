/**
 * The anchor's Merkle root sorts topics by UTF-16 code unit, so a verifier
 * running under any locale recomputes the same root.
 */

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { handleScheduled, getAnchorPublicKey } from '../src/chain-publication.js';
import { jcsSerialize } from '../src/durable-objects/ledger-chain.js';
import { makeEnv, call, dpopIdentity, offlineFetch } from './support/worker-env.js';

const run = promisify(execFile);
const VERIFY = fileURLToPath(new URL('../tools/verify.js', import.meta.url));
const DANISH = { ...process.env, LC_ALL: 'da_DK.UTF-8', LANG: 'da_DK.UTF-8' };
const sha256 = text => createHash('sha256').update(text, 'utf8').digest('hex');

beforeAll(() => vi.stubGlobal('fetch', offlineFetch));
afterAll(() => vi.unstubAllGlobals());

function codeUnitMerkleRoot(heads) {
    let layer = [...heads].sort((a, b) => (a.topic < b.topic ? -1 : a.topic > b.topic ? 1 : 0)).map(head => sha256(jcsSerialize(head)));
    while (layer.length > 1) {
        const next = [];
        for (let i = 0; i < layer.length; i += 2) next.push(i + 1 < layer.length ? sha256(layer[i] + layer[i + 1]) : layer[i]);
        layer = next;
    }
    return layer[0];
}

describe('Merkle root topic order', () => {
    it('does not depend on the locale of the signer or the verifier', async () => {
        // Locale collation puts '_' before '-', and Danish sorts a leading 'aa' after 'z'.
        const topics = ['zebra', 'aarhus-port', 'a_b', 'a-b'];
        const env = makeEnv('production');
        env.ANCHOR_SIGNING_KEY = 'a'.repeat(64); // fixed test key, as in anchor.test.js
        // A self-generated DPoP key is an agent with 4 tokens a day: two questions.
        let author;
        for (const [i, topic] of topics.entries()) {
            if (i % 2 === 0) author = dpopIdentity();
            expect((await call(env, 'POST', '/api/contribute', { type: 'question', topic, payload: { body: `Question about ${topic}?` } }, author())).status).toBe(201);
        }

        const anchor = await handleScheduled(env);
        expect(anchor.chain_heads.map(head => head.topic).sort()).toEqual([...topics].sort());
        expect(anchor.merkle_root).toBe(codeUnitMerkleRoot(anchor.chain_heads));

        const { stdout: danishOrder } = await run(process.execPath, ['-e', "console.log(['zebra', 'aarhus-port'].sort((a, b) => a.localeCompare(b)).join())"], { env: DANISH });
        expect(danishOrder.trim()).toBe('zebra,aarhus-port');

        const dir = mkdtempSync(join(tmpdir(), 'acta-anchor-'));
        try {
            const file = join(dir, 'anchor.json');
            writeFileSync(file, JSON.stringify(anchor));
            const result = await run(process.execPath, [VERIFY, '--anchor', file, '--key', getAnchorPublicKey(env)], { env: DANISH })
                .then(({ stdout }) => ({ code: 0, stdout }), ({ code, stdout }) => ({ code, stdout }));
            expect(result.stdout).toContain('Anchor signature valid');
            expect(result.code).toBe(0);
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });
});
