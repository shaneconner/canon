import type { Article } from "./store.ts";
export declare const SCHEMA_FILE = "schema.json";
export declare const SCHEMA_VERSION = 1;
export interface SchemaRule {
    required?: boolean;
    min_chars?: number;
    max_chars?: number;
    hint?: string;
}
export interface RefsRule {
    required?: boolean;
    min_count?: number;
    hint?: string;
}
export interface OrphanRule {
    warn?: boolean;
    hint?: string;
}
export interface ChildrenRule {
    listed?: boolean;
    hint?: string;
}
export interface CanonRelations {
    refs?: RefsRule;
    orphan?: OrphanRule;
    children?: ChildrenRule;
}
export interface CanonSchema {
    capsule?: SchemaRule;
    title?: SchemaRule;
    body?: SchemaRule;
    relations?: CanonRelations;
}
export declare function ensureSchemaFile(root: string): void;
export declare function loadSchema(root: string): {
    schema: CanonSchema | undefined;
    problems: string[];
};
export declare function outgoingOf(body: string): string[];
export declare function titleOf(body: string): string | undefined;
export interface Touched {
    capsule: boolean;
    body: boolean;
    refs: boolean;
    created: boolean;
}
export declare const READ_ONLY: Touched;
export interface Verdict {
    rejections: string[];
    warnings: string[];
}
export declare function checkArticle(article: Article, schema: CanonSchema, touched: Touched): Verdict;
//# sourceMappingURL=schema.d.ts.map