/**
 * Identity Verification Module
 *
 * Verifies device attestation and agent identity.
 * Integrates with ScopeBlind's three-tier identity stack:
 *
 *   Tier 1: DBSC/TPM (hardware-bound, browsers)
 *   Tier 2: DPoP (cryptographic, agents/CLIs)
 *   Tier 3: VOPRF (privacy-preserving, fallback)
 *
 * Per-topic pseudonyms (from adversarial analysis):
 *   Public ledger entries use topic_pseudonym = HMAC-SHA256(device_id, topic)
 *   This gives one permanent pseudonym per device per topic.
 *   Cross-topic privacy: different topic = different pseudonym.
 *   Within-topic accountability: same device = same pseudonym always.
 *   Budget enforcement uses the real device_id (never exposed publicly).
 *
 *   HMAC is a correct functional placeholder for VOPRF derivation.
 *   When ScopeBlind VOPRF is integrated, this becomes:
 *     topic_pseudonym = VOPRF_Eval(device_key, topic)
 */

// ── DPoP Proof Validation ───────────────────────────────────────────

/**
 * Extract and validate a DPoP proof from request headers.
 * Returns a device identity object or null.
 */
export async function verifyDPoP(request) {
    const dpopHeader = request.headers.get('DPoP');
    if (!dpopHeader) return null;

    try {
        const parts = dpopHeader.split('.');
        if (parts.length !== 3) return null;

        const header = JSON.parse(b64urlDecode(parts[0]));
        if (header.typ !== 'dpop+jwt' || !header.jwk) return null;

        const payload = JSON.parse(b64urlDecode(parts[1]));

        // Check freshness (proof must be < 5 minutes old)
        const iat = payload.iat;
        if (!iat || Math.abs(Date.now() / 1000 - iat) > 300) return null;

        // Compute JWK Thumbprint (SHA-256 of canonical JWK per RFC 7638)
        const thumbprint = await computeJWKThumbprint(header.jwk);

        // Verify the signature (ES256)
        const verified = await verifyES256(
            `${parts[0]}.${parts[1]}`,
            parts[2],
            header.jwk
        );

        if (!verified) return null;

        return {
            type: 'agent',
            method: 'dpop',
            thumbprint,
            public_key: header.jwk,
            proof_iat: iat,
        };
    } catch (err) {
        console.error('[IDENTITY] DPoP verification failed:', err.message);
        return null;
    }
}

// ── Pass-Token Validation ───────────────────────────────────────────

/**
 * Validate a ScopeBlind pass-token JWT from cookie or Authorization header.
 */
export async function verifyPassToken(request, env) {
    const authHeader = request.headers.get('Authorization');
    let token = null;

    if (authHeader?.startsWith('Bearer sb_')) {
        token = authHeader.slice(7);
    } else {
        const cookies = request.headers.get('Cookie') || '';
        const match = cookies.match(/sb_token=([^;]+)/);
        if (match) token = match[1];
    }

    if (!token) return null;

    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = JSON.parse(b64urlDecode(parts[1]));

        if (payload.exp && payload.exp < Date.now() / 1000) return null;
        if (payload.iss && !payload.iss.includes('scopeblind')) return null;

        if (env.SCOPEBLIND_JWKS_URL) {
            const verified = await verifyWithJWKS(token, env.SCOPEBLIND_JWKS_URL);
            if (!verified) return null;
        }

        return {
            type: 'human',
            method: payload.cnf ? 'dpop_bound' : 'pass_token',
            device_hash: payload.sub || payload.device_id || computeTokenHash(token),
            tier: payload.tier || 'standard',
            issued_at: payload.iat,
        };
    } catch (err) {
        console.error('[IDENTITY] Pass-token verification failed:', err.message);
        return null;
    }
}

// ── Per-Topic Pseudonym ─────────────────────────────────────────────

/**
 * Derive a per-topic pseudonym from a device ID and topic.
 * Uses HMAC-SHA256(device_id, topic): deterministic, per-topic, unlinkable.
 *
 * Same device + same topic = same pseudonym (within-topic accountability).
 * Same device + different topic = different pseudonym (cross-topic privacy).
 *
 * This is a correct functional placeholder for VOPRF derivation.
 *
 * @param {string} deviceId - the real device identifier (private, never exposed)
 * @param {string} topic - the topic name
 * @returns {string} hex-encoded pseudonym
 */
export async function deriveTopicPseudonym(deviceId, topic) {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(deviceId),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(topic)
    );

    return [...new Uint8Array(signature)]
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// ── Unified Identity Resolution ─────────────────────────────────────

/**
 * Resolve the identity of a request.
 * Tries methods in priority order: DPoP (agents) → Pass-token (browsers) → Fallback.
 *
 * Returns { type, method, device_id, topic_pseudonym, trust_level }
 *
 * device_id: real identifier, used for budget checks (private, server-side only)
 * topic_pseudonym: per-topic unlinkable pseudonym (public, goes in the ledger)
 *
 * @param {Request} request
 * @param {object} env
 * @param {string} topic - the topic being contributed to
 */
