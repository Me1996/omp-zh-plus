import type { ImageContent } from "@oh-my-pi/pi-ai";
import { type ExtensionAskDialogQuestion, type ExtensionAskDialogResult, type ExtensionUIContext, type ExtensionUIDialogOptions, type ExtensionUISelectItem } from "../../extensibility/extensions/index.js";
import { type BuiltSkillPromptMessage, type Skill, type SkillPromptInput } from "../../extensibility/skills.js";
import { type WordCompletionMethod } from "@oh-my-pi/pi-tui-zh/prompt/word-completion";
import { requestTextPrediction } from "../../predict/client.js";
import { type AgentSession } from "../../session/agent-session.js";
import type { EventBus } from "../../utils/event-bus.js";
import { type RpcLiveSessionFactory } from "./rpc-live.js";
import { RpcExtensionUserMessageTracker, RpcPromptResults, type RpcPromptTicket } from "./rpc-prompt-results.js";
import { RpcSubagentRegistry } from "./rpc-subagents.js";
import type { RpcCommand, RpcExtensionUIRequest, RpcExtensionUIResponse, RpcHostToolCallRequest, RpcHostToolCancelRequest, RpcHostToolResult, RpcHostToolUpdate, RpcHostUriCancelRequest, RpcHostUriRequest, RpcHostUriResult, RpcOpenSessionResult, RpcResponse } from "./rpc-types.js";
/**
 * `predict_word` answers for one RPC session, with the TUI provider's flow
 * control: one engine request in flight, and a newer request replaces the one
 * waiting behind it (the replaced request answers `null`), so a burst of
 * typing costs the shared daemon at most two inferences.
 */
export declare class RpcWordPredictor {
    #private;
    /** `request` is a test seam. */
    constructor(request?: typeof requestTextPrediction);
    /**
     * Ghost-text suffix for the word ending at `cursor`, or `null` when the
     * engine is off, nothing applies, or a newer request superseded this one.
     * Rejects when the prediction daemon cannot answer.
     */
    predict(method: WordCompletionMethod, text: string, cursor: number): Promise<string | null>;
}
export type * from "./rpc-types.js";
export type PendingExtensionRequest = {
    resolve: (response: RpcExtensionUIResponse) => void;
    reject: (error: Error) => void;
};
/** Pending extension UI request map that can fail closed when the RPC client disconnects. */
export declare class RpcPendingExtensionRequests extends Map<string, PendingExtensionRequest> {
    #private;
    set(id: string, request: PendingExtensionRequest): this;
    /** Reject every active and future extension UI request. */
    rejectAll(message: string): void;
}
type RpcOutput = (obj: RpcResponse | RpcExtensionUIRequest | RpcHostToolCallRequest | RpcHostToolCancelRequest | RpcHostUriRequest | RpcHostUriCancelRequest | object) => void;
export type RpcSessionChangeCommand = Extract<RpcCommand, {
    type: "new_session";
} | {
    type: "switch_session";
} | {
    type: "branch";
} | {
    type: "fork";
}>;
export type RpcQueueModeCommand = Extract<RpcCommand, {
    type: "set_steering_mode";
} | {
    type: "set_follow_up_mode";
} | {
    type: "set_interrupt_mode";
}>;
export type RpcSessionChangeResult = {
    type: "new_session";
    data: {
        cancelled: boolean;
    };
} | {
    type: "switch_session";
    data: {
        cancelled: boolean;
    };
} | {
    type: "branch";
    data: {
        text: string;
        cancelled: boolean;
    };
} | {
    type: "fork";
    data: {
        cancelled: boolean;
    };
};
export type RpcSessionChangeSession = Pick<AgentSession, "newSession" | "switchSession" | "branch" | "fork">;
export type RpcSkillCommandSession = Pick<AgentSession, "promptCustomMessage" | "skills" | "skillsSettings">;
export type RpcSkillCommandResult = {
    agentInvoked: true;
};
export interface RpcSkillInvocation extends SkillPromptInput {
    skill: Skill;
    queueChipText: string;
}
/**
 * Fast in-memory pre-check for a skill invocation: settings gate, text shape,
 * and skill lookup. Returns null when the message is not a runnable skill
 * command. Performs no I/O — safe to run on the RPC serial queue.
 */
export declare function resolveRpcSkillInvocation(session: RpcSkillCommandSession, text: string): RpcSkillInvocation | null;
/**
 * Slow half of a skill invocation: builds the skill prompt message (file I/O)
 * and dispatches it through the full prompt pipeline (usage preflight,
 * compaction checks, provider calls). Resolves once the turn is scheduled.
 * Must not run on the RPC serial queue's response path — register it with
 * watchAndReportPromptResult and answer the command once it is admitted.
 */
