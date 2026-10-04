import { type TUI } from "./tui.js";
export interface TuiDebugTreeNode {
    kind: string;
    id?: string;
    rect?: [x: number, y: number, w: number, h: number];
    focused?: boolean;
    focusable?: boolean;
    hidden?: boolean;
    children?: TuiDebugTreeNode[];
}
export interface TuiDebugOverlayNode {
    overlay: number;
    band?: unknown;
    hidden?: boolean;
    root: TuiDebugTreeNode;
}
export interface TuiDebugTree {
    root: TuiDebugTreeNode;
    overlays: TuiDebugOverlayNode[];
}
/** NDJSON debug and input server enabled by the `OMP_TUI_DEBUG` socket path. */
export declare class TuiDebugServer {
    #private;
    constructor(tui: TUI, path: string);
    start(): void;
    stop(): void;
}
