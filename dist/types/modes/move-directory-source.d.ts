import type { MoveDirectorySource } from "@oh-my-pi/pi-tui-zh/overlays/move-overlay";
/** Resolve a user-typed path (`~`, absolute, or relative to `cwd`) to an absolute path. */
export declare function resolveMovePath(input: string, cwd: string): string;
/** If `input` resolves to an existing directory, return it; otherwise `null`. */
export declare function resolveExistingDirectory(input: string, cwd: string): string | null;
/** Filesystem-backed directory suggestions for the move dialog. */
export declare const moveDirectorySource: MoveDirectorySource;
