/**
 * SGR mouse report parsing (`\x1b[<button;col;rowM` / `…m`).
 *
 * Mouse tracking is enabled while a fullscreen overlay holds the alternate
 * screen (see tui.ts MOUSE_TRACKING_ON), or — opt-in via `tui.mouse` — on the
 * normal buffer whenever no overlay is visible. Consumers hit-test
 * against their own rendered frame: the frame paints from screen row 0, hence
 * `row`/`col` are exposed 0-based for direct indexing into rendered lines.
 */
/** A decoded SGR mouse report. */
export interface SgrMouseEvent {
    /** Raw button code (bit 32 = motion, bit 64 = wheel, low bits = button). */
    button: number;
    /** 0-based column of the event. */
    col: number;
    /** 0-based row of the event. */
    row: number;
    /** True for a release report (`m` suffix). */
    release: boolean;
    /**
     * Vertical wheel direction: -1 up, 1 down, null when not a vertical wheel
     * event. Horizontal wheel reports (buttons 66/67, the sideways drift of a
     * two-finger trackpad scroll) are not a direction: treating them as one
     * scrolled the selectors up and back down at the end of a gesture.
     */
    wheel: -1 | 1 | null;
    /** True when the pointer moved (hover or drag) rather than clicked. */
    motion: boolean;
    /** True for a left-button press (not motion, not release, not wheel). */
    leftClick: boolean;
}
/**
 * Decode an SGR mouse report, or return null when `data` is not one.
 * Callers on hot keypress paths should pre-check `data.startsWith("\x1b[<")`
 * before paying for the regex.
 */
export declare function parseSgrMouse(data: string): SgrMouseEvent | null;
/** Handler invoked with a decoded SGR event; returning `false` reports unhandled. */
export type SgrMouseHandler = (event: SgrMouseEvent) => boolean | undefined;
/**
 * Decode an SGR mouse report and forward it to `handler`. Returns `false` when
 * `data` is not an SGR mouse report (or fails to parse), so callers can fall
 * through to other input handling. Centralizes the repeated
 * `data.startsWith("\x1b[<")` + `parseSgrMouse()` pattern.
 */
export declare function routeSgrMouseInput(data: string, handler: SgrMouseHandler): boolean;
/**
 * Structural view of a SelectList-like target for mouse routing. Declared here
 * (rather than importing the component) to keep this core module free of any
 * component-to-core import cycle.
 */
export interface SelectListMouseTarget {
    handleWheel(delta: -1 | 1): void;
    hitTest(line: number): number | undefined;
    setHoverIndex(index: number | null): void;
    clickItem(index: number): void;
}
/**
 * Route a decoded mouse event against a SelectList-like target at the given
 * 0-based frame-local `line`. Centralizes the repeated wheel/hit-test/hover/
 * click pattern. Returns `true` when the event was consumed.
 */
export declare function routeSelectListMouse(target: SelectListMouseTarget, event: SgrMouseEvent, line: number): boolean;
/**
 * Implemented by components that accept routed mouse events at frame-local
 * coordinates. Hosts translate screen coordinates to the component's own
 * rendered lines before forwarding.
 */
export interface MouseRoutable {
    /** `line`/`col` are 0-based within the component's rendered output. */
    routeMouse(event: SgrMouseEvent, line: number, col: number): void;
}