export declare function runRpcSkillCommand(session: RpcSkillCommandSession, invocation: RpcSkillInvocation, streamingBehavior?: "steer" | "followUp", prebuilt?: BuiltSkillPromptMessage, onPromptAdmitted?: () => void, images?: ImageContent[]): Promise<boolean>;
/**
 * Skill branch of the `prompt` command: resolves the invocation cheaply, then
 * registers the slow dispatch with watchAndReportPromptResult and awaits
 * admission (or completion, for a message that settles without ever being
 * admitted) before answering. The caller still does not wait for the full
 * dispatch pipeline — building the skill prompt and running it (usage
 * preflight, compaction, provider calls) can outlast any client's prompt
 * timeout under provider stress; only queue admission gates the response.
 *
 * @returns `null` for a non-skill message, `"cancelled"` when `isCurrent`
 *   reports the submission was invalidated while the skill file was read.
 */
export declare function dispatchRpcSkillPrompt(input: {
    ticket: RpcPromptTicket;
    session: RpcSkillCommandSession;
    message: string;
    streamingBehavior: "steer" | "followUp" | undefined;
    results: RpcPromptResults;
    onError: (error: Error) => void;
    extensionUserMessageTracker: RpcExtensionUserMessageTracker;
    images?: ImageContent[];
    isCurrent?: () => boolean;
}): Promise<RpcSkillCommandResult | "cancelled" | null>;
export declare function tryRunRpcSkillCommand(session: RpcSkillCommandSession, text: string, streamingBehavior?: "steer" | "followUp", images?: ImageContent[]): Promise<RpcSkillCommandResult | false>;
/**
 * Dependencies for {@link dispatchRpcInputFrame}. Provided by the RPC mode
 * entrypoint; broken out so tests can drive the input loop with stubs.
 */
export interface RpcInputFrameDeps {
    handleCommand: (command: RpcCommand) => Promise<RpcResponse>;
    output: RpcOutput;
    errorResponse: (id: string | undefined, command: string, message: string) => RpcResponse;
    trackBackgroundTask?: (task: Promise<void>) => void;
    pendingExtensionRequests: Map<string, PendingExtensionRequest>;
    onHostToolResult: (frame: RpcHostToolResult) => void;
    onHostToolUpdate: (frame: RpcHostToolUpdate) => void;
    onHostUriResult: (frame: RpcHostUriResult) => void;
}
/** Dispatch side-channel frames that must overtake the serialized command queue. */
export declare function dispatchRpcControlFrame(parsed: unknown, deps: RpcInputFrameDeps): boolean;
/**
 * Dispatch a single parsed frame from the RPC input stream.
 *
 * `bash`, `predict_word`, `prompt` and `steer_subagent` are dispatched in the
 * background so the caller can keep reading subsequent frames while one is
 * still settling: a `bash` command can run for a long time, and a `prompt`
 * command's response is held until the message is admitted, which can span
 * real wall-clock time (image normalization, a vision-model description call).
 * `steer_subagent` likewise holds its response until the subagent accepts the
 * message, which for a subagent between turns includes its whole
 * pre-`agent_start` setup. Backgrounding them lets a client send `abort_bash`
 * while a shell command runs, or `abort` (and `steer`/`follow_up`/`get_state`)
 * while a `prompt` or `steer_subagent` is still admitting. `predict_word` is
 * backgrounded too, so a cold prediction engine never stalls the command queue
 * behind a keystroke. `live_start` responds only once the realtime session is
 * connected and recording, so it is backgrounded and `live_stop` can cancel it.
 * Response correlation is preserved via each command's `id`; ordering across
 * concurrent commands is not guaranteed and clients MUST match on `id`.
 *
 * @returns `undefined` when the frame was routed to a side-channel handler
 *   (extension UI response, host tool/URI frames) or dispatched in the
 *   background (`bash`, `predict_word`, `live_start`, `prompt`, `steer`, `follow_up`, `steer_subagent`). Otherwise a promise that
 *   resolves once the response for the command has been emitted via `output`.
 *   Errors from `handleCommand` on a command dispatched inline propagate; the
 *   caller is expected to wrap them.
 */
export declare function dispatchRpcInputFrame(parsed: unknown, deps: RpcInputFrameDeps): Promise<void> | undefined;
/**
 * Orders user input and decides whether an accepted frame is still wanted.
 *
 * Every user-input, abort and session-change frame gets a sequence number when it
 * is accepted (read from stdin), not when its handler runs. An abort invalidates
 * input accepted before it immediately. A session change invalidates input accepted
 * before the change frame, and only once the change succeeds: a vetoed change keeps
 * that input, and input pipelined after the change still runs in the new session.
 */
