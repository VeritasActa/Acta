import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import worker from '../src/index.js';
import release from '../public/release-manifest.json';

const request = (path, method = 'GET') => worker.fetch(new Request(`https://veritasacta.com${path}`, { method }), {}, { waitUntil() {} });
describe('protocol website and shared verifier', () => {
  for (const path of ['/', '/verify', '/docs', '/specification', '/conformance', '/about']) {
    it(`${path}: shared navigation, explicit version and network boundary`, async () => {
      const response = await request(path);
      expect(response.status).toBe(200);
      expect(response.headers.get('content-security-policy')).toContain("connect-src 'none'");
      expect(response.headers.get('content-security-policy')).toContain("form-action 'none'");
      const html = await response.text();
      for (const label of ['Verify', 'Integrate', 'Specification', 'Conformance', 'About']) expect(html).toContain(`>${label}</a>`);
      expect(html).toContain(release.verifier.version);
      expect(html).not.toMatch(/-02 pending|0\.9\.6|no trust required/i);
      expect((await request(path, 'HEAD')).status).toBe(200);
    });
  }
  it('serves the exact fingerprinted browser artifact with the release', async () => {
    const bytes = await (await request('/assets/receipt-verifier.js')).text();
    const build = await (await request('/assets/browser-build.json')).json();
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(build.sha256);
    expect(build.version).toBe(release.verifier.version);
    expect(await (await request('/.well-known/veritasacta-release.json')).json()).toEqual(release);
  });
  it('bundled current fixture verifies and mutation/missing/wrong key do not', async () => {
    const bundle = await (await request('/assets/receipt-verifier.js')).text();
    const { verifyReceiptText } = await import(`data:text/javascript;base64,${Buffer.from(bundle).toString('base64')}`);
    const text = await (await request('/samples/current-receipt.json')).text();
    const key = await (await request('/samples/current-receipt-key.txt')).text();
    expect((await verifyReceiptText(text, key)).status).toBe('valid');
    expect((await verifyReceiptText(text)).status).toBe('not_checked');
    expect((await verifyReceiptText(text, '11'.repeat(32))).status).toBe('invalid');
    const changed = JSON.parse(text); changed.payload.decision = 'mutated';
    expect((await verifyReceiptText(JSON.stringify(changed), key)).status).toBe('invalid');
    expect((await verifyReceiptText('{"unknown":true}', key)).status).toBe('not_checked');
  });
  it('verifier UI has no network API, adopted embedded key or unsafe output injection', async () => {
    const script = await (await request('/assets/verifier-ui.js')).text();
    expect(script).not.toMatch(/fetch\(|XMLHttpRequest|WebSocket|sendBeacon|innerHTML|localStorage/);
    expect(script).toContain('revision !== current');
    expect(script).toContain("if (sampleMode) $('public-key').value = ''");
    const html = await (await request('/verify')).text();
    expect(html).not.toContain('Sample result'); // sample result is rendered only after checking
  });
  it('application remains separate and its charter is unchanged', async () => {
    expect((await request('/charter')).status).toBe(200);
    expect((await request('/record/docs')).status).toBe(200);
    expect(await (await request('/record')).text()).toContain('Acta public record');
    expect(readFileSync('CHARTER.md', 'utf8')).toContain('Acta');
  });
  it('knowledge-unit expiry and self-check limits are visible', async () => {
    expect(await (await request('/specification')).text()).toContain('expired 2026-10-08');
    expect(await (await request('/about')).text()).toContain('does not by itself authenticate a publisher');
    expect(await (await request('/llms.txt')).text()).toContain(release.verifier.version);
  });
});
