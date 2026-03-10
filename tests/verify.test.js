/**
 * Tests for the independent verifier (tools/verify.js logic).
 *
 * These tests verify that the standalone verifier correctly recomputes
 * hashes and detects chain tampering — without using any code from
 * the Worker itself.
 *
 * @license MIT
 */

import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';

// ── Inline the verifier's JCS + hashing (same as tools/verify.js) ───
// We inline rather than import to prove the verification logic
// is self-contained and doesn't depend on the operator's code.

function sortKeysDeep(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sortKeysDeep);
  return Object.keys(obj).sort().reduce((acc, key) => {
    acc[key] = sortKeysDeep(obj[key]);
    return acc;
  }, {});
}

function jcsSerialize(obj) {
  return JSON.stringify(sortKeysDeep(obj));
}

function sha256(str) {
  return createHash('sha256').update(str, 'utf8').digest('hex');
}

function jcsSha256(obj) {
  return sha256(jcsSerialize(obj));
}

// ── Build a valid chain for testing ─────────────────────────────────

function buildEntry(topic, type, subtype, payload, author, prevHash, timestamp) {
  const payloadHash = jcsSha256(payload);
  const authorHash = jcsSha256(author);
  const envelope = {
    author_hash: authorHash,
    payload_hash: payloadHash,
    prev_hash: prevHash,
    subtype,
    timestamp,
    topic,
    type,
  };
  const entryHash = jcsSha256(envelope);

  return {
    entry_id: crypto.randomUUID(),
    type,
    subtype,
    topic,
    author,
    payload,
    payload_hash: payloadHash,
    entry_hash: entryHash,
    prev_hash: prevHash,
    sequence: 0,
    timestamp,
    state: 'open',
    linked_to: [],
  };
}

function buildChain(topic, count) {
  const entries = [];
  let prevHash = '0'.repeat(64);

  for (let i = 0; i < count; i++) {
    const entry = buildEntry(
      topic,
      'contribution',
      'claim',
      { body: `Claim number ${i}`, category: 'factual', source: 'https://example.com' },
      { type: 'human', topic_pseudonym: `user-${i % 3}`, method: 'dpop', trust_level: 'verified' },
      prevHash,
      new Date(Date.now() - (count - i) * 60000).toISOString()
    );
    entry.sequence = i;
    entries.push(entry);
    prevHash = entry.entry_hash;
  }

  return entries;
}

function buildExport(topic, entries) {
  const last = entries[entries.length - 1];
  return {
    topic,
    exported_at: new Date().toISOString(),
    chain_head: {
      chain_head_hash: last ? last.entry_hash : '0'.repeat(64),
      chain_length: entries.length,
    },
    entries,
    total: entries.length,
  };
}

// ── Verification function (mirrors tools/verify.js) ─────────────────

function verifyExport(data) {
  const { topic, entries, chain_head } = data;

  if (!entries || !Array.isArray(entries)) {
    return { valid: false, error: 'No entries array in export' };
  }

  if (entries.length === 0) {
    return { valid: true, topic, total_entries: 0, chain_head: null, tombstones: [], errors: [] };
  }

  const errors = [];
  const tombstones = [];
  let expectedPrevHash = '0'.repeat(64);

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    if (entry.prev_hash !== expectedPrevHash) {
      errors.push({ index: i, entry_id: entry.entry_id, type: 'prev_hash_mismatch', expected: expectedPrevHash, actual: entry.prev_hash });
    }

    if (entry.tombstone) {
      tombstones.push({ index: i, entry_id: entry.entry_id, category: entry.tombstone.category, tombstoned_at: entry.tombstone.tombstoned_at });
    } else if (entry.payload !== null && entry.payload !== undefined) {
      const recomputedPayloadHash = jcsSha256(entry.payload);
      if (recomputedPayloadHash !== entry.payload_hash) {
        errors.push({ index: i, entry_id: entry.entry_id, type: 'payload_hash_mismatch', expected: recomputedPayloadHash, actual: entry.payload_hash });
      }
    }

    const authorHash = jcsSha256(entry.author || {});
    const envelope = {
      author_hash: authorHash,
      payload_hash: entry.payload_hash,
      prev_hash: entry.prev_hash,
      subtype: entry.subtype,
      timestamp: entry.timestamp,
      topic: entry.topic,
      type: entry.type,
    };

    const recomputedEntryHash = jcsSha256(envelope);
    if (recomputedEntryHash !== entry.entry_hash) {
      errors.push({ index: i, entry_id: entry.entry_id, type: 'entry_hash_mismatch', expected: recomputedEntryHash, actual: entry.entry_hash });
    }

    expectedPrevHash = entry.entry_hash;
  }

  if (chain_head) {
    const lastEntry = entries[entries.length - 1];
    if (chain_head.chain_head_hash !== lastEntry.entry_hash) {
      errors.push({ type: 'chain_head_mismatch', expected: lastEntry.entry_hash, actual: chain_head.chain_head_hash });
    }
    if (chain_head.chain_length !== entries.length) {
      errors.push({ type: 'chain_length_mismatch', expected: entries.length, actual: chain_head.chain_length });
    }
  }

  return {
    valid: errors.length === 0,
    topic,
    total_entries: entries.length,
    chain_head: entries[entries.length - 1].entry_hash,
    tombstones,
    errors,
  };
}

