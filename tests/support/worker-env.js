/**
 * In-memory stand-ins for the Worker's Cloudflare bindings, so tests can drive
 * the real request handlers: Durable Object namespaces whose storage copies
 * values with structuredClone (as the real storage does), and a KV namespace.
 *
 * Test files that post sources should stub fetch so nothing leaves the machine.
 */

import { generateKeyPairSync, sign } from 'node:crypto';
import worker, { LedgerChain, DeviceBudget } from '../../src/index.js';

class Storage {
    constructor() { this.values = new Map(); }
    async get(key) { return this.values.has(key) ? structuredClone(this.values.get(key)) : undefined; }
    async put(key, value) {
        if (typeof key === 'object') {
            for (const [k, v] of Object.entries(key)) this.values.set(k, structuredClone(v));
            return;
        }
        this.values.set(key, structuredClone(value));
    }
}

function namespace(DurableObject, env) {
    const instances = new Map();
    return {
        idFromName(name) { return name; },
        get(id) {
            if (!instances.has(id)) instances.set(id, new DurableObject({ storage: new Storage() }, env));
            const instance = instances.get(id);
            return { fetch: request => instance.fetch(request) };
        },
    };
}

class KV {
    constructor() { this.values = new Map(); }
    async get(key, options) {
        if (!this.values.has(key)) return null;
        const value = this.values.get(key);
        const type = typeof options === 'string' ? options : options?.type;
        return type === 'json' ? JSON.parse(value) : value;
    }
    async put(key, value) { this.values.set(key, String(value)); }
    async delete(key) { this.values.delete(key); }
    async list({ prefix = '' } = {}) {
        return { keys: [...this.values.keys()].filter(name => name.startsWith(prefix)).map(name => ({ name })) };
    }
}

export function makeEnv(ENVIRONMENT = 'production') {
    const env = { ENVIRONMENT, ACTA_KV: new KV() };
    env.LEDGER_CHAIN = namespace(LedgerChain, env);
    env.DEVICE_BUDGET = namespace(DeviceBudget, env);
    return env;
}

// Call the Worker and wait for its background work (KV replication).
export async function call(env, method, path, body, headers = {}) {
    const pending = [];
    const ctx = { waitUntil: promise => pending.push(promise) };
    const request = new Request(`https://acta.test${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const response = await worker.fetch(request, env, ctx);
    await Promise.allSettled(pending);
    const text = await response.text();
    let json;
    try { json = JSON.parse(text); } catch { json = text; }
    return { status: response.status, json };
}

// A participant identified by a self-generated DPoP key. Returns request
// headers carrying a fresh proof each time it is called.
export function dpopIdentity() {
    const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
    const jwk = publicKey.export({ format: 'jwk' });
    const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
    return () => {
        const input = `${encode({ typ: 'dpop+jwt', alg: 'ES256', jwk })}.${encode({ iat: Math.floor(Date.now() / 1000), jti: crypto.randomUUID() })}`;
        const signature = sign('sha256', Buffer.from(input), { key: privateKey, dsaEncoding: 'ieee-p1363' }).toString('base64url');
        return { DPoP: `${input}.${signature}` };
    };
}

// Answers every outbound request with 404 (source snapshots, JWKS lookups).
export const offlineFetch = async () => new Response('offline in tests', { status: 404 });
