import type { CanonStore } from "./store.ts";
export interface Candidate {
    path: string;
    capsule: string;
    body: string;
    updated: string;
    declared: boolean;
}
export interface Retriever {
    name: string;
    index?(candidates: Candidate[]): void;
    score(query: string, candidates: Candidate[]): Map<string, number>;
}
export interface IntentTurn {
    role?: unknown;
    content?: unknown;
    toolName?: unknown;
    input?: unknown;
}
export declare function userIntent(messages: unknown): IntentTurn[];
export declare function intentQuery(turns: readonly IntentTurn[]): string;
export declare function tokens(value: string): string[];
export declare class LexicalRetriever implements Retriever {
    readonly name = "lexical";
    private documents;
    private documentFrequency;
    private averageLength;
    index(candidates: Candidate[]): void;
    private idf;
    private ceiling;
    score(query: string, candidates: Candidate[]): Map<string, number>;
}
export declare const NONE: Retriever;
export type RetrievalOption = "none" | "lexical" | Retriever;
export declare function buildRetriever(option: RetrievalOption | undefined): Retriever;
export declare function residue(store: CanonStore, dir: string): Candidate[];
export declare const RULE_SCOPE = "rule";
export declare function governsAnAsset(dir: string, path: string): boolean;
//# sourceMappingURL=retrieval.d.ts.map