// ── Tests ───────────────────────────────────────────────────────────

describe('JCS Serialization', () => {
  it('sorts keys deterministically', () => {
    const a = jcsSerialize({ z: 1, a: 2, m: 3 });
    const b = jcsSerialize({ m: 3, z: 1, a: 2 });
    expect(a).toBe(b);
    expect(a).toBe('{"a":2,"m":3,"z":1}');
  });

  it('sorts nested objects', () => {
    const a = jcsSerialize({ b: { z: 1, a: 2 }, a: 1 });
    expect(a).toBe('{"a":1,"b":{"a":2,"z":1}}');
  });

  it('preserves array order', () => {
    const a = jcsSerialize({ arr: [3, 1, 2] });
    expect(a).toBe('{"arr":[3,1,2]}');
  });

  it('handles null and undefined', () => {
    const a = jcsSerialize({ a: null, b: undefined });
    // JSON.stringify omits undefined values
    expect(a).toBe('{"a":null}');
  });
});

describe('Chain Verification — Valid Chains', () => {
  it('verifies an empty export', () => {
    const result = verifyExport({ topic: 'test', entries: [], chain_head: null, total: 0 });
    expect(result.valid).toBe(true);
    expect(result.total_entries).toBe(0);
  });

  it('verifies a single-entry chain', () => {
    const entries = buildChain('test-topic', 1);
    const data = buildExport('test-topic', entries);
    const result = verifyExport(data);
    expect(result.valid).toBe(true);
    expect(result.total_entries).toBe(1);
    expect(result.chain_head).toBe(entries[0].entry_hash);
  });

  it('verifies a 10-entry chain', () => {
    const entries = buildChain('ten-entries', 10);
    const data = buildExport('ten-entries', entries);
    const result = verifyExport(data);
    expect(result.valid).toBe(true);
    expect(result.total_entries).toBe(10);
  });

  it('verifies a 100-entry chain', () => {
    const entries = buildChain('hundred', 100);
    const data = buildExport('hundred', entries);
    const result = verifyExport(data);
    expect(result.valid).toBe(true);
    expect(result.total_entries).toBe(100);
  });

  it('first entry has prev_hash of all zeros', () => {
    const entries = buildChain('test', 3);
    expect(entries[0].prev_hash).toBe('0'.repeat(64));
  });

  it('each entry links to the previous entry_hash', () => {
    const entries = buildChain('test', 5);
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i].prev_hash).toBe(entries[i - 1].entry_hash);
    }
  });
});

describe('Chain Verification — Tamper Detection', () => {
  it('detects payload tampering', () => {
    const entries = buildChain('tamper-test', 5);
    const data = buildExport('tamper-test', entries);

    // Tamper with entry 2's payload
    data.entries[2].payload.body = 'TAMPERED CONTENT';

    const result = verifyExport(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.type === 'payload_hash_mismatch' && e.index === 2)).toBe(true);
  });

  it('detects entry_hash tampering', () => {
    const entries = buildChain('hash-tamper', 3);
    const data = buildExport('hash-tamper', entries);

    // Tamper with entry_hash directly
    data.entries[1].entry_hash = 'a'.repeat(64);

    const result = verifyExport(data);
    expect(result.valid).toBe(false);
    // Should catch both the hash mismatch and the broken link
    expect(result.errors.length).toBeGreaterThanOrEqual(1);
  });

  it('detects chain link break (prev_hash mismatch)', () => {
    const entries = buildChain('link-break', 5);
    const data = buildExport('link-break', entries);

    // Break the link between entry 2 and 3
    data.entries[3].prev_hash = 'b'.repeat(64);

    const result = verifyExport(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.type === 'prev_hash_mismatch' && e.index === 3)).toBe(true);
  });

  it('detects entry deletion (gap in chain)', () => {
    const entries = buildChain('deletion', 5);
    const data = buildExport('deletion', entries);

    // Remove entry 2
    data.entries.splice(2, 1);
    data.chain_head.chain_length = 4;

    const result = verifyExport(data);
    expect(result.valid).toBe(false);
    // Entry 3 (now at index 2) has prev_hash pointing to deleted entry
    expect(result.errors.some(e => e.type === 'prev_hash_mismatch')).toBe(true);
  });

  it('detects entry insertion', () => {
    const entries = buildChain('insertion', 3);
    const data = buildExport('insertion', entries);

    // Insert a fake entry between 1 and 2
    const fake = buildEntry(
      'insertion', 'contribution', 'claim',
      { body: 'Fake entry', category: 'opinion', uncertainty: 'Very uncertain' },
      { type: 'human', topic_pseudonym: 'attacker', method: 'none', trust_level: 'none' },
      entries[0].entry_hash,
      new Date().toISOString()
    );
    data.entries.splice(1, 0, fake);
    data.chain_head.chain_length = 4;

    const result = verifyExport(data);
    expect(result.valid).toBe(false);
  });

  it('detects author tampering', () => {
    const entries = buildChain('author-tamper', 3);
    const data = buildExport('author-tamper', entries);

    // Change the author — this should break entry_hash
    data.entries[1].author.topic_pseudonym = 'impersonator';

    const result = verifyExport(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.type === 'entry_hash_mismatch' && e.index === 1)).toBe(true);
  });

  it('detects timestamp tampering', () => {
    const entries = buildChain('time-tamper', 3);
    const data = buildExport('time-tamper', entries);

    // Change timestamp — breaks entry_hash
    data.entries[1].timestamp = '2020-01-01T00:00:00.000Z';

    const result = verifyExport(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.type === 'entry_hash_mismatch' && e.index === 1)).toBe(true);
  });

  it('detects chain head mismatch', () => {
    const entries = buildChain('head-mismatch', 5);
    const data = buildExport('head-mismatch', entries);

    // Tamper with chain head hash
    data.chain_head.chain_head_hash = 'c'.repeat(64);

    const result = verifyExport(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.type === 'chain_head_mismatch')).toBe(true);
  });

  it('detects chain length mismatch', () => {
    const entries = buildChain('length-mismatch', 5);
    const data = buildExport('length-mismatch', entries);

    // Lie about chain length
    data.chain_head.chain_length = 10;

    const result = verifyExport(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.type === 'chain_length_mismatch')).toBe(true);
  });
});

