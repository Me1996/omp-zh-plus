import type { TspSpan, TspText, TspTone } from "@oh-my-pi/pi-wire";
import type { NativeChild, NativeNode } from "../native/node.js";
import { type ParsedDiagnostic } from "../render/render-utils.js";
import type { FileDiagnosticsResult } from "./lsp.js";
import { type OutputMeta } from "./output-meta.js";
import type { NativeToolHead, NativeToolView, ToolRenderResult } from "./renderer.js";
/** A path for native heads: relative to the working directory when inside it, else `~`-shortened. */
export declare function displayPath(filePath: string): string;
/** `file://` link for a head's path target, when the path is absolute. */
export declare function fileHref(filePath: string | undefined): string | undefined;
/** Diff stats as one head `meta` string, `+8 −1` (U+2212 minus), or undefined when nothing changed. */
export declare function diffStatsMeta(added: number, removed: number): string | undefined;
/**
 * One file of a multi-file edit: a borderless `section` headed by the path
 * (→ rename) and its `+a −d`, over the file's body (its diff, diagnostics).
 */
export declare function fileDiffSection(file: {
    path: string;
    rename?: string;
    added?: number;
    removed?: number;
}, body: readonly NativeChild[], p: {
    role: string;
    tone?: TspTone;
}): NativeNode;
/**
 * One 22px file row (role `omp.tool.file`) for read groups, grep files, glob
 * lists and find hits: a leading glyph (the file icon unless `lead` replaces
 * it), the path with a dim directory and a strong name (cut in the middle),
 * a quiet `range` suffix (`:13-36`), then an optional count `chip` and a
 * muted `detail`.
 */
export declare function fileRow(filePath: string, p?: {
    range?: string;
    chip?: {
        text: string;
        title?: string;
    };
    detail?: TspText;
    href?: string;
    lead?: NativeNode;
    icon?: string;
    tone?: TspTone;
    title?: string;
    key?: string;
}): NativeNode;
/**
 * Inline error view (§7.3 read error): error tone, the message's first line
 * after `—` in the head's meta, so a collapsed inline call never hides it,
 * and the full message as the body only when the head had to cut it short.
 */
export declare function inlineErrorView(head: NativeToolHead, message: string): NativeToolView;
/** Text blocks of a tool result joined by newlines, or `""`. */
export declare function resultText(result: ToolRenderResult<unknown>): string;
/**
 * Card head: the bold `toolTitle` title, then detail spans; string details
 * become muted plain text, empty details are skipped.
 */
export declare function toolHead(title: string, ...details: readonly (TspSpan | string | undefined)[]): TspSpan[];
/** Error body: wrapped error text, or a JSON `code` block when the message is structured. */
export declare function errorText(message: string): NativeNode;
/** Error card view: error tone, the tool head and the error body (`<title> failed` when empty). */
export declare function errorView(title: string, message: string, ...meta: readonly (string | undefined)[]): NativeToolView;
/** Wrapped placeholder or secondary line (`(no output)`, `No matches`, …); `lines` clamps it. */
export declare function noteText(message: string, token?: string, lines?: number): NativeNode;
/** Muted `a · b · c` metadata line, or undefined when there are no parts. */
export declare function statsText(parts: readonly string[]): NativeNode | undefined;
/** Warning line for truncation / artifact capture failures, or undefined. */
export declare function truncationNotice(meta: OutputMeta | undefined): NativeNode | undefined;
/**
 * The one final quiet line of a tool body (§7.2): `a · b` facts, then any
 * truncation / artifact-capture notice from `meta`; undefined when empty.
 */
export declare function footnoteText(parts: readonly string[], meta?: OutputMeta): NativeNode | undefined;
/** A diagnostic's severity glyph: `x-circle` error, `warn` warning, `info`, `lightbulb` hint, in the severity tone. */
export declare function diagnosticGlyph(severity: ParsedDiagnostic["severity"]): NativeNode;
/**
 * LSP diagnostics section for write/edit results: rows of severity icon ·
 * `line:col` · message, most severe first, capped at five with `+N more`.
 * Rows name the file too when the messages span several files (or `withPath`).
 * Undefined when there is nothing to show.
 */
export declare function diagnosticsSection(diagnostics: FileDiagnosticsResult | undefined, opts?: {
    withPath?: boolean;
}): NativeNode | undefined;
/** Head chip counting LSP diagnostics across files (`2 diagnostics`), or undefined when there are none. */
export declare function diagnosticsBadge(files: readonly (FileDiagnosticsResult | undefined)[]): {
    text: string;
    tone: TspTone;
} | undefined;
