import type { TerminalId, TerminalNotification } from "./terminal-capabilities.js";
/** Resolved notifier binary used to fan a notification out to D-Bus. */
export type DesktopNotifierKind = "notify-send" | "gdbus";
export interface DesktopNotifier {
    kind: DesktopNotifierKind;
    path: string;
}
/**
 * Whether the current process can reach a freedesktop notification daemon:
 * Linux platform plus either a session bus address in env or the
 * systemd user-bus socket at `$XDG_RUNTIME_DIR/bus`. Caller is still responsible for
 * resolving a delivery binary via {@link resolveDesktopNotifier}.
 */
export declare function hasLinuxDesktopSession(platform?: NodeJS.Platform, env?: NodeJS.ProcessEnv, fileExists?: (path: string) => boolean): boolean;
/**
 * Whether `sendNotification` should also dispatch a D-Bus toast for this
 * terminal. Returns true only when (1) the chosen `notifyProtocol` is BEL,
 * which cannot carry arbitrary toast text, (2) the host exposes a Linux desktop
 * session, and (3) the user has not opted out via `PI_NO_DESKTOP_NOTIFY=1`.
 * Terminals that genuinely speak OSC 9 / OSC 99 pass
 * `notifyProtocolIsBell=false` and are filtered before the D-Bus fallback can
 * run. Pure helper for tests and the singleton path.
 */
export declare function shouldDeliverDesktopNotification(_terminalId: TerminalId, notifyProtocolIsBell: boolean, platform?: NodeJS.Platform, env?: NodeJS.ProcessEnv): boolean;
/** Reset the cached notifier resolution. Tests only. */
export declare function resetDesktopNotifierCache(): void;
/**
 * Locate a libnotify-compatible delivery binary on `PATH`, preferring
 * `notify-send` (one-shot, no marshalling) and falling back to `gdbus call`
 * for hosts where libnotify is not installed but GLib is. Result is cached so
 * repeated notifications do not hit `$which` again.
 */
export declare function resolveDesktopNotifier(): DesktopNotifier | null;
/**
 * Build the argv that delivers `message` through the resolved notifier. Pure
 * helper so tests assert exact wire shape without spawning a child. Notes:
 * - `notify-send` accepts title + body positionally and a numeric expire
 *   timeout (`-t`); urgency is a flag.
 * - `gdbus call ... Notify` takes the freedesktop signature
 *   `s u s s s as a{sv} i`: app_name, replaces_id, app_icon, summary, body,
 *   actions, hints, expire_timeout. We feed hints with the urgency byte so
 *   the daemon classifies the toast identically to `notify-send`.
 */
export declare function buildDesktopNotifyCommand(notifier: DesktopNotifier, message: string | TerminalNotification): string[];
/**
 * Fire-and-forget D-Bus desktop notification. Resolves a notifier, spawns it
 * with stdio fully detached, and never throws — terminal notifications are
 * best-effort and must not block the renderer or interleave bytes onto
 * stdout. Caller is responsible for the gating check
 * ({@link shouldDeliverDesktopNotification}).
 */
export declare function sendDesktopNotification(message: string | TerminalNotification): void;
