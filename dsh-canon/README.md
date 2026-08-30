# dsh-canon

Canonical project memory for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness).

Every asset in your project gets at most one governing article, at its own address. `src/core/config` is the article for `src/core/config`. Beneath the articles sits an append-only journal, which records events as they happened. Articles distil; the journal keeps the original.

This is the Harness adapter. The same core also ships as [`pi-canon`](https://www.npmjs.com/package/pi-canon) for Pi and as a Claude Code and Codex plugin. All of them read and write the same `.canon` store, so a project can be worked from any of them without a migration.

## Install

```sh
dsh plugin --profile web add dsh-canon
```

Restart `dsh` afterwards. Substitute your own profile name for `web`.

## The tool

The plugin registers one tool, `canon`, with five actions.

| Action | What it does |
| --- | --- |
| `read` | Return the governing article at an address. Read this before working on an asset. |
| `write` | Write or replace the article at an address, plus a one line capsule surfaced when the asset is touched. |
| `journal` | Append an immutable event entry beneath an address. |
| `map` | List articles with their capsules, optionally filtered by address prefix. |
| `search` | Search across articles, and across the journal when asked. |

Writing well matters more than writing often. An article earns its place by carrying what the next session cannot re-derive: exact limits, who consumes what, what breaks. A rule recorded without its values is worth nothing to the session that needs it, so carry ids, keys, counts and durations through verbatim, and every member of a named set rather than only the one being worked on.

File a constraint at the asset it governs, or at the shared parent when it spans several, rather than at whichever asset you happened to edit. Knowledge filed off the asset path never surfaces.

## Configuration

Both options are optional. Set them on the plugin entry in your profile.

```yaml
- id: canon
  name: 'dsh-canon'
  config:
    # Store location. Absolute, or relative to the workspace root.
    root: .canon
    # Extra read-only stores, addressed by basename: lake:prices
    mounts:
      - /data/lake
```

Everything else is a constant on purpose.

## How it behaves in the Harness

**One store per workspace, resolved per call.** This is the first thing to understand if you are adapting canon to another host, because getting it wrong is close to invisible.

The Harness is the first consumer where a single process serves several workspaces at once. Pi, the Claude Code plugin and the Codex plugin all avoid the question structurally: each session is one process with one working directory, so a runtime built once is a runtime built correctly. Under `dsh` that assumption breaks. A runtime cached once per plugin, rather than once per workspace, files every session's knowledge into whichever workspace happened to call first.

Nothing errors when that happens. Articles simply begin appearing under the wrong project, and the store that was supposed to be the reliable record becomes the thing you cannot trust. So the workspace is resolved on every call, and runtimes are cached per workspace rather than per plugin. Any future host where one process spans several projects needs the same treatment.

**The sandbox owns write permission, not this plugin.** When `ctx.sandboxPolicy` is mounted, its resolved workspace root is what the store anchors to, so the store and the sandbox agree on one identity. Under a `read-only` policy the `write` and `journal` actions are refused; `read`, `map` and `search` continue to work.

## Differences from the Pi build

No retriever. `pi-canon` can rank articles by relevance to the current work; this build surfaces by address only, and the filing doctrine tightens accordingly, because an article that governs no asset would be unreachable without a retriever.

No settings screen. `pi-canon` ships an interactive editor; here the two options above are set in the profile.

## Development

The six files in `src/core` are generated mirrors of `extensions/lib` in the [canon repository](https://github.com/shaneconner/canon), synced by `scripts/sync-plugin-core.mjs`. Never edit them here. Edit the source, re-run the sync, and rebuild.

```sh
npm run check   # typecheck the adapter
npm run build   # emit lib/
```

The mirrored core is transpiled without typechecking, as it is upstream, where Pi strips types at load. The adapter itself is checked.

## License

MIT
