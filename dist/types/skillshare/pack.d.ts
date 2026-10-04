export interface PackedFile {
    path: string;
    size: number;
    executable: boolean;
}
export interface SecretFinding {
    path: string;
    /** 1-based line of the match start. */
    line: number;
    /** Credential pattern name, e.g. `AWSAccessKey`, `PrivateKey`. */
    kind: string;
}
export interface PackResult {
    /** The scope is the publisher's; a pack never carries one. */
    scope?: undefined;
    name: string;
    version: string;
    description: string;
    files: PackedFile[];
    /** Owns a plain `ArrayBuffer` so it feeds `Bun.gunzipSync`/`fetch` bodies directly. */
    tgz: Uint8Array<ArrayBuffer>;
    integrity: string;
    /** Ships executables or anything under `scripts/`. */
    hasScripts: boolean;
    secrets: SecretFinding[];
}
/** Strict SemVer 2.0.0 (semver.org regex). */
export declare const SEMVER_RE: RegExp;
interface IgnoreRule {
    regex: RegExp;
    negate: boolean;
    dirOnly: boolean;
    /** Contains a `/`: matched against the full relative path; otherwise against the basename. */
    anchored: boolean;
}
/** Parse gitignore-style lines: `#` comments, `!` negation, trailing `/` = directories only, `/` anchors. */
export declare function parseIgnoreRules(lines: readonly string[]): IgnoreRule[];
/** Validate and pack the skill at `dir` into a publishable `.tgz`. Throws with a user-facing message on any violation. */
export declare function packSkill(dir: string): Promise<PackResult>;
/**
 * Set `metadata.version` in `<dir>/SKILL.md` to the bumped (`patch`/`minor`/
 * `major`) or explicit version and return it. Only the `version:` line inside
 * the frontmatter `metadata:` block changes (it is inserted, with a `metadata:`
 * block if needed); every other byte is preserved.
 */
export declare function bumpVersion(dir: string, kind: "patch" | "minor" | "major" | string): Promise<string>;
export {};
