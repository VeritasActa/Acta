import { describe, expect, it } from 'vitest';
import worker from '../src/index.js';

// Minimal bindings: the pages under test render without KV or Durable Objects.
const env = {};
const ctx = { waitUntil() {} };

describe('HEAD requests', () => {
  it('answers HEAD like GET, without a body', async () => {
    for (const path of ['/', '/llms.txt', '/about']) {
      const get = await worker.fetch(new Request(`https://veritasacta.com${path}`), env, ctx);
      const head = await worker.fetch(new Request(`https://veritasacta.com${path}`, { method: 'HEAD' }), env, ctx);
      expect(head.status).toBe(get.status);
      expect(head.headers.get('content-type')).toBe(get.headers.get('content-type'));
      expect(await head.text()).toBe('');
    }
  });
});
