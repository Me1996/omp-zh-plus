/**
 * Anthropic subscription slow mode — omp's port of Claude Code's `/low-priority`,
 * enabled on Anthropic models by `/slow on` (`providers.anthropic.slowMode: auto`).
 *
 * Past a Claude subscription's usage limit, requests move through two stages:
 *
 * 1. Wrap-up: the server may keep serving on a small allowance drawn from the
 *    weekly limit (`anthropic-ratelimit-unified-grace-*-utilization` > 0).
 *    Tracked for every first-party OAuth account whatever the setting, so the
 *    status line shows it and sessions can tell the model to wrap up when
 *    nothing will continue the work afterwards ({@link AnthropicSlowModeController.wrapUpHintKey}).
 * 2. Low priority: at the session-limit wall Anthropic may offer the slow lane
 *    (`anthropic-ratelimit-unified-slow-offer: treatment`); with `/slow on`,
 *    requests continue on spare capacity by sending `anthropic-usage-limit: slow`
 *    until the limit resets. Weekly usage still counts; responses may pause
 *    while the server has no spare capacity (429 `slot_busy` / 529), which this
 *    controller turns into server-paced waits bounded by the server's max-wait
 *    budget.
 *
 * State is per Claude account lane ({@link AnthropicSlowModeLanes}): the main
 * agent, subagents, and advisors on one account share its wall and offer, while
 * requests served by another account never see them. Auto-accept policy and
 * notices stay with the requesting session.
 */
import type { AnthropicSlowModeFailure, AnthropicSlowModeHooks, AnthropicSlowModeRetry, AnthropicSlowModeSignal, Model } from "@oh-my-pi/pi-ai";
import type { AuthStorage } from "./auth-storage.js";
/** Why an active slow-mode window ended. */
export type AnthropicSlowModeEndReason = "reset" | "user" | "weekly" | "budget" | "off" | "ineligible" | "wall" | "max_wait" | "extra_usage";
/** Result of asking for the slow lane now (`/slow on` or auto-accept). */
export type AnthropicSlowModeAvailability = {
    kind: "available";
    resetsAtSec: number;
    resume: boolean;
} | {
    kind: "unavailable";
    reason: string;
};
type NoticeLevel = "info" | "warning" | "error";
/** Per-session wiring for {@link AnthropicSlowModeLanes.hooks}. */
export interface AnthropicSlowModeHookOptions {
    /**
     * Whether this session may use the low-priority lane (`/slow on`). When
     * false the lane is never entered or signalled, but wrap-up tracking and
     * offers still register. Omitted means enabled.
     */
    lowPriority?: () => boolean;
    /**
     * Final gate before auto-accepting (e.g. prefer rotating to a sibling
     * account with headroom). Omitted means always accept.
     */
    canAutoAccept?: () => boolean | Promise<boolean>;
    /** Surface a user-facing notice on the requesting session. */
    notify?: (level: NoticeLevel, message: string) => void;
}
/** Local wall-clock `HH:MM` for an epoch-seconds reset, with a weekday when it is not today-ish. */
export declare function formatSlowModeResetClock(resetsAtSec: number, now?: number): string;
/** Slow-mode state machine for one Claude account lane; see the module docs. */
export declare class AnthropicSlowModeController {
    #private;
    /** Whether requests currently carry the slow header. Expires the window once its limit resets. */
    isActive(now?: number): boolean;
    /** Reset time (epoch seconds) of the active window, if any. */
    activeResetsAtSec(now?: number): number | undefined;
    /** Percent of the weekly slow-lane allowance still available, when the server reported it. */
    allowanceLeftPercent(): number | undefined;
    /**
     * Key of the open wrap-up window when the model should be told to wrap up,
     * else undefined: no window, extra usage takes over, the lane already
     * serves, or (with `lowPriority`) the lane can still pick up the work.
     * Sessions hint once per key.
     */
    wrapUpHintKey(lowPriority: boolean, now?: number): number | undefined;
    /**
     * Compact status-line label, or `undefined` outside both stages. The
     * low-priority label shows only when `lowPriority` (this session's `/slow`).
     */
    statusLabel(now?: number, lowPriority?: boolean): string | undefined;
    /** Whether the slow lane can be entered now, and on which window. */
    availability(now?: number): AnthropicSlowModeAvailability;
    /** Enter the slow lane if {@link availability} allows it. */
    accept(now?: number): AnthropicSlowModeAvailability;
    /** End the active window. Returns false when nothing was active. */
    stop(reason: AnthropicSlowModeEndReason, now?: number): boolean;
    /** Test seam: drop all state. */
    reset(): void;
    /** Observe a successful response's slow-lane and wrap-up headers on this lane. */
    observe(signal: AnthropicSlowModeSignal, options: AnthropicSlowModeHookOptions): void;
    /** Decide how to react to a pre-content failure on this lane (see {@link AnthropicSlowModeHooks.onFailure}). */
    onFailure(failure: AnthropicSlowModeFailure, options: AnthropicSlowModeHookOptions): Promise<AnthropicSlowModeRetry | undefined>;
}
/**
 * Slow-lane state keyed by Claude account (`cred:<id>` / `key:<hash>`, see
 * {@link AnthropicSlowModeHooks}): one account's wall, offer, and waits never
 * leak into requests served by another. Process-wide so the main agent,
 * subagents, and advisors on the same account share one lane.
 */
export declare class AnthropicSlowModeLanes {
    #private;
    /** The lane for `key`, created on first use. */
    lane(key: string): AnthropicSlowModeController;
    /**
     * Build provider hooks for one request. `options` scopes auto-accept gating
     * and notices to the requesting session; `onLane` reports which account
     * lane served it so the session's `/slow` and status line follow it.
     */
    hooks(options: AnthropicSlowModeHookOptions & {
        onLane?: (lane: string) => void;
    }): AnthropicSlowModeHooks;
}
/** The process-wide lane registry shared by every session in this process. */
export declare const anthropicSlowModeLanes: AnthropicSlowModeLanes;
/**
 * Auto-accept gate: take the slow lane only when no sibling Claude OAuth
 * account has full-speed headroom. With one account there is nothing to
 * rotate to; with several, turn recovery's credential rotation wins while any
 * other account is still healthy. A failed health probe accepts — the user
 * opted in and the alternative is waiting for the reset.
 */
export declare function anthropicSlowModeHasNoSiblingHeadroom(authStorage: AuthStorage, model: Model, sessionId: string | undefined): Promise<boolean>;
export {};
