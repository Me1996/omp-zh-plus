import type { Args } from "../cli/args.js";
import type { Settings } from "../config/settings.js";
/**
 * Warning for an enabled Python eval backend with no working interpreter.
 * Disabled backends (`eval.py` / `eval.js`, `PI_PY` / `PI_JS`) are intentional and never reported,
 * and neither is a probe cancelled through `signal`.
 */
export declare function resolvePythonEvalWarning({ cwd, settings, signal, }: {
    cwd: string;
    settings: Settings;
    signal?: AbortSignal;
}): Promise<string | undefined>;
/**
 * {@link resolvePythonEvalWarning}, gated to a fresh install's first launch.
 *
 * `lastChangelogVersion` is the marker as read before this launch's changelog step. That step
 * writes it, except for `--continue`, `--resume`, and foreign session imports; those launches are
 * skipped so they cannot repeat the warning on every resumed start.
 */
export declare function resolveFirstLaunchPythonEvalWarning({ args, lastChangelogVersion, cwd, settings, signal, }: {
    args: Pick<Args, "continue" | "resume" | "fromClaude" | "fromCodex" | "tools" | "noTools">;
    lastChangelogVersion: string | undefined;
    cwd: string;
    settings: Settings;
    signal?: AbortSignal;
}): Promise<string | undefined>;
