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
import { basename, isAbsolute, join } from 'node:path';
import { CanonStore } from "./core/store.js";
import { buildRetriever } from "./core/retrieval.js";
import { Surfacer } from "./core/surfacing.js";
import { runCanon, CANON_TOOL_PARAMETERS, canonToolDescription } from "./core/tool.js";
export const name = 'canon';
export const inject = ['tools'];
/**
 * The canonical value this tool returns. canon's core produces one text blob;
 * declaring it as an object keeps room for structured fields later without a
 * breaking output-schema change.
 */
const OUTPUT_SCHEMA = {
    type: 'object',
    properties: { text: { type: 'string' } },
    required: ['text'],
    additionalProperties: false,
};
/** The actions that write to the store, refused under a read-only policy. */
const MUTATING_ACTIONS = new Set(['write', 'journal']);
export function apply(ctx, config = {}) {
    /*
     * One runtime per workspace rather than one per plugin. A store is anchored to
     * a directory, and a single harness process serves sessions in different
     * workspaces, so caching one runtime would file every session's knowledge into
     * whichever workspace happened to call first.
     */
    const runtimes = new Map();
    const runtimeFor = (cwd) => {
        const cached = runtimes.get(cwd);
        if (cached)
            return cached;
        const root = config.root
            ? (isAbsolute(config.root) ? config.root : join(cwd, config.root))
            : join(cwd, '.canon');
        const store = new CanonStore(root);
        const mounts = [
            { name: '', dir: cwd, store },
            ...(config.mounts ?? []).map(dir => {
                const abs = isAbsolute(dir) ? dir : join(cwd, dir);
                return { name: basename(abs), dir: abs, store: new CanonStore(join(abs, '.canon')) };
            }),
        ];
        // No retriever in the first Harness build, so retrieval is "none" and the
        // filing doctrine tightens accordingly. See filingTail in core/tool.ts.
        // resurface and standout keep the Surfacer's own defaults, so the shipped
        // values live in exactly one place.
        const retriever = buildRetriever('none');
        const runtime = {
            store,
            surfacer: new Surfacer(mounts, retriever),
            cwd,
            mounts,
            retrieval: retriever.name,
            provenance: { harness: 'dsh' },
        };
        runtimes.set(cwd, runtime);
        return runtime;
    };
    /**
     * The workspace this call belongs to. A resolved sandbox-policy root wins so
     * the store and the sandbox agree on one per-call identity, matching how
     * tool-bash resolves its workdir; the session header is the fallback, and
     * process.cwd() only covers a call arriving with no agent at all.
     */
    const policy = (exec) => {
        const service = ctx.get('sandboxPolicy');
        if (service === undefined)
            return undefined;
        const agent = exec.agent;
        return service.resolve(agent === undefined ? {} : { session: agent.session });
    };
    const workspaceFor = (exec, resolved) => {
        const header = exec.agent?.session.header.cwd;
        return resolved?.workspaceRoot ?? header ?? process.cwd();
    };
    const definition = {
        name: 'canon',
        description: canonToolDescription('none'),
        parameters: CANON_TOOL_PARAMETERS,
        output: {
            schema: OUTPUT_SCHEMA,
            render: (_args, value) => [
                { type: 'text', text: value.text },
            ],
        },
        async execute(args, exec) {
            const params = args;
            const resolved = policy(exec);
            /*
             * The deployment owns this decision, not the plugin. Widening it here is
             * how a read-only deployment would silently gain a write door.
             */
            if (resolved?.mode === 'read-only' && MUTATING_ACTIONS.has(String(params['action']))) {
                return {
                    text: `canon: this session is read-only, so ${String(params['action'])} is refused. `
                        + 'Read, map and search still work.',
                };
            }
            return { text: runCanon(runtimeFor(workspaceFor(exec, resolved)), params) };
        },
    };
    ctx.effect(() => ctx.tools.register(definition));
}
//# sourceMappingURL=index.js.map