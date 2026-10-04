import type { CredentialsApi, KeysApi } from "@oh-my-pi/pi-ai";
import { type SgrMouseEvent } from "../index.js";
import { OverlayPanel } from "../chrome/overlay-box.js";
import type { DescribeContext, NativeNode, NativeUiEvent } from "../native/node.js";
/** Credential presence and provenance needed by the provider picker. */
export interface OAuthSelectorAuthSource {
    readonly credentials: Pick<CredentialsApi, "has">;
    readonly keys: Pick<KeysApi, "source">;
}
/**
 * Component that renders an OAuth provider selector.
 */
export declare class OAuthSelectorComponent extends OverlayPanel {
    #private;
    constructor(mode: "login" | "logout", authStorage: OAuthSelectorAuthSource, onSelect: (providerId: string) => void, onCancel: () => void, options?: {
        disabledProviders?: readonly string[];
        validateAuth?: (providerId: string) => Promise<boolean>;
        requestRender?: () => void;
    });
    stopValidation(): void;
    /**
     * Fit the selector into `lines` rendered rows by shrinking the visible list
     * window (the window is centered on the selection, so the selected row is
     * always visible at any height). Prefers keeping the full chrome — borders,
     * spacers, title, search status — but sacrifices the trailing spacer/border
     * (clipped by the host) before dropping below three visible rows.
     */
    setMaxHeight(lines: number): void;
    handleInput(keyData: string): void;
    describe(cx: DescribeContext): NativeNode;
    /** A click (or double-click) on a provider selects and confirms it, like the SGR click in {@link routeMouse}. */
    handleNativeEvent(event: NativeUiEvent): void;
    /** Move the selection one step for a wheel notch (clamped, no wrap). */
    handleWheel(delta: -1 | 1): void;
    /**
     * Route an SGR mouse report at component-local coordinates. Provider rows
     * start LIST_ROW_OFFSET lines into the render; the ScrollView window shows
     * #visibleCount rows from #scrollStart. Wheel moves the selection, motion
     * drives the hover band, and a left click selects and confirms like Enter.
     */
    routeMouse(event: SgrMouseEvent, line: number, _col: number): void;
}
