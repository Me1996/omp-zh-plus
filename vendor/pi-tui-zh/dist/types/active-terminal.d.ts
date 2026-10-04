/**
 * Ownership of stdout by a started {@link ProcessTerminal}, kept in a leaf
 * module so writers that `terminal.ts` itself imports (terminal capabilities,
 * notifications) can route through the active terminal without an import cycle.
 */
import type { ProcessTerminal } from "./terminal.js";
/** The started terminal that owns stdout in this thread, if any. */
export declare function getActiveTerminal(): ProcessTerminal | null;
/** Record the terminal that owns stdout (`ProcessTerminal.start`), or release it with `null` (`stop`). */
export declare function setActiveTerminal(terminal: ProcessTerminal | null): void;
/** Observe stdout errors through the shared listener. Returns the unregister callback. */
export declare function registerStdoutErrorHandler(handler: (err: Error) => void): () => void;
/**
 * Hand `data` to the active terminal's ordered output path. Returns false when
 * no terminal in this thread has started. On the main thread that means the
 * caller owns stdout; a worker thread never sees the main thread's terminal, so
 * there `false` is not permission to write. Prefer {@link writeTerminalSequence}.
 */
export declare function writeThroughActiveTerminal(data: string): boolean;
/**
 * Write an out-of-band escape sequence (window title, OSC 52 clipboard,
 * notification). While a TUI owns stdout, its frames go through an off-thread
 * pump in chunks that ignore escape boundaries; a direct `process.stdout.write`
 * can land between two chunks and split a frame's escape sequence, and the host
 * terminal then prints its tail as text. So the sequence takes the active
 * terminal's ordered output path, and goes straight to stdout, best-effort, only
 * when no terminal owns it. A worker thread cannot reach the main thread's
 * terminal and would write around its pump, so it writes nothing.
 */
export declare function writeTerminalSequence(data: string): void;