export declare class RpcUserInputGate {
    #private;
    /** Call from {@link RpcInputDispatcher.dispatch} before the handler is queued. */
    accept(command: RpcCommand): void;
    /** A session change succeeded: invalidate input accepted before its frame. */
    commitSessionChange(command: RpcCommand): void;
    /** False when an abort, or a successful session change, accepted after this frame invalidated it. */
    isCurrent(command: RpcCommand): boolean;
    /** Run user-input work in accept order. The tail releases when `work` settles, not when a model turn ends. */
    enqueue<T>(work: () => Promise<T>): Promise<T>;
}
/** Starts prompts, steers, follow-ups and `steer_subagent` after earlier ordinary commands, without
 * awaiting admission. Control frames, `bash` and `predict_word` dispatch immediately (see
 * dispatchRpcInputFrame). `acceptInput` runs synchronously in {@link dispatch}, before the
 * handler is queued, so an abort can invalidate a frame that has not started yet. */
export declare class RpcInputDispatcher {
    #private;
    constructor(options: {
        deps: RpcInputFrameDeps;
        afterSerialCommand?: () => Promise<void>;
        acceptInput?: (command: RpcCommand) => void;
    });
    /** Accept a parsed input frame without blocking the stdin reader. */
    dispatch(parsed: unknown): void;
    /** Await every accepted serial command, including commands queued before EOF. */
    drain(): Promise<void>;
}
/**
 * Coordinates deferred shutdown with in-flight background input tasks.
 *
 * `pi.shutdown()` from an extension only *requests* shutdown; the process must
 * not exit while a background-dispatched command (`bash`, `predict_word`,
 * `prompt` or `steer_subagent`, see
 * {@link dispatchRpcInputFrame}) still owes the client a response frame. The
 * coordinator tracks those tasks, re-checks the shutdown request whenever one
 * settles (covering a shutdown requested mid-command with no follow-up client
 * frame), and drains every tracked task before invoking `performShutdown`.
 * The shutdown sequence is latched so concurrent triggers (input loop and
 * settling tasks) run it exactly once.
 */
export declare class RpcShutdownCoordinator {
    #private;
    constructor(options: {
        isShutdownRequested: () => boolean;
        performShutdown: () => Promise<void>;
    });
    /**
     * Track a background input task. When it settles it is untracked and the
     * shutdown request is re-checked, so a deferred shutdown fires even when
     * no further client frames arrive.
     */
    track(task: Promise<void>): void;
    /** Await every tracked task, including tasks tracked while draining. */
    drain(): Promise<void>;
    /**
     * If shutdown was requested, drain background tasks (so every owed
     * response frame is written) before running the shutdown sequence.
     */
    checkShutdownRequested(): Promise<void>;
}
export type RpcSubagentResetRegistry = Pick<RpcSubagentRegistry, "clear">;
/**
 * Handle RPC `cancel_subagent`: hard-kill one of this session's running
 * subagents through the same path as the Agent Hub / collab `kill` command.
 * Aborting the live turn and releasing the registry ref as an `aborted`
 * tombstone settles the owning `task` call (foreground or background) with an
 * aborted result, and disposing the session cancels its nested children.
 *
 * Only ids this session reported as running are reachable (see
 * {@link resolveOwnedLiveSubagent}). Returns `false` (a no-op) for unknown,
 * finished, or already-cancelled subagents so hosts can treat cancelling a
 * vanished subagent as success. Rejects when the tombstone cannot be persisted
 * or the abort fails; the subagent is still detached and disposed.
 */
export declare function handleRpcCancelSubagent(subagentRegistry: Pick<RpcSubagentRegistry, "getSubagents">, subagentId: string): Promise<boolean>;
/**
 * Handle RPC `steer_subagent`: send the host's message to a running subagent
 * as its user, the same way Agent Hub chat does: `AgentLifecycleManager.ensureLive`,
 * then `prompt(message, { streamingBehavior: "steer" })` on the subagent's own
 * session. A mid-turn subagent is steered at its next step boundary; one
 * between turns starts its next turn. Because this is `prompt()`, extension,
 * custom and file slash commands run and prompt templates expand as in Agent
 * Hub chat (unlike RPC `steer`, which rejects extension commands). The message
 * is recorded in the subagent's transcript, never attributed to the parent.
 *
 * Only running subagents this session lists in `get_subagents` are reachable
 * (see {@link resolveOwnedLiveSubagent}); one whose result the parent already
 * accepted is refused. A running ref always holds a live session, so
 * `ensureLive` never revives here; it only cancels an in-flight idle park.
 *
 * Resolves once the message is accepted: queued into a running turn, or the
 * subagent's new turn started (`agent_start`). A refusal before that —
 * including a prompt dropped by an abort, disposal or usage preflight — is
 * returned as the error; the rest of the turn is not awaited and later
 * failures are logged. Returns an error message, or `undefined` once accepted.
 */
