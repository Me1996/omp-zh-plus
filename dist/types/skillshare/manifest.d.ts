export declare const SKILLS_MANIFEST_FILE = "skills.json";
export declare const SKILLS_LOCK_FILE = "skills.lock.json";
export declare const SKILLS_LOCK_VERSION = 1;
/** `skills.json`: `@scope/name` → semver range, exact version, or dist-tag. */
export interface SkillsManifest {
    skills: Record<string, string>;
}
export interface SkillsLockEntry {
    version: string;
    /** SRI `sha512-<base64>` of the tarball. */
    integrity: string;
    /** Registry-relative tarball route. */
    resolved: string;
}
/** `skills.lock.json`: exact versions installed for every manifest entry. */
export interface SkillsLock {
    version: typeof SKILLS_LOCK_VERSION;
    skills: Record<string, SkillsLockEntry>;
}
export interface SkillsInstallPaths {
    /** Directory holding the manifest and lock. */
    dir: string;
    manifest: string;
    lock: string;
}
/** `@scope/name` package id. */
export declare function formatSkillId(scope: string, name: string): string;
/** Split a validated `@scope/name` id; null when malformed. */
export declare function parseSkillId(id: string): {
    scope: string;
    name: string;
} | null;
/** Manifest + lock paths for the user-global install (`~/.omp/agent/`). */
export declare function getGlobalSkillsInstallPaths(): SkillsInstallPaths;
/**
 * Manifest + lock paths for a project: the nearest `.omp/` walking up from
 * `cwd`, else the git root's `.omp/`, else `<cwd>/.omp/`. Throws when `cwd` is
 * the home directory, whose `.omp/` is the user config root, not a project.
 */
export declare function getProjectSkillsInstallPaths(cwd: string): Promise<SkillsInstallPaths>;
export declare function getSkillsInstallPaths(opts: {
    global: boolean;
    cwd: string;
}): Promise<SkillsInstallPaths>;
/** Root of the unpacked package store, next to the agent dir. */
export declare function getSkillshareStoreDir(): string;
/** Unpacked directory of one installed version. Throws on ids or versions that are not path-safe. */
export declare function getSkillStorePath(scope: string, name: string, version: string): string;
/** Hidden file inside every store dir recording the verified tarball integrity; written last. */
export declare const STORE_INTEGRITY_FILE = ".skillshare-integrity";
/**
 * Integrity a store dir was unpacked from; null when the dir (or its marker)
 * is missing, i.e. the unpack never completed.
 */
export declare function readStoredIntegrity(dir: string): Promise<string | null>;
/** Parse `skills.json` text; throws with the file path on malformed content. */
export declare function parseSkillsManifest(text: string, file: string): SkillsManifest;
/** Parse `skills.lock.json` text; throws with the file path on malformed content. */
export declare function parseSkillsLock(text: string, file: string): SkillsLock;
/** Read `skills.json`; a missing file is an empty manifest. */
export declare function readSkillsManifest(file: string): Promise<SkillsManifest>;
/** Read `skills.lock.json`; a missing file is an empty lock. */
export declare function readSkillsLock(file: string): Promise<SkillsLock>;
/** Write `skills.json` with keys sorted for stable diffs. */
export declare function writeSkillsManifest(file: string, manifest: SkillsManifest): Promise<void>;
/** Write `skills.lock.json` with keys sorted for stable diffs. */
export declare function writeSkillsLock(file: string, lock: SkillsLock): Promise<void>;
