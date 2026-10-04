import type { SessionStorage } from "./session-storage.js";
export declare function resolveManagedSessionRoot(sessionDir: string, cwd: string): string | undefined;
/**
 * Default session directory for `cwd` under `sessionsRoot`, without the legacy
 * migrations or directory creation {@link computeDefaultSessionDir} performs.
 * Read-only lookups (the `archive` eval prelude) use it so querying a project
 * never creates or moves a session bucket.
 */
export declare function sessionDirForCwd(cwd: string, sessionsRoot?: string): string;
/**
 * Compute the default session directory for a cwd.
 * Classifies cwd by canonical location so symlink/alias paths resolve to the
 * same home-relative or temp-root directory names as their real targets.
 */
export declare function computeDefaultSessionDir(cwd: string, storage: SessionStorage, sessionsRoot?: string): string;
export interface CwdIdentity {
    dev: string;
    ino: string;
}
/**
 * Snapshot the directory identity of `cwd` for later move detection.
 * A later path with the same device+inode is the same directory after rename.
 */
export declare function readCwdIdentity(cwd: string): CwdIdentity | undefined;
/**
 * True when `targetCwd` is the same directory that `cwdIdentity` was recorded
 * from — i.e. the project was renamed or moved, not merely deleted/unmounted.
 * Missing identity (legacy breadcrumb, or cwd absent at write time) is not evidence.
 *
 * Same-filesystem `mv` and `git worktree move` preserve `dev`+`ino` and qualify.
 * A cross-filesystem `mv` is copy+unlink (new inode, possibly new `dev`) and
 * therefore returns false — that is intentional. Absence is not a move; we
 * would rather leave the session in the original bucket than steal it into an
 * unrelated continue cwd (#11565).
 */
export declare function hasPositiveMovedProjectEvidence(cwdIdentity: CwdIdentity | undefined, targetCwd: string): boolean;
/** A terminal breadcrumb's recorded fields, before any check against the filesystem. */
export interface ParsedTerminalBreadcrumb {
    cwd: string;
    /** As recorded; a relative path resolves against `cwd`. */
    sessionFile: string;
    fresh: boolean;
    cwdIdentity: CwdIdentity | undefined;
}
/** Parse breadcrumb file content; null when it lacks the cwd and session lines. */
export declare function parseTerminalBreadcrumb(content: string): ParsedTerminalBreadcrumb | null;
/**
 * Storage facts about the writing session manager that decide whether the
 * custom-files registry can usefully record its transcript.
 *
 * A transcript under another agent dir's managed root still needs its marker:
 * the manager writes blobs to the current agent dir's store, and only that
 * agent dir's gc decides their reachability, which never scans the other root.
 */
export interface CustomSessionFileScope {
    /**
     * The session lives in a non-filesystem storage backend. A marker names a
     * local path gc reads from disk, so it would only ever dangle.
     */
    remoteStorage?: boolean;
}
/**
 * Write a breadcrumb linking the current terminal to a session file.
 * The breadcrumb contains the cwd and session path so --continue can
 * find "this terminal's last session" even when running concurrent instances.
 *
 * `fresh` marks a freshly minted, lazy session whose JSONL is not yet
 * materialized. A fresh breadcrumb is honored by
 * {@link readTerminalBreadcrumbEntry} even when its target file is still absent,
 * so a same-terminal relaunch does not fall back to an older transcript. Explicit
 * `SessionManager.newSession()` boundaries are materialized and therefore also
 * survive relaunches whose terminal identity changed. Once any lazy session
 * materializes, the caller rewrites the breadcrumb with `fresh:false` so a later
 * external delete is still treated as a genuinely stale crumb.
 *
 * When `cwd` exists, the breadcrumb also records its device+inode so
 * `--continue` can tell a rename/move from a deleted or unmounted path.
 *
 * `scope` describes the writing manager's storage so the custom-files registry
 * skips transcripts a marker cannot help gc read (see {@link CustomSessionFileScope}).
 */
export declare function writeTerminalBreadcrumb(cwd: string, sessionFile: string, fresh?: boolean, scope?: CustomSessionFileScope): void;
export interface TerminalBreadcrumb {
    cwd: string;
    sessionFile: string;
    /** The recorded session file exists on disk right now. */
    exists: boolean;
    /** Recorded as a `/new` fresh-session boundary whose JSONL may not exist yet. */
    fresh: boolean;
    /** Device+inode of `cwd` when the breadcrumb was written, if that path existed. */
    cwdIdentity?: CwdIdentity;
}
/**
 * Read the raw terminal breadcrumb for the current terminal.
 * Returns the recorded cwd + session file regardless of whether the recorded
 * cwd still matches the current one. Callers decide how to interpret a cwd
 * mismatch (e.g. a moved/renamed worktree).
 *
 * A missing target file yields `null` UNLESS the breadcrumb is a `fresh`
 * boundary — a lazy session whose JSONL was never written — in which case the
 * entry is returned with `exists:false` so the caller can distinguish it from a
 * genuinely stale/deleted breadcrumb.
 */
export declare function readTerminalBreadcrumbEntry(): Promise<TerminalBreadcrumb | null>;
