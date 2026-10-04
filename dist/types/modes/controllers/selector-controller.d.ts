import type { Model, UsageReport } from "@oh-my-pi/pi-ai";
import type { Component } from "@oh-my-pi/pi-tui-zh";
import type { AgentHubOpenOptions, InteractiveModeContext } from "../../modes/types.js";
import type { ForeignSessionSource } from "../../session/foreign-session-store.js";
import { type ConfiguredThinkingLevel } from "@oh-my-pi/pi-tui-zh/thinking";
import type { SessionObserverRegistry } from "@oh-my-pi/pi-tui-zh/overlays/session-observer-registry";
export declare class SelectorController {
    #private;
    private ctx;
    constructor(ctx: InteractiveModeContext);
    /**
     * Restore keyboard focus to whatever currently owns the editor slot. The
     * slot can hold the editor itself or a hook selector/input/editor pushed
     * in by `ExtensionUiController` — e.g. an approval prompt that fired while
     * a fullscreen overlay was up. `overlayHandle.hide()` restores focus to
     * the component focused when the overlay opened, which is stale in that
     * case (the editor was swapped out): keys land on a hidden editor and the
     * visible prompt receives nothing (issue #3349). Call this after the
     * overlay hides to re-target focus at the visible slot owner.
     */
    focusActiveEditorArea(): void;
    /**
     * Temporarily replaces the editor slot with a selector, restoring the prior
     * slot contents and focus when the selector finishes.
     */
    showSelector(create: (done: () => void) => {
        component: Component;
        focus: Component;
    }): void;
    showSettingsSelector(): void;
    /**
     * Fullscreen `/usage` dashboard on the alternate screen (the /settings
     * idiom): compact subscriptions grid + daily activity heatmap, with the
     * classic full report one keypress away. Takes no transcript space.
     */
    showUsageDashboard(reports: UsageReport[]): void;
    showAdvisorConfigure(): void;
    showHistorySearch(): void;
    /**
     * Show the Extension Control Center dashboard.
     * Replaces /status with a unified view of all providers and extensions.
     */
    showExtensionsDashboard(): Promise<void>;
    /**
     * Fullscreen git UI on the alternate screen (the /models idiom): split
     * diff viewer, staging sidebar, and commit composer. Resolves focus back
     * to the editor when the user closes it.
     */
    showGitTui(revision?: string): Promise<void>;
    /**
     * Fullscreen agents hub on the alternate screen (the /models idiom): scope
     * sidebar, agent rows, and chip strips that dive into the model browser.
     */
    showAgentsDashboard(): Promise<void>;
    /**
     * Apply the side effects of a setting change the user made in this process
     * (settings selector, approved `cfg://` writes); the value is already stored.
     * Only `defaultThinkingLevel` needs this: it also switches the live session,
     * which config reloads and parent-session writes must not do. Every other
     * setting applies through handle listeners owned by the session and InteractiveMode.
     */
    handleSettingChange(id: string, value: unknown): void;
    showModelSelector(options?: {
        temporaryOnly?: boolean;
    }): void;
    /**
     * Session-only model switch (`/switch <selector>`): applies the resolved
     * model without persisting it. Compacts first when the transcript exceeds
     * the target's context window, mirroring an over-context pick in the alt+p
     * picker. Failures surface as status errors.
     */
    switchSessionModel(model: Model, thinkingLevel?: ConfiguredThinkingLevel): Promise<void>;
    showPluginSelector(mode?: "install" | "uninstall"): Promise<void>;
    showUserMessageSelector(): void;
    showCopySelector(): void;
    showTreeSelector(): void;
    showSessionSelector(source?: ForeignSessionSource): Promise<void>;
    handleResumeSession(sessionPath: string, options?: {
        settingsFlushed?: boolean;
    }): Promise<boolean>;
    handleSessionDeleteCommand(): Promise<void>;
    showOAuthSelector(mode: "login" | "logout", providerId?: string): Promise<void>;
    showSessionPinSelector(): Promise<void>;
    showResetUsageSelector(): Promise<void>;
    showDebugSelector(): Promise<void>;
    showThinkingSelector(): void;
    showAgentHub(observers: SessionObserverRegistry, options?: AgentHubOpenOptions): void;
}
