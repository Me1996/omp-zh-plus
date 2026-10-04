import { type NpmRegistryResolver } from "./npm-registry.js";
/** Distribution channel advertised by a release's published npm manifest. */
export type ReleaseDist = "npm" | "binary";
export type UpdateChannel = "stable" | "canary";
/** npm package names a release installs: the agent package and its natives companion. */
export interface ReleasePackages {
    pkg: string;
    natives: string;
}
/** Parsed `omp.rename` pointer: the new agent package name and optional new natives name. */
export interface ReleaseRename {
    pkg: string;
    natives?: string;
}
export interface ReleaseInfo {
    tag: string;
    version: string;
    /** Parsed `omp.dist` from the registry manifest; undefined when absent. */
    dist?: ReleaseDist;
    /** npm names to install, resolved after following any `omp.rename` pointers. */
    packages: ReleasePackages;
    /**
     * Registry URL the version was resolved from; bun/npm installs pin to it
     * so the install sees the same catalog as the check. See #1686.
     */
    registry: string;
}
/** A release binary the updater can download, resolved from published GitHub release metadata. */
export interface ReleaseBinaryAsset {
    /** Release version the asset installs, without the `v` tag prefix. */
    version: string;
    url: string;
    size: number;
    digest: string;
}
type Fetch = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
type GitHubCliTokenRunner = (ghPath: string) => Promise<string | undefined>;
/** Test hook for the GitHub credential precedence without invoking a real CLI. */
export declare function resolveGitHubTokenForTest(options?: {
    envToken?: string;
    ghPath?: string | null;
    runGhAuthToken?: GitHubCliTokenRunner;
}): Promise<string | undefined>;
/**
 * Parse the `omp.dist` field from a published package manifest.
 *
 * Forward-compatibility contract with future releases: a release that is not
 * installable as an npm package (e.g. a native rewrite) publishes
 * `"omp": { "dist": "binary" }` in its package.json. Any value other than
 * "npm" — including values this updater does not know yet — maps to "binary"
 * so already-deployed updaters never run a package-manager install against a
 * release that no longer supports it.
 */
export declare function resolveReleaseDist(manifest: unknown): ReleaseDist | undefined;
/**
 * Parse the `omp.rename` pointer from a published package manifest.
 *
 * Forward-compatibility contract for renaming the npm package: the final
 * version published under an old name is a stub whose manifest carries
 * `"omp": { "rename": { "package": "<new-agent-pkg>", "natives": "<new-natives-pkg>" }, "dist": "binary" }`.
 * Updaters that understand `rename` follow the pointer and resolve the
 * release from the renamed package instead ({@link getLatestRelease});
 * older deployed updaters ignore it and take the `dist: "binary"` escape
 * hatch, replacing the install with the GitHub release binary rather than
 * installing the stub via bun/npm.
 *
 * The renamed package's own manifest MUST declare `"dist": "npm"` (so
 * package-manager installs stay package-managed across a major bump) and
 * MUST continue the old version line (a version reset would compare as
 * "already up to date" against the running build).
 */
export declare function resolveReleaseRename(manifest: unknown): ReleaseRename | undefined;
/**
 * Whether the update must bypass bun/npm and install the release binary.
 *
 * An explicit `omp.dist` wins in both directions. Without one, a release with
 * a higher major than the running build is assumed not npm-installable: the
 * runtime may have changed out from under the package layout, and the pinned
 * `@oh-my-pi/pi-natives*` companions ({@link buildBunInstallArgs}) may not
 * exist at that version, which would strand bun/npm-managed installs behind a
 * hard install failure. Homebrew and mise installs are unaffected — both
 * already pull GitHub release binaries.
 */
export declare function shouldForceBinaryUpdate(release: {
    version: string;
    dist?: ReleaseDist;
}, currentVersion?: string): boolean;
/**
 * Select and validate the binary asset from GitHub release metadata.
 *
 * Draft releases are always rejected. Prereleases are rejected unless
 * `options.allowPrerelease` is set, which the canary channel passes: canary
 * GitHub releases are published as prereleases, and the exact-tag match below
 * still pins the download to the specific requested version.
 */