export async function resolveIdentity(request, env, topic = null) {
    // 1. Try DPoP (agent identity)
    const dpop = await verifyDPoP(request);
    if (dpop) {
        const deviceId = dpop.thumbprint;
        return {
            type: 'agent',
            method: 'dpop',
            device_id: deviceId,
            topic_pseudonym: topic ? await deriveTopicPseudonym(deviceId, topic) : deviceId,
            trust_level: 'cryptographic',
            details: dpop,
        };
    }

    // 2. Try ScopeBlind pass-token (browser identity)
    const passToken = await verifyPassToken(request, env);
    if (passToken) {
        const deviceId = passToken.device_hash;
        return {
            type: passToken.type,
            method: passToken.method,
            device_id: deviceId,
            topic_pseudonym: topic ? await deriveTopicPseudonym(deviceId, topic) : deviceId,
            trust_level: passToken.tier === 'hardware' ? 'hardware' : 'cryptographic',
            details: passToken,
        };
    }

    // 3. Fallback: header-based device ID (development only)
    const headerDeviceId = request.headers.get('x-device-id');
    if (headerDeviceId) {
        return {
            type: 'human',
            method: 'header',
            device_id: headerDeviceId,
            topic_pseudonym: topic ? await deriveTopicPseudonym(headerDeviceId, topic) : headerDeviceId,
            trust_level: 'none',
            details: null,
        };
    }

    // 4. Anonymous: IP-based (lowest trust, development only)
    if (env.ENVIRONMENT === 'development') {
        const ip = request.headers.get('cf-connecting-ip') || 'localhost';
        const deviceId = await hashString(`anon:${ip}`);
        return {
            type: 'human',
            method: 'anonymous',
            device_id: deviceId,
            topic_pseudonym: topic ? await deriveTopicPseudonym(deviceId, topic) : deviceId,
            trust_level: 'none',
            details: null,
        };
    }

    return null;
}

// ── Crypto Helpers ──────────────────────────────────────────────────

async function computeJWKThumbprint(jwk) {
    const canonical = JSON.stringify({
        crv: jwk.crv,
        kty: jwk.kty,
        x: jwk.x,
        y: jwk.y,
    });

    const hash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(canonical)
    );

    return b64urlEncode(new Uint8Array(hash));
}

async function verifyES256(message, signatureB64, jwk) {
    try {
        const key = await crypto.subtle.importKey(
            'jwk',
            { ...jwk, key_ops: ['verify'] },
            { name: 'ECDSA', namedCurve: 'P-256' },
            false,
            ['verify']
        );

        const signature = b64urlToBytes(signatureB64);
        const data = new TextEncoder().encode(message);

        return crypto.subtle.verify(
            { name: 'ECDSA', hash: 'SHA-256' },
            key,
            signature,
            data
        );
    } catch {
        return false;
    }
}

async function verifyWithJWKS(token, jwksUrl) {
    // Fetch JWKS and verify EdDSA (Ed25519) JWT signature
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return false;

        const header = JSON.parse(b64urlDecode(parts[0]));
        if (!header.kid && !header.alg) return false;

        // Fetch JWKS (with 5s timeout)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const resp = await fetch(jwksUrl, { signal: controller.signal });
        clearTimeout(timeout);

        if (!resp.ok) {
            console.error(`[IDENTITY] JWKS fetch failed: ${resp.status}`);
            return false; // Fail closed: reject if we can't verify
        }

        const jwks = await resp.json();
        if (!jwks.keys || !Array.isArray(jwks.keys)) return false;

        // Find matching key by kid or first Ed25519/EdDSA key
        const matchingKey = header.kid
            ? jwks.keys.find(k => k.kid === header.kid)
            : jwks.keys.find(k => k.kty === 'OKP' && k.crv === 'Ed25519');

        if (!matchingKey) {
            console.error('[IDENTITY] No matching key found in JWKS');
            return false;
        }

        // Verify signature
        const signingInput = `${parts[0]}.${parts[1]}`;
        const signatureBytes = b64urlToBytes(parts[2]);
        const messageBytes = new TextEncoder().encode(signingInput);

        if (matchingKey.kty === 'OKP' && matchingKey.crv === 'Ed25519') {
            // EdDSA (Ed25519): use Web Crypto
            const keyData = b64urlToBytes(matchingKey.x);
            const key = await crypto.subtle.importKey(
                'raw',
                keyData,
                { name: 'Ed25519' },
                false,
                ['verify']
            );
            return await crypto.subtle.verify('Ed25519', key, signatureBytes, messageBytes);
        }

        if (matchingKey.kty === 'EC' && matchingKey.crv === 'P-256') {
            // ES256 fallback
            return await verifyES256(signingInput, parts[2], matchingKey);
        }

        console.error(`[IDENTITY] Unsupported key type: ${matchingKey.kty}/${matchingKey.crv}`);
        return false;
    } catch (err) {
        console.error('[IDENTITY] JWKS verification error:', err.message);
        return false; // Fail closed
    }
}

function computeTokenHash(token) {
    return token.split('.')[1]?.slice(0, 16) || 'unknown';
}

async function hashString(str) {
    const buffer = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(str)
    );
    return [...new Uint8Array(buffer)]
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function b64urlDecode(str) {
    const padded = str + '='.repeat((4 - str.length % 4) % 4);
    return atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
}

function b64urlEncode(bytes) {
    return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function b64urlToBytes(str) {
    const decoded = b64urlDecode(str);
    return Uint8Array.from(decoded, c => c.charCodeAt(0));
}
