import { Loader } from "./loader.js";
/**
 * Loader that can be cancelled with Escape.
 * Extends Loader with an AbortSignal for cancelling async operations.
 *
 * @example
 * const loader = new CancellableLoader(tui, cyan, dim, "Working...");
 * loader.onAbort = () => done(null);
 * doWork(loader.signal).then(done);
 */
export declare class CancellableLoader extends Loader {
    #private;
    /** Called when user presses Escape */
    onAbort?: () => void;
    /** AbortSignal that is aborted when user presses Escape */
    get signal(): AbortSignal;
    /** Whether the loader was aborted */
    get aborted(): boolean;
    /** Return loader state including whether cancellation was requested. */
    debugState(): Record<string, unknown>;
    handleInput(data: string): void;
    dispose(): void;
}