export declare function resolveReleaseBinaryAsset(release: unknown, expectedTag: string, binaryName: string, options?: {
    allowPrerelease?: boolean;
}): ReleaseBinaryAsset;
/**
 * Newest published release that is installable on this platform and newer than
 * `minVersion`, or undefined when the listing holds none.
 *
 * The npm dist-tag and the GitHub release channel disagree in both directions.
 * The pipeline publishes the GitHub release first (`release_npm` needs
 * `release_github_verify` in `.github/workflows/ci.yml`), so GitHub leads
 * during a release; and a publish that only half-completes leaves the gap
 * permanent — 18.2.9 reached npm `latest` with no `v18.2.9` GitHub release at
 * all (issue #12913). Binary installs therefore install what GitHub actually
 * published rather than failing on a tag derived from an npm version number.
 *
 * Releases whose asset is missing, still uploading, draft, or off-channel are
 * skipped in favor of an older published one.
 */
export declare function selectFallbackBinaryAsset(releases: unknown, binaryName: string, minVersion: string, options?: {
    allowPrerelease?: boolean;
}): ReleaseBinaryAsset | undefined;
export interface VerifiedBinaryDownloadOptions {
    url: string;
    targetPath: string;
    expectedSize: number;
    expectedDigest: string;
    fetchImpl?: Fetch;
}
/**
 * Download a binary and verify its GitHub-reported size and SHA-256 digest.
 */
export declare function downloadVerifiedBinary(options: VerifiedBinaryDownloadOptions): Promise<void>;
/** Result from running the installed binary and parsing its reported version. */
export interface InstalledVersionVerification {
    ok: boolean;
    actual?: string;
    path?: string;
}
/** Paths and verifier used while replacing a downloaded binary update. */
export interface BinaryReplacementOptions {
    targetPath: string;
    tempPath: string;
    backupPath: string;
    expectedVersion: string;
    verifyInstalledVersion: (expectedVersion: string) => Promise<InstalledVersionVerification>;
}
/**
 * Parse update subcommand arguments.
 * Returns undefined if not an update command.
 */
export declare function parseUpdateArgs(args: string[]): {
    force: boolean;
    check: boolean;
    plugins: boolean;
    channel?: UpdateChannel;
} | undefined;
type UpdateMethod = "brew" | "mise" | "nix" | "bun" | "npm" | "binary";
interface UpdateMethodResolutionOptions {
    homebrewPrefix?: string;
    miseBinDirs?: readonly string[];
    miseDataDir?: string;
    npmBinDir?: string;
    /** Bun's configured global package directory, independent of its bin directory. */
    bunGlobalDir?: string;
    /**
     * Whether the resolved omp path is a plain file (the standalone binary)
     * rather than a package-manager symlink. Stops a binary install from being
     * misrouted to npm/bun when the global bin dir overlaps the installer's
     * target directory.
     */
    ompIsRegularFile?: boolean;
    /**
     * Absolute path named by the bin entry's first symlink hop. This deliberately
     * preserves a global package symlink instead of resolving into its checkout.
     */
    ompLinkTarget?: string;
    /**
     * Whether bun's launcher metadata (`<name>.bunx`) sits beside the resolved
     * launcher. Bun writes that sidecar next to every `.exe` shim it installs, so
     * its presence is what makes a regular-file launcher in bun's bin dir
     * bun-managed rather than a standalone binary that took the launcher over.
     */
    bunShimMarker?: boolean;
    /**
     * Whether package-manager routing (bun/npm) is permitted. Binary-only
     * releases pass `false`: a manager launcher then resolves to `"binary"` and
     * is taken over in place rather than reinstalled through its manager. Defaults
     * to `true` in {@link resolveUpdateMethod} so callers that only classify need
     * not set it.
     */
    allowPackageManagers?: boolean;
}
type UpdateTarget = {
    method: "brew";
} | {
    method: "mise";
} | {
    method: "nix";
} | {
    method: "bun";
    path?: string;
} | {
    method: "npm";
    path?: string;
} | {
    method: "binary";
    path: string;
    replacesSymlink: boolean;
    validateExistingTarget: boolean;
};
export declare function resolveUpdateMethodForTest(ompPath: string, bunBinDir: string | undefined, options?: UpdateMethodResolutionOptions): UpdateMethod;
/** Resolve an update target from the concrete PATH entry selected by the shell. */
export declare function resolveUpdateTargetFromPath(ompPath: string, bunBinDir: string | undefined, options: UpdateMethodResolutionOptions & {
    allowPackageManagers: boolean;
}): UpdateTarget;
/**
 * Get the latest release info from the npm registry, following `omp.rename`
 * pointers ({@link resolveReleaseRename}) when the package has moved to a new
 * npm name. Version, dist, and install names all come from the final manifest
 * in the chain. Uses npm instead of GitHub API to avoid unauthenticated rate
 * limiting.
 *
 * The registry comes from the user's npm/bun configuration
 * ({@link loadNpmRegistryResolver}), so a configured feed is honored for every
 * install method, including standalone binaries.
 */
