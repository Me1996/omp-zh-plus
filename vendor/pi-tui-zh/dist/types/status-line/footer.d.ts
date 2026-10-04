import { type Component } from "../index.js";
import type { FooterHost, FooterSession } from "./host.js";
import type { NativeNode } from "../native/node.js";
/**
 * Footer component that shows pwd, token stats, and context usage
 */
export declare class FooterComponent implements Component {
    #private;
    private readonly session;
    private readonly host;
    constructor(session: FooterSession, host: FooterHost);
    setAutoCompactEnabled(enabled: boolean): void;
    /**
     * Set extension status text to display in the footer.
     * ANSI/VT escape sequences and most control characters are stripped; tabs and newlines become spaces.
     * The combined status line is trimmed and truncated to terminal width.
     * @param key - Unique key to identify this status
     * @param text - Status text, or undefined to clear
     */
    setExtensionStatus(key: string, text: string | undefined): void;
    /**
     * Watch the repository head for label changes and repaint the footer.
     */
    watchBranch(onBranchChange: () => void): void;
    /**
     * Clean up the file watcher
     */
    dispose(): void;
    invalidate(): void;
    /**
     * Native footer: a `status` bar (path and branch, usage counters, billing
     * and context on the left, model on the right) plus the extension statuses.
     * Rebuilt per call from cheap session reads; the node identity holds while
     * the description is unchanged.
     */
    describe(): NativeNode;
    render(width: number): readonly string[];
}
