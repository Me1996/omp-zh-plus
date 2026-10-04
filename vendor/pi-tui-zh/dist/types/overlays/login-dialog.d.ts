import type { OAuthPrompt } from "@oh-my-pi/pi-ai/oauth/types";
import { type TUI } from "../index.js";
import { OverlayPanel } from "../chrome/overlay-box.js";
import type { NativeNode, NativeUiEvent } from "../native/node.js";
/**
 * Login dialog component - replaces editor during OAuth login flow
 */
export declare class LoginDialogComponent extends OverlayPanel {
    #private;
    constructor(tui: TUI, providerId: string, onComplete: (success: boolean, message?: string) => void, openUrl: (url: string) => void);
    get signal(): AbortSignal;
    /**
     * Called by the OAuth `onAuth` callback. Renders the full authorization URL
     * as the primary copy target — that works from any machine, including
     * SSH/WSL/headless sessions where the OMP-hosted `launchUrl` would resolve
     * against the user's local browser and fail. When `launchUrl` is present it
     * is offered as an additional local shortcut so narrow local terminals still
     * have a truncation-safe copy target (viewport clipping on a long authorize
     * URL silently drops trailing OAuth query parameters — e.g.
     * `code_challenge_method=S256`). Every physical URL row carries its own OSC 8
     * link to the full URL, so clicking any wrapped fragment opens the same target.
     */
    showAuth(url: string, instructions?: string, launchUrl?: string): void;
    /**
     * Show input for manual code/URL entry (for callback server providers)
     */
    showManualInput(prompt: string, signal?: AbortSignal): Promise<string>;
    /**
     * Called by onPrompt callback - show prompt and wait for input
     * Note: Does NOT clear content, appends to existing (preserves URL from showAuth)
     */
    showPrompt(prompt: OAuthPrompt): Promise<string>;
    /**
     * Show waiting message (for polling flows like GitHub Copilot)
     */
    showWaiting(message: string): void;
    /**
     * Called by onProgress callback
     */
    showProgress(message: string): void;
    /**
     * A glass sheet over the composer (the dialog replaces the editor in the
     * dock; the `overlay` hoists into the terminal's layer): numbered steps —
     * open or copy the sign-in link, the device code, the live wait, the paste
     * field — and Cancel.
     */
    describe(): NativeNode;
    /** Cancel and Continue run what Esc and Enter run. */
    handleNativeEvent(event: NativeUiEvent): void;
    /** Route non-bracketed paste transports into the active login input. */
    pasteText(text: string): void;
    handleInput(data: string): void;
}
