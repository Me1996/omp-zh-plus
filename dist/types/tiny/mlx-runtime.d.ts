import { type RuntimeInstallPhase } from "@oh-my-pi/pi-utils";
/**
 * Side-installed Python runtime for the MLX tiny-model backend: a private venv
 * under the agent cache holding a pinned `mlx-lm`. Installed on first use the
 * same way the compiled binary side-installs `@huggingface/transformers`
 * (`ensureRuntimeInstalled`), just with `uv`/`python3 -m venv` instead of bun.
 */
/** Pinned `mlx-lm` release; the venv directory is keyed by it so bumps reinstall cleanly. */
export declare const MLX_LM_VERSION = "0.31.3";
/** Directory of the `mlx-lm` venv for {@link MLX_LM_VERSION}. */
export declare function getTinyMlxRuntimeDir(): string;
/** Local weights directory for an MLX Hub repo (`org/name` → `mlx/org--name`). */
export declare function getTinyMlxModelDir(repo: string): string;
/**
 * Ensure the pinned `mlx-lm` venv exists and return its Python interpreter.
 * Prefers `uv` (fetches a suitable Python itself); falls back to a system
 * `python3` ≥ 3.10. Cross-process safe via the same OS file lock the bun
 * runtime installer uses.
 *
 * @throws when neither `uv` nor a usable `python3` is on `PATH`, or the install fails.
 */
export declare function ensureTinyMlxRuntime(onPhase?: (phase: RuntimeInstallPhase) => void): Promise<string>;
