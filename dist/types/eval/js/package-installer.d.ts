/** Filesystem target used for explicit JavaScript eval dependencies. */
export type JsPackageEnvironmentMode = "managed" | "project";
/** Resolved package-manager target and runtime module fallback. */
export interface JsPackageEnvironment {
    mode: JsPackageEnvironmentMode;
    /** Directory owning package.json, bun.lock, and node_modules. */
    root: string;
    /** Fallback module-resolution root consulted after the importing file's own project. */
    packageRoot?: string;
    description: string;
}
/** Inputs for one host-side Bun dependency reconciliation. */
export interface InstallJsPackagesOptions {
    cwd: string;
    packages: readonly string[];
    environment?: JsPackageEnvironmentMode;
    autoProvision: boolean;
    signal?: AbortSignal;
}
/** Selected environment plus an optional model-visible reconciliation notice. */
export interface JsPackageInstallResult {
    environment: JsPackageEnvironment;
    summary?: string;
}
/** Resolve the shared project package root without creating files. */
export declare function resolveJsPackageEnvironment(cwd: string, mode?: JsPackageEnvironmentMode): JsPackageEnvironment;
/**
 * Reconcile explicit JavaScript requirements in a host-owned package
 * environment. The persistent eval worker is deliberately untouched: an
 * install failure or cancellation cannot discard its namespace.
 */
export declare function installJsPackages(options: InstallJsPackagesOptions): Promise<JsPackageInstallResult>;
