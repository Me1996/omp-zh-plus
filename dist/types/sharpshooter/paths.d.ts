/**
 * Sharpshooter storage layout.
 *
 * Everything lives home-scoped under `<agentDir>/memories/sharpshooter/<bank>/`
 * (mnemopi-style project bank id, never the project working tree):
 *
 * - `architecture.md` / `product.md` / `style.md` — the memory files
 * - `queue/<sessionId>/<ts36>-<nonce>.json`        — one queued delta per file
 * - `state.json`                                   — consolidation bookkeeping
 * - `consolidate.lock`                             — cross-process single-writer lock
 */
import type { SharpshooterState } from "./types.js";
/** Root for every sharpshooter bank. */
export declare function sharpshooterRoot(agentDir: string): string;
/** Stable per-project bank id derived from `cwd` alone (see {@link projectBankSegment}). */
export declare function sharpshooterBankId(cwd: string): string;
/** Bank directory for a project. */
export declare function sharpshooterBankDir(agentDir: string, cwd: string): string;
/** Queue root of a bank; one subdirectory per session. */
export declare function sharpshooterQueueDir(agentDir: string, cwd: string): string;
/** Path of one memory file inside a bank. */
export declare function sharpshooterMemoryFilePath(agentDir: string, cwd: string, file: string): string;
/** Advisory lock path guarding consolidation for a bank. */
export declare function sharpshooterLockPath(agentDir: string, cwd: string): string;
/** Read a bank's consolidation state; a missing or corrupt file yields the epoch state. */
export declare function readSharpshooterState(agentDir: string, cwd: string): Promise<SharpshooterState>;
/** Persist a bank's consolidation state (parent directories auto-created). */
export declare function writeSharpshooterState(agentDir: string, cwd: string, state: SharpshooterState): Promise<void>;