export declare function handleRpcSteerSubagent(subagentRegistry: Pick<RpcSubagentRegistry, "getSubagents">, subagentId: string, message: string): Promise<string | undefined>;
export declare function handleRpcSessionChange(session: RpcSessionChangeSession, command: RpcSessionChangeCommand, subagentRegistry?: RpcSubagentResetRegistry): Promise<RpcSessionChangeResult>;
export type RpcOpenSessionSession = Pick<AgentSession, "newSession" | "switchSession" | "sessionFile" | "sessionId" | "messages">;
/**
 * Continue the newest non-empty session in `sessionDir`, or start a fresh one
 * there — the runtime equivalent of `--session-dir <dir> --continue`, so a host
 * can bind a pre-spawned process to a conversation it keys by directory.
 * Reopening the session that is already active is a no-op and does not abort a run.
 *
 * @throws Error when the process runs without session persistence (`--no-session`).
 */
export declare function openRpcSession(session: RpcOpenSessionSession, sessionDir: string, subagentRegistry?: RpcSubagentResetRegistry): Promise<RpcOpenSessionResult>;
/** Sends an RPC select request while retaining aligned option descriptions. */
export declare function requestRpcSelect(pendingRequests: Map<string, PendingExtensionRequest>, output: RpcOutput, title: string, options: ExtensionUISelectItem[], dialogOptions?: ExtensionUIDialogOptions): Promise<string | undefined>;
/** Sends all ask questions as one RPC `ask` dialog; a timeout answers every question with its recommended option. */
export declare function requestRpcAskDialog(pendingRequests: Map<string, PendingExtensionRequest>, output: RpcOutput, questions: ExtensionAskDialogQuestion[], dialogOptions?: ExtensionUIDialogOptions): Promise<ExtensionAskDialogResult | undefined>;
export declare function requestRpcEditor(pendingRequests: Map<string, PendingExtensionRequest>, output: RpcOutput, title: string, prefill?: string, dialogOptions?: ExtensionUIDialogOptions, editorOptions?: {
    promptStyle?: boolean;
}): Promise<string | undefined>;
/** Sends an RPC extension dialog and cancels the remote presentation when its signal aborts. */
export declare function requestRpcDialog<T>(pendingRequests: Map<string, PendingExtensionRequest>, output: RpcOutput, opts: ExtensionUIDialogOptions | undefined, defaultValue: T, request: Record<string, unknown>, parseResponse: (response: RpcExtensionUIResponse) => T): Promise<T>;
/**
 * Applies a queue-mode RPC command to the calling session only. Owns the
 * `persist: false` contract (#11555) in one place so no dispatcher arm can
 * silently restore machine-global writes.
 */
export declare function applyRpcQueueModeCommand(session: AgentSession, command: RpcQueueModeCommand): void;
/**
 * Report a store failure as an error `notice` frame and a session move as a
 * warning one (each with a stderr mirror) — issue #11493. Frames go straight
 * through the mode's `output` rather than `session.emitNotice`: dispose clears
 * the session's event listeners before it closes the store (agent-session.ts
 * `#doDispose`), so a failure latched during `close()` would have no subscriber
 * left to forward it and the client would see a nonzero exit with no notice at
 * all. `onFailure` records the failure for the mode's own teardown
 * attribution: a failure still latched at dispose is what makes
 * `session.dispose()` reject.
 */
export declare function registerRpcPersistenceSurface(session: Pick<AgentSession, "sessionManager">, output: (frame: object) => void, onFailure?: (error: Error) => void): () => void;
/** Startup options for {@link runRpcMode}. */
export interface RpcModeOptions {
    /** `--mode rpc-ui`: route tool UI (e.g. ask) over the protocol, independently of headless extensions. */
    setToolUIContext?: (uiContext: ExtensionUIContext, hasUI: boolean) => void;
    /** `--no-ui`: extensions run with `hasUI=false` and no UI frames; tool UI and host-issued login are unaffected. */
    headless?: boolean;
    subagentEventBus?: EventBus;
    input?: ReadableStream<Uint8Array>;
    /** Builds `live_start` sessions; defaults to the real {@link LiveSessionController}. */
    createLiveSession?: RpcLiveSessionFactory;
}
/**
 * Run in RPC mode.
 * Listens for JSON commands on stdin, outputs events and responses on stdout.
 */
export declare function runRpcMode(session: AgentSession, options?: RpcModeOptions): Promise<never>;
