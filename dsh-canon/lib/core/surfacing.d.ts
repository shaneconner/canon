import { type Retriever } from "./retrieval.ts";
import type { CanonStore } from "./store.ts";
export declare function changesAssets(toolName: unknown, input: unknown): boolean;
export interface Mount {
    name: string;
    dir: string;
    store: CanonStore;
}
export declare class Surfacer {
    private mounts;
    private seen;
    private marks;
    private pendingUpdates;
    private staged;
    private retriever;
    private lastQuery;
    private resurface;
    private intent;
    private spoken;
    private cost;
    private surfacedEver;
    private lastFlush;
    private lastNudge;
    private standout;
    constructor(mounts: Mount[], retriever?: Retriever, resurface?: boolean, standout?: number);
    private get project();
    private locate;
    markSeen(path: string, entered?: string): void;
    private remember;
    observe(messages: unknown): void;
    markUpdated(path: string, entered?: string): void;
    get stats(): {
        surfaced: number;
        present: number;
        chars: number;
    };
    pathsIn(input: unknown): string[];
    noteIntent(toolName: unknown, input: unknown): void;
    private residueCache?;
    private reindex;
    private candidates;
    retrieve(): void;
    markChanged(assets: string[]): void;
    collect(assets: string[]): void;
    flush(): string | undefined;
    undoFlush(): void;
    settleNudge(): string | undefined;
}
//# sourceMappingURL=surfacing.d.ts.map