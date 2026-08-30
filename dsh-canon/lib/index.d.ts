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
import type { Context } from '@deepseek-ai/cordis';
export declare const name = "canon";
export declare const inject: string[];
/** Deployment-owned options. Behaviour knobs stay constants on purpose. */
export interface Config {
    /** Store location, absolute or relative to the workspace root. Defaults to `.canon`. */
    root?: string;
    /** Extra read-only stores, addressed by basename: `["/data/lake"]` serves `lake:prices`. */
    mounts?: string[];
}
export declare function apply(ctx: Context, config?: Config): void;
//# sourceMappingURL=index.d.ts.map