export declare function getLatestRelease(options?: {
    timeoutMs?: number;
    channel?: UpdateChannel;
    registries?: NpmRegistryResolver;
}): Promise<ReleaseInfo>;
interface BunInstallCachePruneResult {
    scannedPackages: number;
    removedEntries: number;
}
/**
 * Prune Bun's package cache so each package keeps only its newest cached version.
 *
 * Bun stores package cache entries as both a package marker directory
 * (`react/19.2.6@@@1`) and a materialized package directory
 * (`react@19.2.6@@@1`). Global `omp` updates can leave one full copy per
 * release. The marker and materialized entries are removed together so the
 * cache stays internally consistent.
 */
export declare function pruneBunInstallCache(cacheDir: string, packageNames?: Set<string>): Promise<BunInstallCachePruneResult>;
interface BunGlobalInstallLocations {
    globalDir?: string;
    globalBinDir?: string;
    cacheDir?: string;
}
/** Resolve Bun's global node_modules root from explicit, default, or cache locations. */
export declare function resolveBunGlobalNodeModulesDirFromLocations({ globalDir, globalBinDir, cacheDir, }: BunGlobalInstallLocations): string | undefined;
/**
 * Detect a musl-libc Linux host (Alpine, Void-musl) so self-update replaces a
 * musl binary with the musl release asset instead of the glibc build, which
 * would fail to start on the next run. The loader file alone is not sufficient:
 * glibc hosts may have musl installed for cross-compilation.
 */
interface MuslDetectionOptions {
    platform?: NodeJS.Platform;
    alpineRelease?: boolean;
    lddOutput?: string;
}
/** Test seam for libc detection. */
export declare function isMuslLinuxForTest(options: Required<MuslDetectionOptions>): boolean;
/**
 * Parse the version a launcher reports from `omp --version` output
 * (`omp/X.Y.Z`, or a prerelease such as `omp/X.Y.Z-canary.1`).
 *
 * The prerelease suffix is preserved so a correctly installed canary build
 * verifies as up to date instead of appearing to report a stale `X.Y.Z` and
 * being mistaken for an unreplaced launcher.
 */
export declare function parseReportedVersion(output: string): string | undefined;
/**
 * Run a specific binary and check if it reports the expected version.
 */
declare function verifyBinaryAtPath(binaryPath: string, expectedVersion: string): Promise<InstalledVersionVerification>;
/**
 * Run the PATH-resolved omp binary and check if it reports the expected version.
 */
declare function verifyInstalledVersion(expectedVersion: string): Promise<InstalledVersionVerification>;
/**
 * Best-effort removal of binary-update leftovers from earlier runs.
 *
 * Each self-update writes to `<binary>.<timestamp>.<pid>.new` and moves the
 * previous executable to `<binary>.<timestamp>.<pid>.bak` before swapping the
 * new one in. On Windows a backup cannot be deleted while the updating process
 * is alive (it is the running process image), so it is left for a later run to
 * reclaim once its owning process has exited. On macOS the sweep must also
 * spare a backup that any process still maps as its executable image —
 * unlinking it would break the live process's TCC permission attribution — so
 * a live image survives until its process exits. A `.new` temp file only
 * survives a hard kill mid-download; it is reaped once older than the download
 * window,
 * which a live download cannot exceed without timing out and cleaning up after
 * itself — so a concurrent run's in-progress temp is never deleted. Legacy
 * fixed `<binary>.bak` / `<binary>.new` names (from before suffixes were made
 * unique) are matched too, so users upgrading from a buggy release get the
 * orphaned files cleaned up.
 */
export declare function sweepStaleUpdateArtifacts(targetPath: string): Promise<void>;
/**
 * Atomically replace the installed binary and roll back if version verification fails.
 */
