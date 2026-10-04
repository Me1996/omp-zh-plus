/** Repository language, framework, package manager, and workspace metadata. */
export interface RepositoryContext {
    language?: string;
    framework?: string;
    packageManager?: string;
    isMonorepo: boolean;
    packageCount?: number;
}
/** Detect repository metadata in Rust → Node → Python → Go priority order. */
export declare function detectRepositoryContext(root: string): Promise<RepositoryContext>;
/** Format detected metadata for the conventional analysis prompt. */
export declare function formatRepositoryContext(context: RepositoryContext): string | null;
