#!/usr/bin/env node
/** Check exact historical identity bytes locally and, optionally, at published URLs. */
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOCUMENT_URLS, IDENTITY_DOCUMENTS } from '../src/protocol-identity.js';

const repositoryRoot = new URL('../', import.meta.url);

export function verifyIdentityDocumentBytes(name, bytes) {
    const document = IDENTITY_DOCUMENTS[name];
    if (!document) throw new Error(`Unknown identity document: ${name}`);
    const actual = createHash('sha256').update(bytes).digest('hex');
    if (actual !== document.sha256) {
        throw new Error(`${name}: SHA-256 mismatch (expected ${document.sha256}, received ${actual}). Preserve the published identity; do not regenerate its hashes to make this check pass.`);
    }
    return actual;
}

export async function checkProtocolIdentity({ remote = false, fetchImpl = globalThis.fetch } = {}) {
    const results = [];
    for (const [name, document] of Object.entries(IDENTITY_DOCUMENTS)) {
        const local = await readFile(new URL(document.archive, repositoryRoot));
        const sha256 = verifyIdentityDocumentBytes(name, local);
        if (remote) {
            const response = await fetchImpl(DOCUMENT_URLS[name], {
                signal: AbortSignal.timeout(15000),
                redirect: 'error',
            });
            if (!response.ok) throw new Error(`${name}: immutable source returned HTTP ${response.status}`);
            verifyIdentityDocumentBytes(name, new Uint8Array(await response.arrayBuffer()));
        }
        results.push({ name, sha256, archive: document.archive, url: DOCUMENT_URLS[name], remote });
    }
    return results;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const flags = process.argv.slice(2);
    if (flags.some(flag => flag !== '--remote')) {
        console.error('Usage: node tools/check-protocol-identity.js [--remote]');
        process.exitCode = 1;
    } else {
        try {
            const results = await checkProtocolIdentity({ remote: flags.includes('--remote') });
            for (const result of results) console.log(`${result.name}: SHA-256 matches archived${result.remote ? ' and immutable remote' : ''} bytes (${result.sha256})`);
        } catch (error) {
            console.error(error.message);
            process.exitCode = 1;
        }
    }
}