export declare function replaceBinaryForUpdate(options: BinaryReplacementOptions): Promise<InstalledVersionVerification>;
/**
 * Build the bun argv used to globally install a specific omp version.
 *
 * The version is selected by querying the resolved registry in
 * {@link getLatestRelease} ({@link ReleaseInfo.registry}), so the install
 * MUST observe the same catalog:
 *
 * - `--registry=<release registry>` pins the install to the registry the
 *   check used. That is the user's configured feed when one is set, and
 *   {@link DEFAULT_NPM_REGISTRY} otherwise, so a bun whose own resolution
 *   differs (project bunfig, lagging mirror) cannot reject a version the
 *   check already advertised.
 * - `--no-cache` tells bun to ignore its on-disk manifest snapshot so it
 *   re-fetches metadata from that registry on every invocation.
 *
 * Together these two flags make `omp update` produce exactly the registry
 * lookup the version check just performed. See #1686.
 *
 * Also pins {@link NATIVES_PACKAGE} and the platform-specific
 * `@oh-my-pi/pi-natives-<tag>` leaf to `expectedVersion`. `bun install -g`
 * does not reliably refresh transitive `optionalDependencies` when the
 * top-level package is the only one bumped, so the native addon and its
 * version sentinel can drift out of sync with the freshly installed
 * `@oh-my-pi/pi-coding-agent` and the loader aborts at
 * `validateLoadedBindings` on the next launch
 * (`The .node file on disk is from a different release than this loader`).
 * Listing the natives explicitly forces bun to replace them in lock-step.
 * The leaf is added only on tags the release pipeline actually publishes
 * ({@link SUPPORTED_NATIVE_TAGS}) so unsupported platforms still fail with
 * the original "no matching version" message instead of `EBADPLATFORM`.
 * See #1824.
 */
export declare function buildBunInstallArgs(expectedVersion: string, nativeTag?: string, packages?: ReleasePackages, options?: {
    registry?: string;
}): string[];
/**
 * Build the npm argv used to update npm-managed global installs.
 * Pins `--registry` to the checked registry for the same reason as
 * {@link buildBunInstallArgs}.
 *
 * `force` is set only for rename migrations: npm refuses to write the `omp`
 * bin while the old package still owns it (`EEXIST`), and the migration
 * installs the new package BEFORE removing the old one so a failed install
 * never leaves the user without a working `omp`.
 */
export declare function buildNpmInstallArgs(expectedVersion: string, nativeTag?: string, packages?: ReleasePackages, flags?: {
    force?: boolean;
    registry?: string;
}): string[];
export declare function buildHomebrewUpdateArgs(force: boolean): string[];
/**
 * Build the attended mise update command.
 *
 * `--before 0s` overrides global and per-tool release-age settings for this
 * invocation. Unlike `MISE_MINIMUM_RELEASE_AGE`, the command option has the
 * precedence required when the tool entry itself sets `minimum_release_age`.
 * `--before` is accepted by mise releases with release-age filtering and is
 * the hidden compatibility name for `--minimum-release-age` in current mise.
 * Older mise releases predate the option and reject unknown flags, so callers
 * omit it when the installed command help does not advertise either name.
 */
export declare function buildMiseUpgradeArgs(supportsReleaseAgeOverride?: boolean): string[];
export declare function buildMiseUpdateEnv(base?: Record<string, string | undefined>): Record<string, string | undefined>;
export declare function buildMiseForceInstallArgs(expectedVersion: string): string[];
/**
 * Old-name globals a rename migration removes after the new install exists:
 * the set difference between the old install's top-level globals
 * ({@link buildVersionedPackageInstallArgs} installs the agent, natives core,
 * and platform leaf explicitly) and the resolved install's. An agent-only
 * rename keeps the natives names, and removing them would strip the addon
 * the new install just pinned.
 */
export declare function buildRenameCleanupPackages(packages: ReleasePackages, nativeTag?: string): string[];
/** Injectable shell steps for {@link migrateRenamedInstall}; commands return process exit codes. */
export interface RenameMigrationSteps {
    /** Globally install the new package names. MUST be idempotent: re-running re-links the `omp` bin. */
    install(): Promise<number>;
    /** Remove the old-name globals. */
    removeOld(): Promise<number>;
    /** Check the PATH-resolved `omp` against the expected version. */
    verify(): Promise<InstalledVersionVerification>;
}
/**
 * Migrate a package-manager install across an `omp.rename` hop without a
 * window where no working `omp` exists:
 *
 * 1. Install the new package FIRST. Nothing has been removed yet, so a
 *    failure here leaves the old install fully functional.
 * 2. Remove the old-name globals. Failure is non-fatal: a stale package
 *    wastes disk, but the bin already points at the new install.
 * 3. Verify the PATH-resolved `omp`. If the removal deleted the shared bin
 *    link (manager-dependent), re-run the idempotent install to restore it
 *    and verify again; only a repeated failure aborts, with a recovery hint.
 */
