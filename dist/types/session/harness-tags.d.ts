/**
 * Keep agent- or job-authored text from closing the harness block it is
 * rendered into, or opening a forged one such as a parent's `<irc from="parent">`.
 * Only harness tag names are escaped, so code, placeholders and the harness's
 * own nested `<task-result>` envelope reach the model unchanged.
 */
export declare function escapeHarnessTags(text: string): string;
