import { type CanonStore } from "./store.ts";
import type { Mount, Surfacer } from "./surfacing.ts";
export interface CanonRuntime {
    store: CanonStore;
    surfacer: Surfacer;
    cwd: string;
    mounts: Mount[];
    retrieval: string;
    provenance?: {
        harness: string;
        sessionId?: string;
    };
}
export declare const CANON_TOOL_PARAMETERS: {
    readonly type: "object";
    readonly properties: {
        readonly action: {
            readonly type: "string";
            readonly enum: readonly ["read", "write", "journal", "map", "search"];
        };
        readonly path: {
            readonly type: "string";
            readonly description: "Article address, e.g. src/core/config. Required for read and write; optional filter for map.";
        };
        readonly body: {
            readonly type: "string";
            readonly description: string;
        };
        readonly capsule: {
            readonly type: "string";
            readonly description: "write: one dense line injected when the asset is touched.";
        };
        readonly query: {
            readonly type: "string";
            readonly description: "search: words to look for, across articles and the journal.";
        };
        readonly journal: {
            readonly type: "boolean";
            readonly description: string;
        };
        readonly scope: {
            readonly type: "string";
            readonly enum: readonly ["rule", "asset"];
            readonly description: string;
        };
        readonly subject: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly description: "journal: article addresses this event concerns.";
        };
        readonly slug: {
            readonly type: "string";
            readonly description: "journal: short name for the entry file.";
        };
    };
    readonly required: readonly ["action"];
};
export declare function canonToolDescription(retrieval?: string): string;
export declare function buildCanonTool(ready: (ctx: unknown) => CanonRuntime, retrieval?: string): {
    name: string;
    label: string;
    description: string;
    parameters: {
        readonly type: "object";
        readonly properties: {
            readonly action: {
                readonly type: "string";
                readonly enum: readonly ["read", "write", "journal", "map", "search"];
            };
            readonly path: {
                readonly type: "string";
                readonly description: "Article address, e.g. src/core/config. Required for read and write; optional filter for map.";
            };
            readonly body: {
                readonly type: "string";
                readonly description: string;
            };
            readonly capsule: {
                readonly type: "string";
                readonly description: "write: one dense line injected when the asset is touched.";
            };
            readonly query: {
                readonly type: "string";
                readonly description: "search: words to look for, across articles and the journal.";
            };
            readonly journal: {
                readonly type: "boolean";
                readonly description: string;
            };
            readonly scope: {
                readonly type: "string";
                readonly enum: readonly ["rule", "asset"];
                readonly description: string;
            };
            readonly subject: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
                readonly description: "journal: article addresses this event concerns.";
            };
            readonly slug: {
                readonly type: "string";
                readonly description: "journal: short name for the entry file.";
            };
        };
        readonly required: readonly ["action"];
    };
    execute(_toolCallId: string, params: Record<string, unknown>, _signal: unknown, _onUpdate: unknown, ctx: unknown): Promise<{
        content: {
            type: string;
            text: string;
        }[];
        details: {};
    }>;
};
export declare function runCanon(runtime: CanonRuntime, params: Record<string, unknown>): string;
//# sourceMappingURL=tool.d.ts.map