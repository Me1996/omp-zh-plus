import type { NativeNode } from "../native/node.js";
import { Container } from "../tui.js";
/**
 * The idle recap (`recap.*`): where the session stands, written while the user
 * was away. Stays in the transcript like a thought: a dim italic `※ recap:`
 * line in ANSI, a history icon beside the italic thought-coloured text in a
 * native terminal (`omp.recap`).
 */
export declare class RecapNotice extends Container {
    #private;
    constructor(recap: string);
    describe(): NativeNode;
}
