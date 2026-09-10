/**
 * LedgerChain Durable Object
 *
 * Maintains a hash-chained, append-only ledger for a single topic.
 * One DO instance per topic ensures strict linear ordering within topics
 * while allowing parallel writes across topics.
 *
 * Hash architecture (from adversarial analysis):
 *   payload_hash  = JCS-SHA256(payload)       : content identity
 *   entry_hash    = JCS-SHA256(envelope)       : chain linkage
 *   envelope      = { prev_hash, timestamp, topic, type, subtype, author_hash, payload_hash }
 *
 *   On tombstone: payload is purged, but payload_hash and entry_hash are preserved.
 *   Chain verification always uses payload_hash, never recomputes from payload.
 *
 * Storage layout:
 *   prev_hash     → SHA-256 hex of the last entry
 *   chain_length  → integer count
 *   entry:{id}    → full entry object
 *   entries_list  → ordered array of entry IDs
 */
export class LedgerChain {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/append') {
      return this.handleAppend(request);
    }

    if (request.method === 'GET' && url.pathname === '/entries') {
      return this.handleGetEntries(url);
    }

    if (request.method === 'GET' && url.pathname === '/verify') {
      return this.handleVerifyChain();
    }

    if (request.method === 'GET' && url.pathname === '/chain-head') {
      return this.handleChainHead();
    }

    if (request.method === 'POST' && url.pathname === '/tombstone') {
      return this.handleTombstone(request);
    }

    return new Response('Not found', { status: 404 });
  }

  /**
   * Append a new entry to the hash chain.
   * The entry must already be validated (schema check happens in the Worker).
   *
   * Dual-hash architecture:
   *   1. payload_hash = JCS-SHA256(payload)
   *   2. entry_hash = JCS-SHA256({ prev_hash, timestamp, topic, type, subtype, author_hash, payload_hash })
   *   3. Chain links via entry_hash → next entry's prev_hash
   */
  async handleAppend(request) {
    const entry = await request.json();

    const prevHash = (await this.state.storage.get('prev_hash')) || '0'.repeat(64);
    const chainLength = (await this.state.storage.get('chain_length')) || 0;
    const timestamp = new Date().toISOString();

    // Dual-hash: compute payload_hash separately from entry_hash
    const payloadHash = await this.jcsSha256(entry.payload || {});

    // Author hash for the envelope (not the full author object)
    const authorHash = await this.jcsSha256(entry.author || {});

    // Envelope: the chain-critical fields (NOT the full entry)
    const envelope = {
      author_hash: authorHash,
      payload_hash: payloadHash,
      prev_hash: prevHash,
      subtype: entry.subtype,
      timestamp,
      topic: entry.topic,
      type: entry.type,
    };

    const entryHash = await this.jcsSha256(envelope);

    const fullEntry = {
      ...entry,
      entry_id: crypto.randomUUID(),
      prev_hash: prevHash,
      payload_hash: payloadHash,
      entry_hash: entryHash,
      sequence: chainLength,
      timestamp,
    };

    // Atomic write: entry + prev_hash + chain_length + entries_list update
    const entriesList = (await this.state.storage.get('entries_list')) || [];
    entriesList.push(fullEntry.entry_id);

    await this.state.storage.put({
      [`entry:${fullEntry.entry_id}`]: fullEntry,
      prev_hash: entryHash,
      chain_length: chainLength + 1,
      entries_list: entriesList,
    });

    return Response.json({
      entry_id: fullEntry.entry_id,
      entry_hash: entryHash,
      payload_hash: payloadHash,
      sequence: fullEntry.sequence,
      prev_hash: prevHash,
    });
  }

  /**
   * Get entries with pagination.
   * ?offset=0&limit=20&order=desc
   */
  async handleGetEntries(url) {
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 200);
    const order = url.searchParams.get('order') || 'desc';

    const entriesList = (await this.state.storage.get('entries_list')) || [];
    const chainLength = entriesList.length;

    let slice;
    if (order === 'desc') {
      const start = Math.max(0, chainLength - offset - limit);
      const end = chainLength - offset;
      slice = entriesList.slice(start, end).reverse();
    } else {
      slice = entriesList.slice(offset, offset + limit);
    }

    const entries = [];
    for (const id of slice) {
      const entry = await this.state.storage.get(`entry:${id}`);
      if (entry) entries.push(entry);
    }

    return Response.json({
      entries,
      total: chainLength,
      offset,
      limit,
      has_more: offset + limit < chainLength,
    });
  }

  /**
   * Verify the entire hash chain is intact.
   * Uses the dual-hash architecture: recomputes entry_hash from stored
   * payload_hash (never from payload directly), so verification works
   * even after tombstoning.
   */
  async handleVerifyChain() {
    const entriesList = (await this.state.storage.get('entries_list')) || [];
    let expectedPrevHash = '0'.repeat(64);

    for (let i = 0; i < entriesList.length; i++) {
      const entry = await this.state.storage.get(`entry:${entriesList[i]}`);
      if (!entry) {
        return Response.json({ valid: false, broken_at: i, reason: 'missing_entry' });
      }

      if (entry.prev_hash !== expectedPrevHash) {
        return Response.json({
          valid: false,
          broken_at: i,
          reason: 'prev_hash_mismatch',
          expected: expectedPrevHash,
          actual: entry.prev_hash,
        });
      }

      // Recompute entry_hash from the envelope (using stored payload_hash, NOT payload)
      const authorHash = await this.jcsSha256(entry.author || {});
      const envelope = {
        author_hash: authorHash,
        payload_hash: entry.payload_hash,
        prev_hash: entry.prev_hash,
        subtype: entry.subtype,
        timestamp: entry.timestamp,
        topic: entry.topic,
        type: entry.type,
      };

      const recomputed = await this.jcsSha256(envelope);
      if (recomputed !== entry.entry_hash) {
        return Response.json({
          valid: false,
          broken_at: i,
          reason: 'entry_hash_mismatch',
          expected: recomputed,
          actual: entry.entry_hash,
        });
      }

      expectedPrevHash = entry.entry_hash;
    }

    return Response.json({ valid: true, length: entriesList.length });
  }

  /**
   * Return chain head metadata for external anchoring.
   */
  async handleChainHead() {
    const chainLength = (await this.state.storage.get('chain_length')) || 0;
    const prevHash = (await this.state.storage.get('prev_hash')) || '0'.repeat(64);

    // Get timestamp of last entry
    const entriesList = (await this.state.storage.get('entries_list')) || [];
    let lastEntryAt = null;
    if (entriesList.length > 0) {
      const lastEntry = await this.state.storage.get(`entry:${entriesList[entriesList.length - 1]}`);
      lastEntryAt = lastEntry?.timestamp || null;
    }

    return Response.json({
      chain_head_hash: prevHash,
      chain_length: chainLength,
      last_entry_at: lastEntryAt,
    });
  }

  /**
   * Tombstone an entry: purge payload, preserve hash chain integrity.
   * The dual-hash architecture means tombstoning NEVER breaks the chain:
   * payload is deleted but payload_hash and entry_hash are preserved.
   */
  async handleTombstone(request) {
    const { entry_id, category, authority_reference } = await request.json();

    const entry = await this.state.storage.get(`entry:${entry_id}`);
    if (!entry) {
      return Response.json({ error: 'entry_not_found' }, { status: 404 });
    }

    if (entry.tombstone) {
      return Response.json({ error: 'already_tombstoned' }, { status: 409 });
    }

    // Preserve chain integrity: payload_hash and entry_hash unchanged
    const tombstoned = {
      entry_id: entry.entry_id,
      prev_hash: entry.prev_hash,
      payload_hash: entry.payload_hash,  // Preserved: chain integrity intact
      entry_hash: entry.entry_hash,      // Preserved: chain linkage intact
      sequence: entry.sequence,
      timestamp: entry.timestamp,
      tombstone: {
        category, // CSAM_REMOVAL | LEGAL_ORDER | OPERATOR_REMOVAL
        authority_reference,
        tombstoned_at: new Date().toISOString(),
      },
      payload: null,  // Content purged
      type: entry.type,
      subtype: entry.subtype,
      topic: entry.topic,
      author: entry.author,
      state: 'tombstoned',
      linked_to: entry.linked_to,
    };

    await this.state.storage.put(`entry:${entry_id}`, tombstoned);

    return Response.json({ status: 'tombstoned', entry_id });
  }

  // ── JCS (RFC 8785) Canonicalization + SHA-256 ─────────────────────

  /**
   * Compute SHA-256 of a JCS-canonicalized (RFC 8785) JSON object.
   * JCS: deterministic serialization with recursively sorted keys.
   */
  async jcsSha256(obj) {
    const canonical = jcsSerialize(obj);
    const buffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(canonical)
    );
    return [...new Uint8Array(buffer)]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

// ── JCS Serialization (exported for use in other modules) ───────────

/**
 * RFC 8785 JSON Canonicalization Scheme.
 * Recursively sorts object keys. Arrays preserve order.
 * Numbers and strings use default JSON.stringify behavior (which is
 * IEEE 754 compliant per ECMA-262, satisfying JCS requirements).
 */
export function jcsSerialize(obj) {
  return JSON.stringify(sortKeysDeep(obj));
}

function sortKeysDeep(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => sortKeysDeep(item));
  return Object.keys(obj).sort().reduce((acc, key) => {
    acc[key] = sortKeysDeep(obj[key]);
    return acc;
  }, {});
}