export declare function migrateRenamedInstall(release: ReleaseInfo, steps: RenameMigrationSteps): Promise<void>;
/** Injectable steps for {@link updateViaManager}; mirrors {@link RenameMigrationSteps}. */
export interface ManagerUpdateSteps {
    /** Manager name used in progress and recovery messages. */
    manager: string;
    /**
     * Run the manager's global install. Resolves to the PATH-resolved launcher
     * check, or `undefined` when a rename migration already verified and
     * reported its own result.
     */
    install(): Promise<InstalledVersionVerification | undefined>;
    /** Re-check the PATH-resolved launcher after the install threw. */
    verify(): Promise<InstalledVersionVerification>;
    /** Take `launcherPath` over with the standalone release binary. */
    repair(launcherPath: string): Promise<void>;
}
/**
 * Run a package-manager self-update, repairing the launcher when the manager
 * succeeds without updating it or leaves no working launcher behind.
 *
 * A global reinstall has to replace files the running process still holds open.
 * On Windows that is unavoidable — the launcher image, the loaded native addon,
 * and the package tree being executed are all locked. Bun writes the new
 * `.bunx` metadata before ignoring EBUSY from the launcher replacement, while
 * npm can retire its shims before an install fails.
 *
 * A successful install whose PATH launcher still reports an older version
 * means the manager no longer controls that launcher, so it is taken over with
 * the standalone binary. A newer launcher may have been installed by a
 * concurrent update and is left untouched. If the install itself failed, a
 * launcher that still reports a version is preserved and the manager error is
 * surfaced; only a missing or unusable launcher is repaired.
 */
export declare function updateViaManager(release: ReleaseInfo, launcherPath: string | undefined, steps: ManagerUpdateSteps): Promise<void>;
/**
 * Download a release binary to a target path, replacing an existing file.
 *
 * `expectedVersion` is the npm-advertised version; the installed version is the
 * one {@link selectFallbackBinaryAsset} resolves when GitHub has no release for
 * that tag, so verification and reporting both use the resolved version.
 */
export declare function updateViaBinaryAt(targetPath: string, expectedVersion: string, options?: {
    binaryName?: string;
    fetchImpl?: Fetch;
    githubToken?: string;
    allowPrerelease?: boolean;
    /** Refuse replacement unless the existing path is a non-script OMP executable. */
    validateExistingTarget?: boolean;
    verifyInstalledVersion?: typeof verifyInstalledVersion;
}): Promise<void>;
/**
 * Take over a Windows script-launcher install for a binary-only release.
 *
 * npm-managed Windows installs are launched through script shims
 * (`omp`/`omp.cmd`/`omp.ps1`) that cannot be overwritten with a native
 * executable. The release binary is installed as `omp.exe` beside them and
 * the shims are then renamed aside: cmd.exe would already prefer `.exe` via
 * PATHEXT, but PowerShell resolves `.ps1` first, so the takeover only sticks
 * once the shims are out of the way. A working launcher exists at every
 * step — the exe lands before any shim moves, a shim that refuses to move
 * (a running `.cmd` can be renamed but may be held open some other way) is
 * rewritten in place as a forwarder to the exe, and a failed version
 * verification moves everything back.
 */
export declare function updateViaShimTakeover(shimPath: string, expectedVersion: string, options?: {
    binaryName?: string;
    fetchImpl?: Fetch;
    githubToken?: string;
    allowPrerelease?: boolean;
    verifyBinary?: typeof verifyBinaryAtPath;
}): Promise<void>;
/**
 * Run the update command.
 */
export declare function runUpdateCommand(opts: {
    force: boolean;
    check: boolean;
    channel?: UpdateChannel;
}): Promise<void>;
/**
 * Print update command help.
 */
export declare function printUpdateHelp(): void;
export {};
