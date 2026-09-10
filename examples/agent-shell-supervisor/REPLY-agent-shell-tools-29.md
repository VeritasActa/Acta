That makes sense to me. I agree that `grpc_execd` is the wrong trust boundary for this.

The clean split seems to be:

1. `grpc_exec` returns execution results and stays minimal.
2. The environment owner, for example `//wsb` or a wrapper that launches/manages `//wsb`, computes the environment commitment.
3. A separate observer signs a receipt binding the command digest, response digest, exit code, environment commitment, and observer identity.

I tightened the example here: https://github.com/VeritasActa/Acta/pull/2

I will not pursue an `ExecuteResponse` field based on this discussion. If useful later, I can turn the sketch into a small `wsb`-side example or wrapper that emits a sidecar receipt, but I agree that it should not come from `grpc_execd` itself.

Happy to close this issue as out of scope for `grpc_exec`, or leave it open as a marker for a possible future `wsb`/supervisor-side experiment, whichever you prefer.
