import type { NativeNode } from "../native/node.js";
import type { TUI } from "../tui.js";
export declare class CountdownTimer {
    #private;
    private tui;
    private onTick;
    private onExpire;
    constructor(timeoutMs: number, tui: TUI | undefined, onTick: (seconds: number) => void, onExpire: () => void);
    /**
     * The remaining time as a terminal-clocked `elapsed` node: its age is the
     * negative remaining time (the start lies in the future), so it counts up
     * toward zero and freezes there at expiry. The age is taken on the first
     * call after a (re)start, when the node is first written, and the node is
     * reused until {@link reset}.
     */
    describe(): NativeNode;
    /** Reset the countdown to its initial value */
    reset(): void;
    dispose(): void;
}
