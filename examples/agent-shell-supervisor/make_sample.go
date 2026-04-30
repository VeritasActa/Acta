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

func digest(v any) string {
	b := []byte(canonical(v))
	sum := sha256.Sum256(b)
	return "sha256:" + hex.EncodeToString(sum[:])
}

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
		seed[i] = byte(i + 1)
	}
	priv := ed25519.NewKeyFromSeed(seed)
	pub := priv.Public().(ed25519.PublicKey)

	command := map[string]any{
		"argv":   []any{"python", "-m", "pytest", "tests/test_policy.py"},
		"digest": digest(map[string]any{"argv": []any{"python", "-m", "pytest", "tests/test_policy.py"}}),
	}
	workdir := map[string]any{
		"path_hint": "/workspace/project",
		"digest":    digest(map[string]any{"git_commit": "abc123", "path": "/workspace/project"}),
	}
	env := map[string]any{
		"commitment": digest(map[string]any{"PATH": "/usr/bin:/bin", "PYTHONPATH": "tests"}),
		"context":    "supervisor-attested",
		"allowlist":  []any{"PATH", "PYTHONPATH"},
	}
	response := map[string]any{
		"exit_code": 0,
		"digest":    digest(map[string]any{"stdout": "2 passed", "stderr": "", "exit_code": 0}),
	}

	receipt := map[string]any{
		"acta_version":      "0.1",
		"receipt_type":      "acta:exec-observation",
		"subject":           "grpc_exec.ExecuteResponse",
		"observed_at":       "2026-04-30T00:00:00Z",
		"command":           command,
		"working_directory": workdir,
		"environment":       env,
		"response":          response,
		"observer": map[string]any{
			"id":           "agent-shell-supervisor.local",
			"trust_domain": "local-supervisor",
		},
	}
	receipt["receipt_id"] = digest(receipt)

	signable := withoutFields(receipt, "signature")
	sig := ed25519.Sign(priv, []byte(canonical(signable)))
	receipt["signature"] = map[string]any{
		"alg":        "Ed25519",
		"kid":        "did:key:example-agent-shell-supervisor",
		"public_key": hex.EncodeToString(pub),
		"sig":        hex.EncodeToString(sig),
	}

	out, err := json.MarshalIndent(receipt, "", "  ")
	if err != nil {
		panic(err)
	}
	out = append(out, '\n')
	if err := os.WriteFile("sample-execute-receipt.json", out, 0o644); err != nil {
		panic(err)
	}
	fmt.Println("wrote sample-execute-receipt.json")
}
