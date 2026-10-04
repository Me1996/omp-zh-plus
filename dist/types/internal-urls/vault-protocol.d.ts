import type { InternalResource, InternalUrl, LocateOptions, ProtocolHandler, ResolveContext, SchemeSpec } from "./types.js";
type VaultParamValue = string | true;
type VaultParams = Record<string, VaultParamValue>;
type FileOp = "outline" | "backlinks" | "links" | "tags" | "properties" | "tasks" | "wordcount" | "history" | "base";
type VaultOp = "search" | "daily" | "daily-path" | "tags" | "tag" | "tasks" | "orphans" | "unresolved" | "deadends" | "bases" | "bookmarks" | "recents" | "templates" | "aliases" | "properties" | "property";
interface VaultReference {
    vault: string | null;
    active: boolean;
    forwardVault: boolean;
    display: string;
}
export type ParsedVaultUrl = {
    kind: "list-vaults";
    url: string;
    params: VaultParams;
} | {
    kind: "vault-info";
    url: string;
    ref: VaultReference;
    params: VaultParams;
} | {
    kind: "fs-dir";
    url: string;
    ref: VaultReference;
    relativePath: string;
    params: VaultParams;
} | {
    kind: "fs-file";
    url: string;
    ref: VaultReference;
    relativePath: string;
    params: VaultParams;
} | {
    kind: "file-op";
    url: string;
    ref: VaultReference;
    relativePath: string;
    op: FileOp;
    params: VaultParams;
} | {
    kind: "vault-op";
    url: string;
    ref: VaultReference;
    op: VaultOp;
    params: VaultParams;
};
interface ObsidianSpawnResult {
    stdout: string;
    stderr: string;
    exitCode: number;
}
interface VaultProtocolHandlerOptions {
    spawnObsidian?: typeof spawnObsidian;
    resolveObsidianBinary?: () => string | null;
}
export declare function parseVaultUrl(input: string | InternalUrl): ParsedVaultUrl;
export declare function spawnObsidian(bin: string, args: string[], signal?: AbortSignal, timeoutMs?: number): Promise<ObsidianSpawnResult>;
export declare function resolveObsidianBinary(): string | null;
/**
 * Whether the `vault://` protocol is enabled in the active settings profile.
 *
 * Reads `vault.enabled` from the global settings singleton. Falls back to the
 * schema default when settings are not yet initialized (e.g. during isolated
 * unit tests that exercise the handler before the host calls `Settings.init`).
 */
export declare function isVaultEnabled(): boolean;
export declare function hasObsidian(): boolean;
export declare class VaultDisabledError extends Error {
    constructor();
}
export declare class VaultProtocolHandler implements ProtocolHandler {
    #private;
    readonly scheme = "vault";
    readonly spec: SchemeSpec;
    constructor(options?: VaultProtocolHandlerOptions);
    static resetForTests(): void;
    static setObsidianBinaryForTests(value: string | null | undefined): void;
    static setVaultDirectoryForTests(entries: ReadonlyMap<string, string> | Record<string, string> | undefined): void;
    static setActiveVaultPathForTests(vaultPath: string | undefined): void;
    resolve(url: InternalUrl, context?: ResolveContext): Promise<InternalResource>;
    /** Advertised only when vault:// is enabled and the Obsidian CLI is available. */
    promptDoc(): string | undefined;
    /**
     * Vault file or directory backing a plain filesystem URL; null for listings,
     * vault info, `?op=` queries, and missing entries without `create`. `create`
     * locates write targets, so it refuses directories. Resolving an uncached
     * vault root queries the Obsidian CLI once.
     */
    locate(url: InternalUrl, context?: ResolveContext, options?: LocateOptions): Promise<string | null>;
}
export {};
