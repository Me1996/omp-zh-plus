import { Container } from "../tui.js";
import type { NativeNode } from "../native/node.js";
export declare class StatsNotice extends Container {
    #private;
    /** `message` is the launch status line; `url` the dashboard address. */
    constructor(message: string, url: string);
    describe(): NativeNode;
}