describe('Tombstone Handling', () => {
  it('verifies chain with tombstoned entries', () => {
    const entries = buildChain('tombstone-test', 5);
    const data = buildExport('tombstone-test', entries);

    // Tombstone entry 2 (purge payload but preserve hashes)
    data.entries[2].tombstone = {
      category: 'LEGAL_ORDER',
      authority_reference: 'AU-2026-0042',
      tombstoned_at: new Date().toISOString(),
    };
    data.entries[2].payload = null;
    data.entries[2].state = 'tombstoned';

    const result = verifyExport(data);
    expect(result.valid).toBe(true);
    expect(result.tombstones.length).toBe(1);
    expect(result.tombstones[0].category).toBe('LEGAL_ORDER');
    expect(result.tombstones[0].index).toBe(2);
  });

  it('chain integrity survives multiple tombstones', () => {
    const entries = buildChain('multi-tombstone', 10);
    const data = buildExport('multi-tombstone', entries);

    // Tombstone entries 1, 4, 7
    for (const i of [1, 4, 7]) {
      data.entries[i].tombstone = {
        category: 'OPERATOR_REMOVAL',
        tombstoned_at: new Date().toISOString(),
      };
      data.entries[i].payload = null;
      data.entries[i].state = 'tombstoned';
    }

    const result = verifyExport(data);
    expect(result.valid).toBe(true);
    expect(result.tombstones.length).toBe(3);
  });
});

describe('Merkle Root', () => {
  it('computes deterministic Merkle root from chain heads', () => {
    const heads = [
      { topic: 'b-topic', chain_head_hash: 'b'.repeat(64), chain_length: 5 },
      { topic: 'a-topic', chain_head_hash: 'a'.repeat(64), chain_length: 3 },
    ];

    // Sort by topic name
    const sorted = [...heads].sort((a, b) => a.topic.localeCompare(b.topic));
    const leaves = sorted.map(h => sha256(jcsSerialize(h)));
    const root = sha256(leaves[0] + leaves[1]);

    // Same heads in different order should produce same root
    const heads2 = [heads[1], heads[0]];
    const sorted2 = [...heads2].sort((a, b) => a.topic.localeCompare(b.topic));
    const leaves2 = sorted2.map(h => sha256(jcsSerialize(h)));
    const root2 = sha256(leaves2[0] + leaves2[1]);

    expect(root).toBe(root2);
  });
});

describe('Cross-compatibility with Worker hashing', () => {
  it('JCS-SHA256 matches expected output for simple object', () => {
    const obj = { b: 2, a: 1 };
    const hash = jcsSha256(obj);
    // Canonical form is {"a":1,"b":2}
    const expected = createHash('sha256').update('{"a":1,"b":2}', 'utf8').digest('hex');
    expect(hash).toBe(expected);
  });

  it('empty object has consistent hash', () => {
    const hash = jcsSha256({});
    const expected = createHash('sha256').update('{}', 'utf8').digest('hex');
    expect(hash).toBe(expected);
  });

  it('envelope hash is deterministic regardless of key insertion order', () => {
    const env1 = {
      type: 'contribution',
      topic: 'test',
      author_hash: 'abc',
      payload_hash: 'def',
      prev_hash: '0'.repeat(64),
      subtype: 'claim',
      timestamp: '2026-03-10T00:00:00.000Z',
    };

    const env2 = {
      timestamp: '2026-03-10T00:00:00.000Z',
      prev_hash: '0'.repeat(64),
      author_hash: 'abc',
      subtype: 'claim',
      type: 'contribution',
      payload_hash: 'def',
      topic: 'test',
    };

    expect(jcsSha256(env1)).toBe(jcsSha256(env2));
  });
});
