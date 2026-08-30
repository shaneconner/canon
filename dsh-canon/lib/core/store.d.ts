export interface Article {
    path: string;
    capsule: string;
    updated: string;
    scope: string;
    extra: string[];
    body: string;
}
export declare function contained(path: string, cwd?: string): string;
export declare function normalize(asset: string, cwd?: string): string;
export declare class CanonStore {
    readonly root: string;
    constructor(root: string);
    get articlesDir(): string;
    get journalDir(): string;
    private fileFor;
    read(path: string): Article | undefined;
    resolve(asset: string, cwd?: string): Article | undefined;
    list(): string[];
    signature(): string;
    compose(path: string, fields: {
        capsule?: string;
        body?: string;
        scope?: string;
    }): Article;
    write(path: string, fields: {
        capsule?: string;
        body?: string;
        scope?: string;
    }): Article;
    journal(entry: {
        body: string;
        slug?: string;
        subject?: string[];
        provenance?: {
            harness: string;
            sessionId?: string;
        };
    }): string;
    private note;
    journalEntries(): {
        name: string;
        logged: string;
        subjects: string[];
        body: string;
    }[];
    journalCount(): number;
    private index;
    private get indexFile();
    private static row;
    private rows;
    journalMentions(path: string): string[];
    map(under?: string): string;
}
//# sourceMappingURL=store.d.ts.map