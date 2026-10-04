import { type SkillFile, type SkillPackument, type SkillSearchResponse, type SkillSearchSort, type SkillVersionSummary } from "@oh-my-pi/pi-wire/skillshare";
import { SkillshareClient } from "./client.js";
export interface SkillResolution {
    version: string;
    summary: SkillVersionSummary;
    /** Yanked / deprecated notices for the chosen version. */
    warnings: string[];
}
/**
 * Pick a version from a packument:
 * - exact version → that version, even when yanked;
 * - dist-tag → the tagged version;
 * - range → highest non-yanked version satisfying it.
 */
export declare function resolveSkillVersion(packument: SkillPackument, request: string): SkillResolution;
/** SRI `sha512-<base64>` of a tarball. */
export declare function computeIntegrity(bytes: Uint8Array): string;
/**
 * Download one version, verify its integrity BEFORE unpacking, and move it
 * into the store atomically. No-op when the store already holds a copy with
 * the same integrity. Returns the store directory.
 */
export declare function storeSkillVersion(client: SkillshareClient, pkg: {
    scope: string;
    name: string;
    version: string;
    integrity: string;
}): Promise<string>;
export interface ScriptApprovalRequest {
    id: string;
    version: string;
    /** Executables and everything under `scripts/`. */
    files: SkillFile[];
}
export interface SkillInstallHooks {
    /** Resolve `true` to install a version that ships scripts. */
    confirmScripts(request: ScriptApprovalRequest): Promise<boolean>;
    warn(message: string): void;
}
export interface SkillChange {
    id: string;
    /** Previously locked version, when there was one. */
    from?: string;
    to: string;
    /** Manifest range recorded for the package. */
    range: string;
    /** The locked version was re-unpacked because its store dir was missing or damaged. */
    restored: boolean;
}
/** Human-readable listing of the files a script-bearing version ships. */
export declare function formatScriptApproval(request: ScriptApprovalRequest): string;
export interface InstallSkillPackagesOptions {
    /** `@scope/name[@range|version|tag]`; empty installs everything the manifest lists. */
    specs: string[];
    global: boolean;
    yes: boolean;
    cwd: string;
}
/**
 * Install packages. With specs: resolve each (default range `^<latest>`,
 * recorded in the manifest like npm). Without specs: restore every locked
 * version exactly and resolve manifest entries the lock lacks. Returns what
 * changed; already-satisfied packages are omitted.
 */
export declare function installSkillPackages(client: SkillshareClient, opts: InstallSkillPackagesOptions, hooks: SkillInstallHooks): Promise<SkillChange[]>;
export interface UpdateSkillPackagesOptions {
    /** `@scope/name` ids; empty updates every manifest entry. */
    names: string[];
    global: boolean;
    cwd: string;
    /** Skip the scripts confirmation for versions that ship scripts. */
    yes?: boolean;
}
/**
 * Re-resolve manifest ranges and install versions that changed. Also restores
 * locked versions whose store dir went missing. Returns only actual changes.
 */
export declare function updateSkillPackages(client: SkillshareClient, opts: UpdateSkillPackagesOptions, hooks: SkillInstallHooks): Promise<SkillChange[]>;
/** Remove packages from the manifest and lock, pruning their store dirs. Returns removed ids. */
export declare function uninstallSkillPackages(opts: {
    names: string[];
    global: boolean;
    cwd: string;
}): Promise<string[]>;
export interface InstalledSkillInfo {
    id: string;
    /** Manifest range; undefined for a lock entry without a manifest entry. */
    range?: string;
    /** Locked version; undefined when the manifest entry was never installed. */
    version?: string;
    scope: "project" | "user";
    /** Store dir present with the locked integrity. */
    stored: boolean;
}
/** Project (when `cwd` is inside one) and user-global installs. */
export declare function listInstalledSkills(cwd: string): Promise<InstalledSkillInfo[]>;
/** Styling hooks so the same text renders colored in a terminal and plain in the TUI. */
export interface SkillOutputPaint {
    name(text: string): string;
    dim(text: string): string;
    warn(text: string): string;
}
export declare const PLAIN_PAINT: SkillOutputPaint;
export declare function formatSkillSearch(response: SkillSearchResponse, paint?: SkillOutputPaint): string;
/** Packument summary; `version` selects the highlighted version (default `latest`). */
export declare function formatSkillInfo(packument: SkillPackument, version?: string, paint?: SkillOutputPaint): string;
/** One line per change: `+ @a/b@1.0.0`, `@a/b 1.0.0 → 1.1.0`, restores, and range-only edits. */
export declare function formatSkillChanges(changes: SkillChange[], paint?: SkillOutputPaint): string;
export declare function formatInstalledSkills(skills: InstalledSkillInfo[], paint?: SkillOutputPaint): string;
export declare function installSkills(opts: {
    specs: string[];
    global: boolean;
    yes: boolean;
    cwd: string;
}): Promise<number>;
export declare function updateSkills(opts: {
    names: string[];
    global: boolean;
    cwd: string;
    yes?: boolean;
}): Promise<number>;
export declare function uninstallSkills(opts: {
    names: string[];
    global: boolean;
    cwd: string;
}): Promise<number>;
export declare function searchSkills(opts: {
    query: string;
    sort: SkillSearchSort;
    json: boolean;
}): Promise<number>;
/** `@scope/name` shows the package; `@scope/name@<range|tag|version>` highlights (JSON: returns) that version. */
export declare function showSkillInfo(opts: {
    spec: string;
    json: boolean;
}): Promise<number>;
