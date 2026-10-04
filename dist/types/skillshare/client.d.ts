import { type SkillHome, type SkillPackument, type SkillPublishResponse, type SkillReportedProvenance, type SkillSearchResponse, type SkillSearchSort, type SkillToken, type SkillTokenCreated, type SkillVersionManifest } from "@oh-my-pi/pi-wire/skillshare";
/** A registry failure: HTTP status plus the server's `{error}` message (or a local auth failure as 401). */
export declare class SkillshareError extends Error {
    readonly status: number;
    constructor(status: number, message: string);
}
export interface SkillSpec {
    scope: string;
    name: string;
    /** Exact version, semver range, or dist-tag; absent when the spec has no `@…` suffix. */
    range?: string;
}
/** Parse `@scope/name[@range]`; null when the spec is not a registry package id. */
export declare function parseSkillSpec(spec: string): SkillSpec | null;
export interface SkillshareClientOptions {
    /** Registry base URL; defaults to the `skills.registryUrl` setting, then {@link DEFAULT_SKILLS_URL}. */
    registryUrl?: string;
    /** Mutations may authenticate with a `SKILLS_TOKEN` publish token instead of the Stencil login. */
    forPublish?: boolean;
}
export interface PublishOptions {
    /** Dist-tag to point at the new version (server default: `latest` for stable, none for prereleases). */
    tag?: string;
    provenance?: SkillReportedProvenance;
    /** GitHub Actions OIDC token requested with audience `SKILLS_OIDC_AUDIENCE`. */
    githubOidc?: string;
}
export interface CreateTokenRequest {
    name: string;
    /** `@scope/name` packages the token may publish; omitted = every package the creator manages. */
    packages?: string[];
    expiresInDays?: number;
}
/** HTTP client for a Skillshare registry (`skills.omp.sh`). */
export declare class SkillshareClient {
    #private;
    /** Normalized registry base URL (no trailing slash). */
    readonly registryUrl: string;
    private constructor();
    static create(options?: SkillshareClientOptions): Promise<SkillshareClient>;
    /**
     * The bearer mutations send: `SKILLS_TOKEN` when publishing and set, else
     * the Stencil credential. Null when neither is available.
     */
    authToken(): Promise<string | null>;
    home(): Promise<SkillHome>;
    search(query: string, options?: {
        sort?: SkillSearchSort;
        page?: number;
    }): Promise<SkillSearchResponse>;
    packument(scope: string, name: string): Promise<SkillPackument>;
    version(scope: string, name: string, versionOrTag: string): Promise<SkillVersionManifest>;
    /** Download the `.tgz`, following the 302 to storage. Integrity is the installer's job. */
    tarball(scope: string, name: string, version: string): Promise<Uint8Array>;
    publish(scope: string, name: string, version: string, tgz: Uint8Array, options?: PublishOptions): Promise<SkillPublishResponse>;
    setTag(scope: string, name: string, tag: string, version: string): Promise<void>;
    removeTag(scope: string, name: string, tag: string): Promise<void>;
    yank(scope: string, name: string, version: string, yanked: boolean): Promise<void>;
    /** Set (string) or clear (null) the deprecation message of one version. */
    deprecate(scope: string, name: string, version: string, message: string | null): Promise<void>;
    addOwner(scope: string, name: string, username: string): Promise<void>;
    removeOwner(scope: string, name: string, username: string): Promise<void>;
    createToken(request: CreateTokenRequest): Promise<SkillTokenCreated>;
    listTokens(): Promise<SkillToken[]>;
    revokeToken(id: string): Promise<void>;
    /** Upload a Claude `.skill` zip; the server converts and publishes it. */
    importSkill(zip: Uint8Array): Promise<SkillPublishResponse>;
    close(): void;
}
