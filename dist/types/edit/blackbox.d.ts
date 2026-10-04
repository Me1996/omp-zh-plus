import type { ToolSession } from "../tools/index.js";
import type { EditMode } from "@oh-my-pi/pi-tui-zh/tools/edit";
/** Full source transition committed by one edit operation. */
export interface AppliedEditSnapshot {
    /** Path used to select the tree-sitter language. */
    path: string;
    /** File content immediately before the operation. */
    prev: string;
    /** File content immediately after the operation. */
    next: string;
}
/** Observes a committed edit before its full-file snapshots are pruned. */
export type AppliedEditObserver = (snapshot: AppliedEditSnapshot) => Promise<void>;
/** Create the enabled recorder that appends native-detected parse regressions. */
export declare function createEditBlackboxRecorder(session: ToolSession, variant: EditMode, arg: unknown): AppliedEditObserver | undefined;
