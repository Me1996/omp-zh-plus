/**
 * Date/cwd reminder injection.
 *
 * The system prompt must stay byte-stable so open-weight chat templates that
 * render tool schemas *after* the system content keep their prefix cache
 * (#7404). The per-request date/cwd line used to live at the tail of the
 * system prompt (`project-prompt.md`), which invalidated the whole tool array
 * on every directory change or day rollover. It now rides on the first user
 * turn of each provider request instead: built at request time (never stored
 * in the session), deterministic per `(date, cwd)`, so the bytes are stable
 * for the lifetime of a session/day and refresh automatically at midnight.
 */
import type { Context } from "@oh-my-pi/pi-ai";
/** Renders the reminder text for the given local calendar date and cwd. */
export declare function renderDateCwdReminder(date: string, cwd: string): string;
/**
 * Keeps volatile date/cwd reminders append-only across provider requests.
 *
 * The first value is attached to the first user turn. A changed value attaches
 * to a newly appended user turn or a persistent developer turn, leaving every
 * previously sent message byte-identical.
 */
export declare class DateCwdReminderInjector {
    #private;
    /** Apply the current reminder while preserving all earlier injected bytes. */
    transform(context: Context, date: string, cwd: string): Context;
}
