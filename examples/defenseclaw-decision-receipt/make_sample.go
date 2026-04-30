package main

import (
	"crypto/ed25519"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"strings"
)

func canonical(v any) string {
	switch x := v.(type) {
	case map[string]any:
		keys := make([]string, 0, len(x))
		for k := range x {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		parts := make([]string, 0, len(keys))
		for _, k := range keys {
			kb, _ := json.Marshal(k)
			parts = append(parts, string(kb)+":"+canonical(x[k]))
		}
		return "{" + strings.Join(parts, ",") + "}"
	case []any:
		parts := make([]string, 0, len(x))
		for _, item := range x {
			parts = append(parts, canonical(item))
		}
		return "[" + strings.Join(parts, ",") + "]"
	default:
		b, _ := json.Marshal(v)
		return string(b)
	}
}

func digest(v any) string {
	sum := sha256.Sum256([]byte(canonical(v)))
	return "sha256:" + hex.EncodeToString(sum[:])
}

func withoutFields(r map[string]any, fields ...string) map[string]any {
	omit := map[string]bool{}
	for _, f := range fields {
		omit[f] = true
	}
	out := make(map[string]any, len(r))
	for k, v := range r {
		if omit[k] {
			continue
		}
		out[k] = v
	}
	return out
}

func main() {
	seed := make([]byte, ed25519.SeedSize)
	for i := range seed {
		seed[i] = byte(32 - i)
	}
	priv := ed25519.NewKeyFromSeed(seed)
	pub := priv.Public().(ed25519.PublicKey)

	policy := map[string]any{
		"id":      "defenseclaw-production",
		"version": "2026.04.30",
		"rule":    "deny tool writes when Inspect Engine classifies malicious content",
	}

	receipt := map[string]any{
		"receipt_id":            "00000000-0000-4000-8000-000000000001",
		"receipt_type":          "defenseclaw:decision",
		"tool_name":             "claw:write_file",
		"decision":              "deny",
		"policy_id":             "defenseclaw-production",
		"policy_digest":         digest(policy),
		"timestamp":             "2026-04-30T00:00:00Z",
		"previous_receipt_hash": "",
		"agent_id":              "agent-openclaw-1",
		"session_id":            "sess-example-1",
		"reason":                "malicious content detected by Inspect Engine",
	}

	signable := withoutFields(receipt, "signature", "public_key")
	sig := ed25519.Sign(priv, []byte(canonical(signable)))
	receipt["signature"] = hex.EncodeToString(sig)
	receipt["public_key"] = hex.EncodeToString(pub)

	out, err := json.MarshalIndent(receipt, "", "  ")
	if err != nil {
		panic(err)
	}
	out = append(out, '\n')
	if err := os.WriteFile("sample-decision-receipt.json", out, 0o644); err != nil {
		panic(err)
	}
	if err := os.WriteFile("expected-full-receipt-hash.txt", []byte(digest(receipt)+"\n"), 0o644); err != nil {
		panic(err)
	}
	fmt.Println("wrote sample-decision-receipt.json and expected-full-receipt-hash.txt")
}
