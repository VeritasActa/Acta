import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import worker from '../src/index.js';
import release from '../public/release-manifest.json';
import { DOCUMENT_SOURCE_URLS } from '../src/protocol-identity.js';

const charter = readFileSync('docs/identity/v1.0.0/CHARTER.md', 'utf8');
// Old mutable caches must not override the protocol's archived edition.
const env = { ACTA_KV: { async get(key) { return key === 'charter:md' ? '# Stale cached document' : null; }, async put() {} } };
const request = (path, method = 'GET') => worker.fetch(new Request(`https://veritasacta.com${path}`, { method }), env, { waitUntil() {} });
describe('protocol website and shared verifier', () => {
  for (const path of ['/', '/about', '/docs', '/verify', '/integrate', '/specification', '/conformance', '/maintainers']) {
    it(`${path}: original navigation and current verifier release remain available`, async () => {
      const response = await request(path);
      expect(response.status).toBe(200);
      const html = await response.text();
      const nav = html.match(/<nav\b[^>]*>([\s\S]*?)<\/nav>/)?.[1];
      expect(nav).toBeDefined();
      for (const [label, href] of [['Home', '/'], ['Charter', '/about'], ['Public record', '/#topics'], ['Docs', '/docs'], ['Verify', '/verify'], ['Blog', '/blog']]) {
        expect(nav).toContain(`href="${href}"`);
        expect(nav).toContain(`>${label}</a>`);
      }
      expect(html).toContain(release.verifier.version);
      expect(html).not.toMatch(/-02 pending|0\.9\.6|no trust required/i);
      const head = await request(path, 'HEAD');
      expect(head.status).toBe(200);
      expect(await head.text()).toBe('');
    });
  }
  it('keeps all ten invariants and the full Charter link on the homepage', async () => {
    const html = await (await request('/')).text();
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
    expect(main).toContain('The charter: what the record is for');
    expect(main).toContain('Permanent Invariants');
    expect(main).toContain('href="/about">Read the full Charter</a>');
    for (const heading of [
      'Contributions are typed, each with an explicit burden',
      'Every object has authorship provenance and revision history',
      'Claims and decisions can be challenged',
      'No entity can dominate attention through scale',
      'Agents are disclosed delegates, not default peers',
      'The record maintains integrity',
      'Resolution and supersession are explicit',
      'No automated system exercises epistemic discretion',
      'Core procedures are public, versioned, and equally applied',
      'Verification and exit do not depend on operator permission',
    ]) expect(main).toContain(`>${heading}</div>`);
  });
  it('preserves the Charter document, published identity and original /about destination', async () => {
    expect(createHash('sha256').update(charter).digest('hex')).toBe('3a0f734d87d5d156e550df1361988c398190e72eea40144af8c28379ab5727d9');
    const html = await (await request('/about')).text();
    const headings = [...charter.matchAll(/^\*\*(\d+\. .+)\*\*$/gm)].map(match => match[1]);
    expect(headings).toHaveLength(10);
    for (const heading of headings) expect(html).toContain(`<strong>${heading}</strong>`);
    expect(html).not.toContain('Stale cached document');
    expect(html).toContain(DOCUMENT_SOURCE_URLS.charter);
    expect((html.match(/<h1\b/g) || [])).toHaveLength(1);
    const manifest = await (await request('/.well-known/acta-instance.json')).json();
    // The rendered edition and immutable source now match the historical pin.
    expect(manifest.charter_hash).toBe('3a0f734d87d5d156e550df1361988c398190e72eea40144af8c28379ab5727d9');
  });
  for (const [alias, canonical] of [['/charter', '/about'], ['/record/docs', '/docs'], ['/record', '/']]) {
    it(`${alias}: retains compatibility with ${canonical}`, async () => {
      const response = await request(alias);
      expect(response.status).toBe(200);
      expect(await response.text()).toBe(await (await request(canonical)).text());
    });
  }
  it('retains application documentation and replaces the fabricated verification demo', async () => {
    const html = await (await request('/docs')).text();
    for (const id of ['type-system', 'response-matrix', 'chain-integrity', 'api']) expect(html).toContain(`id="${id}"`);
    expect(html).toContain('href="/verify?sample=current"');
    expect(html).not.toContain('btn-tamper');
    expect(html).not.toContain('Signature verification FAILED. The receipt was modified.');
    expect(html).not.toContain('so it cannot be backdated');
  });
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
    const response = await request('/verify');
    const csp = response.headers.get('content-security-policy');
    for (const directive of ["script-src 'self'", "connect-src 'none'", "form-action 'none'", "base-uri 'none'", "frame-ancestors 'none'"]) expect(csp).toContain(directive);
    const html = await response.text();
    expect(html).toContain('id="result" class="va-result" hidden');
    expect(html.indexOf('id="result"')).toBeLessThan(html.indexOf('id="receipt-inputs"')); // Outcome precedes raw JSON in sample mode.
    expect(html).toContain('<script type="module" src="/assets/verifier-ui.js"></script>');
    expect(html).not.toMatch(/<script(?:\s[^>]*)?>\s*(?:const|let|var|function|document\.)/);
    expect(html).not.toContain('fonts.googleapis.com');
    expect(html).not.toContain('api.scopeblind.com/api/npm-stats');
  });
  it('offers the sample and Charter first, and keeps the public record addressable', async () => {
    const html = await (await request('/')).text();
    expect(html).toContain('href="/verify?sample=current" class="home-action"');
    expect(html).toContain('href="/about" class="home-action secondary"');
    expect(html).toContain('id="topics"');
    expect(html).toContain('href="/" aria-current="page"');
    expect(html).toContain('href="#main">Skip to content');
    expect(html).toContain('<main id="main"');
    expect(html).not.toContain('Maintained by <a');
  });
  it('knowledge-unit expiry and self-check limits are visible', async () => {
    expect(await (await request('/specification')).text()).toContain('expired 2026-10-08');
    expect(await (await request('/maintainers')).text()).toContain('does not by itself authenticate a publisher');
    expect(await (await request('/llms.txt')).text()).toContain(release.verifier.version);
  });
});
