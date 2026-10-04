import { type CompactionOutcome } from "@oh-my-pi/pi-agent-core/compaction";
import { type ProviderDetails, type UsageReport } from "@oh-my-pi/pi-ai";
import { type Component } from "@oh-my-pi/pi-tui-zh";
import type { CompactOptions } from "../../extensibility/extensions/types.js";
import { type Theme } from "@oh-my-pi/pi-tui-zh/theme";
import type { InteractiveModeContext } from "../../modes/types.js";
import type { TspText } from "@oh-my-pi/pi-wire";
import type { OAuthAccountIdentity } from "../../session/auth-storage.js";
import type { CompactMode } from "../../session/compact-modes.js";
import { type ShakeMode } from "../../session/shake-types.js";
import type { UnavailableUsageAccount } from "@oh-my-pi/pi-tui-zh/overlays/usage-dashboard";
export declare class CommandController {
    #private;
    private readonly ctx;
    constructor(ctx: InteractiveModeContext);
    /**
     * Esc: take away the report shown above the editor (text mode); false when
     * none is shown. While open it may have pushed rows into the terminal's
     * scrollback that cannot come back, so an editor that sat on the bottom
     * row before is pinned there again instead of jumping up the screen.
     */
    dismissCommandReport(): boolean;
    /**
     * Drop any report — the one above the editor, or a focused sheet/page —
     * without pinning anything: the transcript or session under it was reset,
     * and its contents describe what is gone.
     */
    clearCommandReport(): void;
    /**
     * Show a read-only report, replacing the previous one. In text mode one that
     * fits the rows above the editor shows there like `/btw`: the editor keeps
     * focus and its Esc takes the report away. A taller one opens as a
     * full-screen page on the terminal's alternate screen, scrolled with the
     * arrow/page keys and the wheel, so the main screen is never touched and
     * Esc returns to it as it was. Natively it is a focused sheet like
     * `/usage`, its body scrolled by the terminal once it is long, closed by
     * Esc or Close.
     */
    showCommandReport(options: {
        title: string;
        head?: TspText;
        body: Component;
    }): void;
    openInBrowser(urlOrPath: string): void;
    handleExportCommand(text: string): Promise<void>;
    handleTraceCommand(): Promise<void>;
    handleDumpCommand(): Promise<void>;
    handleDumpAllCommand(): Promise<void>;
    handleAdvisorDumpCommand(isRaw?: boolean): void;
    handleDebugTranscriptCommand(): Promise<void>;
    handleShareCommand(): Promise<void>;
    handleSessionCommand(): Promise<void>;
    handleAdvisorStatusCommand(): Promise<void>;
    /**
     * `/jobs`: natively the live jobs sheet the jobs pill opens (inspect and
     * cancel included); `/jobs full`, and text mode, a report of the running
     * and recent jobs (see {@link showCommandReport}).
     */
    handleJobsCommand(options?: {
        full?: boolean;
    }): Promise<void>;
    handleUsageCommand(reports?: UsageReport[] | null): Promise<void>;
    handleChangelogCommand(args?: string): Promise<void>;
    handleHotkeysCommand(): void;
    handleToolsCommand(): void;
    handleContextCommand(): void;
    handleMemoryCommand(text: string): Promise<void>;
    handleClearCommand(): Promise<void>;
    handleFreshCommand(): Promise<void>;
    handleResetContextCommand(): Promise<void>;
    handleDeleteCommand(): Promise<void>;
    handleForkCommand(): Promise<void>;
    /**
     * `/move` — relocate the current session to a different directory.
     *
     * With no `targetPath` (TUI only), opens an autocomplete overlay so the user
     * can pick or type a directory. With a `targetPath`, resolves it directly.
     * If the target directory does not exist, the user is asked whether to create
     * it. The active session file and artifacts are moved into the target
     * directory's session bucket so `/resume` from that directory can find it.
     */
    handleMoveCommand(targetPath?: string): Promise<void>;
    /**
     * `/wt [<branch>]` — fork the checkout into a new linked git worktree on
     * `branch` (default `wt/<timestamp>`), carrying uncommitted changes along,
     * then relocate the session there like `/move`.
     */
    handleWorktreeCommand(branch?: string): Promise<void>;
    handleRenameCommand(title: string): Promise<void>;
    handleBashCommand(command: string, excludeFromContext?: boolean): Promise<void>;
    handlePythonCommand(code: string, excludeFromContext?: boolean): Promise<void>;
    handleCompactCommand(customInstructions?: string, mode?: CompactMode, beforeFlush?: (outcome: CompactionOutcome) => void | Promise<void>, internalGuidance?: string): Promise<CompactionOutcome>;
    /**
     * TUI handler for `/shake`. `elide` drops heavy structural content,
     * `images` strips image blocks, and `thinking` drops all thinking blocks.
     * Rebuilds the chat and reports counts.
     */
    handleShakeCommand(mode: ShakeMode): Promise<void>;
    executeCompaction(customInstructionsOrOptions?: string | CompactOptions, isAuto?: boolean, beforeFlush?: (outcome: CompactionOutcome) => void | Promise<void>, mode?: CompactMode): Promise<CompactionOutcome>;
    handleHandoffCommand(customInstructions?: string): Promise<void>;
}
export declare function renderProviderSection(details: ProviderDetails, uiTheme: Pick<Theme, "fg">): string;
export declare function renderUsageReports(reports: UsageReport[], uiTheme: Theme, nowMs: number, availableWidth: number, resolveActiveAccount?: (provider: string) => OAuthAccountIdentity | undefined, usageModelSelectors?: readonly string[], unavailableAccounts?: readonly UnavailableUsageAccount[]): string;
