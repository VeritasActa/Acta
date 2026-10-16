import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { DOCUMENT_REVISION, DOCUMENT_URLS, DOCUMENT_SOURCE_URLS, IDENTITY_DOCUMENTS, PROTOCOL_IDENTITY, INSTANCE_POLICY } from '../src/protocol-identity.js';
import { checkProtocolIdentity, verifyIdentityDocumentBytes } from '../tools/check-protocol-identity.js';

describe('published protocol identity', () => {
    it('retains the historical identity and policy fingerprints', () => {
        expect(PROTOCOL_IDENTITY).toEqual({
            charter_hash: '3a0f734d87d5d156e550df1361988c398190e72eea40144af8c28379ab5727d9',
            protocol_spec_hash: 'd1f90577539dcc127a154f65e9777641499437c1e483ee3729a0eb23d182d82f',
            protocol_version: '1.0.0',
        });
        expect(INSTANCE_POLICY.policy_hash).toBe('3f1e0734c11413a16251572270c9a2d726f82e080cbbf094109a8cbd2011a293');
    });

    it('recovers exact archived bytes for all three published hashes', async () => {
        const results = await checkProtocolIdentity();
        expect(results.map(result => result.name)).toEqual(['charter', 'protocol_spec', 'policy']);
        for (const result of results) expect(result.sha256).toBe(IDENTITY_DOCUMENTS[result.name].sha256);
    });

    it('links raw bytes and human-readable sources at one immutable commit', () => {
        expect(DOCUMENT_REVISION).toMatch(/^[a-f0-9]{40}$/);
        for (const name of Object.keys(IDENTITY_DOCUMENTS)) {
            expect(DOCUMENT_URLS[name]).toContain(`https://raw.githubusercontent.com/VeritasActa/Acta/${DOCUMENT_REVISION}/`);
            expect(DOCUMENT_SOURCE_URLS[name]).toContain(`https://github.com/VeritasActa/Acta/blob/${DOCUMENT_REVISION}/`);
            expect(DOCUMENT_URLS[name]).not.toContain('/main/');
        }
    });

    it('fails on an editorial byte change rather than silently replacing the identity', () => {
        const original = readFileSync(IDENTITY_DOCUMENTS.charter.archive);
        expect(() => verifyIdentityDocumentBytes('charter', Buffer.concat([original, Buffer.from('\n')]))).toThrow('SHA-256 mismatch');
        expect(() => verifyIdentityDocumentBytes('charter', readFileSync('CHARTER.md'))).toThrow('SHA-256 mismatch');
    });

    it('checks each published URL against its pinned document bytes', async () => {
        const requested = [];
        const fetchImpl = async (url, options) => {
            requested.push(url);
            expect(options.redirect).toBe('error');
            const name = Object.keys(DOCUMENT_URLS).find(key => DOCUMENT_URLS[key] === url);
            return new Response(readFileSync(IDENTITY_DOCUMENTS[name].archive));
        };
        const results = await checkProtocolIdentity({ remote: true, fetchImpl });
        expect(requested).toEqual(Object.values(DOCUMENT_URLS));
        expect(results.every(result => result.remote)).toBe(true);
    });

    it('fails on unavailable or modified remote documents', async () => {
        await expect(checkProtocolIdentity({ remote: true, fetchImpl: async () => new Response('', { status: 404 }) })).rejects.toThrow('HTTP 404');
        await expect(checkProtocolIdentity({ remote: true, fetchImpl: async () => new Response('changed') })).rejects.toThrow('SHA-256 mismatch');
    });
});
