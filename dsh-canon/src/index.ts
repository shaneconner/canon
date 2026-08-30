/**
 * DeepSeek Harness adapter for canon.
 *
 * The six files under src/core are generated mirrors of extensions/lib, synced by
 * scripts/sync-plugin-core.mjs. Never edit them here; edit the source and re-sync.
 * This file is the only Harness-specific code: it resolves a workspace, builds a
 * CanonRuntime against it, and hands the tool to the tool registry.
 *
 * @module dsh-canon
 */

import { basename, isAbsolute, join } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
// Imported for its `declare module '@deepseek-ai/cordis'` augmentation, which is
// what puts `tools` on Context. Dropping this import removes ctx.tools entirely.
import type { JsonSchemaNode, ToolDefinition, ToolRunContext } from '@deepseek-ai/dsh-tools'
import { CanonStore } from './core/store.ts'
import { buildRetriever } from './core/retrieval.ts'
import { Surfacer, type Mount } from './core/surfacing.ts'
import { runCanon, CANON_TOOL_PARAMETERS, canonToolDescription, type CanonRuntime } from './core/tool.ts'

export const name = 'canon'
export const inject = ['tools']

/** Deployment-owned options. Behaviour knobs stay constants on purpose. */
export interface Config {
  /** Store location, absolute or relative to the workspace root. Defaults to `.canon`. */
  root?: string
  /** Extra read-only stores, addressed by basename: `["/data/lake"]` serves `lake:prices`. */
  mounts?: string[]
}

/**
 * The canonical value this tool returns. canon's core produces one text blob;
 * declaring it as an object keeps room for structured fields later without a
 * breaking output-schema change.
 */
const OUTPUT_SCHEMA: JsonSchemaNode = {
  type: 'object',
  properties: { text: { type: 'string' } },
  required: ['text'],
  additionalProperties: false,
}

/** The actions that write to the store, refused under a read-only policy. */
const MUTATING_ACTIONS = new Set(['write', 'journal'])

/**
 * The slice of the sandbox policy this plugin reads. Typed structurally rather
 * than imported so a profile without `@deepseek-ai/dsh-sandbox` installed still
 * builds; the service itself is looked up optionally at call time.
 */
interface PolicySlice {
  mode: string
  workspaceRoot: string
}
interface PolicyService {
  resolve(request: { session?: unknown }): PolicySlice
}

export function apply(ctx: Context, config: Config = {}): void {
  /*
   * One runtime per workspace rather than one per plugin. A store is anchored to
   * a directory, and a single harness process serves sessions in different
   * workspaces, so caching one runtime would file every session's knowledge into
   * whichever workspace happened to call first.
   */
  const runtimes = new Map<string, CanonRuntime>()

  const runtimeFor = (cwd: string): CanonRuntime => {
    const cached = runtimes.get(cwd)
    if (cached) return cached
    const root = config.root
      ? (isAbsolute(config.root) ? config.root : join(cwd, config.root))
      : join(cwd, '.canon')
    const store = new CanonStore(root)
    const mounts: Mount[] = [
      { name: '', dir: cwd, store },
      ...(config.mounts ?? []).map(dir => {
        const abs = isAbsolute(dir) ? dir : join(cwd, dir)
        return { name: basename(abs), dir: abs, store: new CanonStore(join(abs, '.canon')) }
      }),
    ]
    // No retriever in the first Harness build, so retrieval is "none" and the
    // filing doctrine tightens accordingly. See filingTail in core/tool.ts.
    // resurface and standout keep the Surfacer's own defaults, so the shipped
    // values live in exactly one place.
    const retriever = buildRetriever('none')
    const runtime: CanonRuntime = {
      store,
      surfacer: new Surfacer(mounts, retriever),
      cwd,
      mounts,
      retrieval: retriever.name,
      provenance: { harness: 'dsh' },
    }
    runtimes.set(cwd, runtime)
    return runtime
  }

  /**
   * The workspace this call belongs to. A resolved sandbox-policy root wins so
   * the store and the sandbox agree on one per-call identity, matching how
   * tool-bash resolves its workdir; the session header is the fallback, and
   * process.cwd() only covers a call arriving with no agent at all.
   */
  const policy = (exec: ToolRunContext): PolicySlice | undefined => {
    const service = ctx.get('sandboxPolicy') as PolicyService | undefined
    if (service === undefined) return undefined
    const agent = (exec as { agent?: { session: unknown } }).agent
    return service.resolve(agent === undefined ? {} : { session: agent.session })
  }

  const workspaceFor = (exec: ToolRunContext, resolved: PolicySlice | undefined): string => {
    const header = (exec as { agent?: { session: { header: { cwd?: string } } } }).agent?.session.header.cwd
    return resolved?.workspaceRoot ?? header ?? process.cwd()
  }

  const definition: ToolDefinition = {
    name: 'canon',
    description: canonToolDescription('none'),
    parameters: CANON_TOOL_PARAMETERS,
    output: {
      schema: OUTPUT_SCHEMA,
      render: (_args: unknown, value: unknown) => [
        { type: 'text', text: (value as { text: string }).text },
      ],
    },
    async execute(args: unknown, exec: ToolRunContext) {
      const params = args as Record<string, unknown>
      const resolved = policy(exec)
      /*
       * The deployment owns this decision, not the plugin. Widening it here is
       * how a read-only deployment would silently gain a write door.
       */
      if (resolved?.mode === 'read-only' && MUTATING_ACTIONS.has(String(params['action']))) {
        return {
          text: `canon: this session is read-only, so ${String(params['action'])} is refused. `
            + 'Read, map and search still work.',
        }
      }
      return { text: runCanon(runtimeFor(workspaceFor(exec, resolved)), params) }
    },
  }

  ctx.effect(() => ctx.tools.register(definition))
}
