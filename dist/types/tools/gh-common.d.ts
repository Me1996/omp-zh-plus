import type { AgentToolResult } from "@oh-my-pi/pi-agent-core";
import type { ToolSession } from "./index.js";
import type { GhToolDetails } from "@oh-my-pi/pi-tui-zh/tools/github";
import type { GhLabel, GhUser } from "./gh-types.js";
export declare function normalizeText(value: string | null | undefined): string;
export declare function normalizeBlock(value: string | null | undefined): string;
export declare function normalizeOptionalString(value: string | null | undefined): string | undefined;
export declare function normalizePrIdentifierList(value: string | string[] | undefined): string[];
export declare function requireNonEmpty(value: string | null | undefined, label: string): string;
export declare function appendRepoFlag(args: string[], repo: string | undefined, identifier?: string): void;
/** The host `gh` assumes when a ref names none and `GH_HOST` is unset. */
export declare const GITHUB_HOST = "github.com";
/**
 * A repository in the GitHub CLI's `[HOST/]OWNER/REPO` form. A ref that names
 * no host is left for `gh` to resolve against `GH_HOST` (github.com by
 * default), so a host that is known — including github.com itself — is worth
 * keeping: it is what pins the request to the right instance.
 */
export interface GhRepoRef {
    /** Host this repo lives on, or undefined when unknown. */
    host?: string;
    /** `OWNER/REPO`, never host-qualified. */
    slug: string;
}
/** Split `[HOST/]OWNER/REPO`; anything with another shape is taken as a slug. */
export declare function parseRepoRef(repo: string): GhRepoRef;
/** Join a known host and `OWNER/REPO` into the form `--repo` accepts. */
export declare function formatRepoRef(host: string | undefined, slug: string): string;
/**
 * `gh api` endpoint paths carry no host, so a ref has to name its host with a
 * flag instead.
 */
export declare function ghApiHostArgs(ref: GhRepoRef): string[];
/**
 * `https://HOST/OWNER/REPO` → the repository's identity. The host is dropped
 * only when it is the one `gh` would have assumed anyway, so a bare identity
 * can never be redirected: with `GH_HOST` set elsewhere, even a github.com
 * checkout keeps its host.
 */
export declare function repoFromUrl(value: string | undefined): string | undefined;
export declare const PR_URL_PATTERN: RegExp;
export declare const ISSUE_URL_PATTERN: RegExp;
export declare function requireCurrentGitBranch(cwd: string, signal?: AbortSignal): Promise<string>;
export declare function requireCurrentGitHead(cwd: string, signal?: AbortSignal): Promise<string>;
export declare function formatAuthor(author: GhUser | null | undefined): string | undefined;
export declare function formatLabels(labels: GhLabel[] | undefined): string | undefined;
export declare function parsePullRequestUrl(value: string | undefined): {
    repo?: string;
    prNumber?: number;
};
/**
 * Parse a digit-only decimal positive integer or return undefined. Rejects
 * `1e2`, `0x10`, `12.0`, leading +/-, or any other shape `Number()` would
 * accept — those would otherwise key the cache against the wrong row.
 */
export declare function parsePositiveDecimalInt(value: string | undefined): number | undefined;
export declare function parseIssueUrl(value: string | undefined): {
    repo?: string;
    issueNumber?: number;
};
/** The host `gh` falls back to for any ref that names none. */
export declare function defaultGhHost(): string;
/**
 * Case-insensitive repo comparison over the instance each ref actually
 * resolves to. A host-less ref is not a wildcard: `gh` sends it to `GH_HOST`,
 * so comparing slugs alone would call a bare `owner/repo` the same repository
 * as `ghe.example.com/owner/repo` and let a caller act on one while the
 * request goes to the other.
 */
export declare function githubRepoSlugEquals(left: string | undefined, right: string): boolean;
export declare function resolveGitHubRepo(cwd: string, repo: string | undefined, runRepo: string | undefined, signal?: AbortSignal): Promise<string>;
/**
 * Process-lifetime cache of `gh repo view` lookups keyed by absolute cwd.
 * Avoids repeated `gh` chatter when the same protocol handler or tool call
 * resolves the default repo many times in a row.
 *
 * The shared lookup is intentionally **not** bound to any caller's
 * AbortSignal. Cancelling one caller would otherwise kill the underlying
 * `gh repo view` for every concurrent waiter on the same cwd. Each caller's
 * signal is honored at the wait point via `untilAborted` instead, so an abort
 * unwinds only that caller.
 */
export declare const DEFAULT_REPO_RESOLVED: Map<string, string>;
export declare const DEFAULT_REPO_INFLIGHT: Map<string, Promise<string>>;
export declare function resolveDefaultRepoMemoized(cwd: string, signal?: AbortSignal): Promise<string>;
/**
 * Best-effort cached cwd → `owner/repo` resolution that swallows any failure
 * (not a git checkout, no GitHub remote, `gh` unauthenticated, …) into
 * `undefined`. Use where the cwd repo is a convenience fallback, not a safety
 * check.
 */
export declare function tryResolveCurrentRepo(cwd: string, signal: AbortSignal | undefined): Promise<string | undefined>;
/**
 * Best-effort fresh cwd → `owner/repo` resolution for safety checks that must
 * reflect the repository currently mounted at `cwd`, not the process-lifetime
 * default-repo cache.
 */
export declare function tryResolveCurrentRepoFresh(cwd: string, signal: AbortSignal | undefined): Promise<string | undefined>;
export declare function saveArtifactText(session: ToolSession, toolType: string, text: string): Promise<string | undefined>;
export declare function appendArtifactReference(text: string, artifactId: string | undefined, label: string): string;
export declare function buildTextResult(text: string, sourceUrl?: string, details?: GhToolDetails, options?: {
    artifactId?: string;
    artifactLabel?: string;
    useless?: boolean;
}): AgentToolResult<GhToolDetails>;
