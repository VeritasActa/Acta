import { describe, expect, it } from 'vitest';
import { access } from 'node:fs/promises';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { generateKeyPairSync, sign } from 'node:crypto';
import { renderHTML } from '../src/ui.js';
import { resolveIdentity } from '../src/identity.js';
import { validateContribution } from '../src/validators/schema.js';

const run = promisify(execFile);
const html = renderHTML('docs');
const snippet = id => {
  const content = html.match(new RegExp(`<pre id="${id}"[^>]*>([\\s\\S]*?)</pre>`))?.[1];
  if (!content) throw new Error(`Missing documentation example: ${id}`);
  return content.replace(/<[^>]*>/g, '').replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>');
};

describe('published documentation examples', () => {
  it('only names local scripts that ship in the repository', async () => {
    const docs = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)[1];
    const scripts = [...new Set(docs.match(/tools\/[\w-]+\.js/g))];
    expect(scripts.length).toBeGreaterThan(0);
    for (const script of scripts) await access(script);
    expect(snippet('docs-readonly-quickstart')).toContain('npm ci');
  });

  it('stops the anchor example before network access when no trusted key is provided', async () => {
    const env = { ...process.env };
    delete env.ACTA_ISSUER_KEY;
    await expect(run('bash', ['-e', '-c', snippet('docs-anchor-quickstart')], { env }))
      .rejects.toMatchObject({ code: 1, stderr: expect.stringContaining('Set an independently obtained issuer public key') });
  });

  it('stops the publishing example unless both an instance and identity are explicitly set', async () => {
    const env = { ...process.env };
    delete env.ACTA_INSTANCE_URL;
    delete env.ACTA_DPOP_PROOF;
    const command = snippet('docs-contribution-example');
    await expect(run('bash', ['-e', '-c', command], { env }))
      .rejects.toMatchObject({ code: 1, stderr: expect.stringContaining('Set the instance you intend to publish to') });
    env.ACTA_INSTANCE_URL = 'http://127.0.0.1:1';
    await expect(run('bash', ['-e', '-c', command], { env }))
      .rejects.toMatchObject({ code: 1, stderr: expect.stringContaining('Set a fresh DPoP identity proof') });
  });

  it('sends an accepted identity and valid payload when the documented publishing command is configured', async () => {
    let received;
    const server = createServer(async (request, response) => {
      let body = '';
      for await (const chunk of request) body += chunk;
      received = { method: request.method, path: request.url, headers: request.headers, body };
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end('{"test_only":true}');
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
      const instance = `http://127.0.0.1:${server.address().port}`;
      const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
      const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
      const signingInput = `${encode({ typ: 'dpop+jwt', alg: 'ES256', jwk: publicKey.export({ format: 'jwk' }) })}.${encode({ iat: Math.floor(Date.now() / 1000), htm: 'POST', htu: `${instance}/api/contribute`, jti: crypto.randomUUID() })}`;
      const proof = `${signingInput}.${sign('sha256', Buffer.from(signingInput), { key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`;
      await run('bash', ['-e', '-c', snippet('docs-contribution-example')], {
        env: { ...process.env, ACTA_INSTANCE_URL: instance, ACTA_DPOP_PROOF: proof },
      });
      expect(received.method).toBe('POST');
      expect(received.path).toBe('/api/contribute');
      const contribution = JSON.parse(received.body);
      expect(validateContribution(contribution.type, contribution.payload).valid).toBe(true);
      const identity = await resolveIdentity(new Request(`${instance}/api/contribute`, { method: 'POST', headers: received.headers, body: received.body }), {}, contribution.topic);
      expect(identity).toMatchObject({ type: 'agent', method: 'dpop', trust_level: 'cryptographic' });
    } finally {
      await new Promise(resolve => server.close(resolve));
    }
  });
});
