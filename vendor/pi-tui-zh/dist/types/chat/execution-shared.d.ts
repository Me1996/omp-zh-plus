/**
 * Shared rendering primitives for bash/eval execution components.
 *
 * Each helper isolates a piece of structure both components share verbatim
 * (frame layout and post-run status line). Differences in
 * how each component prepares its header, output lines, or sixel masking
 * stay in their respective files.
 */
import { Loader } from "../components/loader.js";
import { Text } from "../components/text.js";
import { Container, type TUI } from "../tui.js";
import type { OutputArtifactError } from "../tools/streaming-output.js";
import { type TruncationMeta } from "../tools/output-meta.js";
import type { TspText } from "@oh-my-pi/pi-wire";
import type { NativeChild, NativeNode } from "../native/node.js";
/** Output rows shown while an execution is collapsed. */
export declare const PREVIEW_LINES = 20;
/** Maximum visible columns retained from an execution output line. */
export declare const MAX_DISPLAY_LINE_CHARS = 4000;
/** Clamp execution output by visible width without splitting ANSI sequences. */
export declare function clampDisplayLine(line: string): string;
export type ExecutionStatus = "running" | "complete" | "cancelled" | "error";
/** Theme color keys valid for an execution frame. */
export type ExecutionColorKey = "dim" | "bashMode" | "pythonMode";
/**
 * Build the spacer + top border + content container + bottom border scaffold
 * that bash and eval execution components share. The caller appends the
 * header (command vs `>>>` prompt) and the returned loader to
 * `contentContainer` so per-mode order is preserved.
 */
export declare function buildExecutionFrame(parent: Container, ui: TUI, colorKey: ExecutionColorKey): {
    contentContainer: Container;
    loader: Loader;
};
/**
 * Build the post-run status block (hidden-line hint, exit/cancel marker,
 * truncation notice). Returns undefined when there is nothing to display so
 * callers can skip appending a stray Text child.
 */
export declare function buildStatusFooter(opts: {
    status: ExecutionStatus;
    exitCode: number | undefined;
    truncation: TruncationMeta | undefined;
    artifactError?: OutputArtifactError;
    hiddenLineCount: number;
    /** Suppress the "… N more lines" hint (used when sixel passthrough renders the full output). */
    suppressHiddenCount?: boolean;
}): Text | undefined;
/** Inputs for {@link describeExecutionCard}. */
export interface ExecutionCardInput {
    readonly role: string;
    readonly head: TspText;
    /** Excluded from context (`!!`/`$$`): a muted card. */
    readonly muted: boolean;
    readonly status: ExecutionStatus;
    /** `performance.now()` when the run started; drives the live elapsed timer. */
    readonly startedAt: number;
    readonly expanded: boolean;
    /** Body nodes before the output (the eval cell's code). */
    readonly lead?: readonly NativeChild[];
    /** Raw terminal output. */
    readonly output: string;
    readonly images?: readonly NativeChild[];
    readonly exitCode: number | undefined;
    readonly truncation: TruncationMeta | undefined;
    readonly artifactError?: OutputArtifactError;
}
/**
 * Native card shared by user bash/eval runs: the head with a live `elapsed`
 * while running, the output as an `ansi` mini terminal that follows its tail
 * while running, a cancel hint spinner, then exit/truncation notes. The
 * terminal clamps the collapsed body and owns the "N more lines" affordance.
 */
export declare function describeExecutionCard(input: ExecutionCardInput): NativeNode;
/** Inputs for {@link describeExecutionTool}. */
export interface ExecutionToolInput {
    readonly role: string;
    /** Tool name for the head icon (`bash`, `eval`). */
    readonly name: string;
    readonly title: string;
    /** The command / cell source, shown once in the head. */
    readonly command: string;
    readonly lang: string;
    /** Excluded from context (`!!`/`$$`). */
    readonly excluded: boolean;
    readonly status: ExecutionStatus;
    /** `performance.now()` when the run started / ended. */
    readonly startedAt: number;
    readonly endedAt: number | undefined;
    readonly expanded: boolean;
    /** Raw terminal output. */
    readonly output: string;
    readonly images?: readonly NativeChild[];
    readonly exitCode: number | undefined;
    readonly truncation: TruncationMeta | undefined;
    readonly artifactError?: OutputArtifactError;
}
/**
 * A user `!`/`$` run as the agent's `tool` frame (§6.6): the command in the
 * head with a `you` badge (plus `not sent` when excluded from context), the
 * timer, exit chip and cancelled note; the body is the output as an `ansi`
 * mini terminal following its tail, then one quiet truncation line.
 */
export declare function describeExecutionTool(input: ExecutionToolInput): NativeNode;
/**
 * Derive the post-run status from an exit code + cancellation flag using the
 * same precedence both execution components apply.
 */
export declare function resolveExecutionStatus(exitCode: number | undefined, cancelled: boolean): ExecutionStatus;
