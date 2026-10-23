import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import worker from '../src/index.js';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

describe('licence notices', () => {
    it('source headers name the repository licence', () => {
        expect(pkg.license).toBe('Apache-2.0');
        for (const file of ['src/chain-publication.js', 'src/protocol-identity.js', 'tools/verify.js', 'tests/anchor.test.js', 'tests/verify.test.js']) {
            const source = readFileSync(file, 'utf8');
            expect(source, file).toContain('SPDX-License-Identifier: Apache-2.0');
            expect(source, file).not.toContain('@license MIT');
        }
    });

    it('the /ontology page names the repository licence', async () => {
        const response = await worker.fetch(new Request('https://veritasacta.com/ontology'), {}, { waitUntil() {} });
        const html = await response.text();
        expect(html).toContain('@veritasacta/protocol</a> · Apache-2.0');
        expect(html).not.toContain('MIT License');
    });
});
