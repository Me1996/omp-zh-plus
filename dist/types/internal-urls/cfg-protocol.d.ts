import type { Settings } from "../config/settings.js";
import type { InternalResource, InternalUrl, InternalWriteResult, ProtocolHandler, ResolveContext, SchemeHost, SchemeSpec, UrlCompletion, WriteContext } from "./types.js";
/** A settings change awaiting the user's decision. Values are display-formatted, credentials redacted. */
export interface CfgChangeRequest {
    path: string;
    previous: string;
    value: string;
    /** Persist to config.yml instead of scoping the change to the session. */
    save: boolean;
    /** Higher layer that will keep a `/save` from taking effect here (e.g. `project config`); absent when it applies. */
    shadowedBy?: string;
}
/** An approved change that took effect on one {@link Settings} instance. */
export interface CfgAppliedChange {
    path: string;
    /** Effective value on {@link settings} after the change. */
    value: unknown;
    settings: Settings;
    /** Whether the change was persisted to config.yml. */
    save: boolean;
}
/**
 * The user's answer to a {@link CfgChangeRequest}: `once` applies this change, `session`
 * also approves later writes of the same kind for the rest of the session (a session grant
 * from a `/save` prompt covers saves and session changes), `deny` declines, and `timeout`
 * means nobody answered, so the write fails and the agent carries on without it.
 */
export type CfgApproval = "once" | "session" | "deny" | "timeout";
/** Host UI that approves `cfg://` writes, plus the disk-backed settings `/save` persists to. */
export interface CfgApprovalHost {
    /** Asks the user; dismissing the prompt must resolve `deny`. */
    approve(request: CfgChangeRequest): Promise<CfgApproval>;
    /**
     * Called once per settings instance whose value changed, so the host can apply
     * side effects reserved for the user's in-process choices (a `defaultThinkingLevel`
     * change also switches the live session).
     */
    applied(change: CfgAppliedChange): void;
    persistentSettings: Settings;
}
/**
 * Register the process-global approval host for `cfg://` writes. `/save`
 * persists through its disk-backed settings even when the calling session's
 * `Settings` is a separate instance. Passing `null` clears it; without a host
 * every write is refused, since nobody can approve it.
 */
export declare function setCfgApprovalHost(host: CfgApprovalHost | null): void;
export declare class CfgProtocolHandler implements ProtocolHandler {
    readonly scheme = "cfg";
    readonly spec: SchemeSpec;
    /** Advertised only where writes can be approved; subagents and headless sessions never see `cfg://`. */
    promptDoc(host: SchemeHost): string | undefined;
    resolve(url: InternalUrl, context?: ResolveContext): Promise<InternalResource>;
    write(url: InternalUrl, content: string, context?: WriteContext): Promise<InternalWriteResult>;
    complete(): Promise<UrlCompletion[]>;
}
