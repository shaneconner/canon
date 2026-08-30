import type { CanonSchema } from "./schema.ts";
import { type Article, type CanonStore } from "./store.ts";
export declare const BODY_WARN_CHARS = 8000;
export declare const BODY_LARGE_CHARS = 20000;
export declare const CAPSULE_CHARS = 1000;
export interface Reach {
    dir: string;
    retrieval: string;
}
export declare function unretained(journalBody: string, article: Article | undefined): string[];
export declare function advise(article: Article, store: CanonStore, priorBody?: string, reach?: Reach, schema?: CanonSchema): string[];
export declare function orphaned(dir: string, article: Article): string | undefined;
//# sourceMappingURL=lint.d.ts.map