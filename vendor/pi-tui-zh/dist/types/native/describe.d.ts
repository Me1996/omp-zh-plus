/**
 * Builders for {@link NativeNode}s, so `describe()` implementations read as
 * a tree instead of object literals.
 *
 * @example
 * describe() {
 *   return card({ role: "omp.tool.bash", status: "running", head: [span("Bash", "toolTitle")] }, [
 *     ansi(this.#output, { follow: true, preview: { lines: 10 } }),
 *   ]);
 * }
 */
import type { TspKind, TspProps, TspSpan, TspText } from "@oh-my-pi/pi-wire";
import type { NativeChild, NativeNode } from "./node.js";
/** A node of any kind. */
export declare function node<K extends TspKind>(k: K, p?: TspProps<K>, c?: readonly NativeChild[], key?: string): NativeNode;
/** One styled span; `s` is a space-separated list of semantic or theme tokens. */
export declare function span(t: string, s?: string, extra?: Omit<TspSpan, "t" | "s">): TspSpan;
/** Plain or styled text. */
export declare function text(content: TspText, p?: Omit<TspProps<"text">, "text" | "spans">): NativeNode;
/** Vertical stack. */
export declare function col(c: readonly NativeChild[], p?: TspProps<"col">): NativeNode;
/** Horizontal flex row. */
export declare function row(c: readonly NativeChild[], p?: TspProps<"row">): NativeNode;
/** Card with an optional header, status and collapsible body. */
export declare function card(p: TspProps<"card">, c: readonly NativeChild[]): NativeNode;
/** Markdown source in omp's dialect. */
export declare function md(source: string, p?: Omit<TspProps<"md">, "text">): NativeNode;
/** Highlighted code. */
export declare function code(source: string, p?: Omit<TspProps<"code">, "text">): NativeNode;
/** Raw terminal output rendered as a mini terminal. */
export declare function ansi(output: string, p?: Omit<TspProps<"ansi">, "text">): NativeNode;
/** Unified diff. */
export declare function diff(unified: string, p?: Omit<TspProps<"diff">, "text">): NativeNode;
/** A mounted, empty, invisible node for components that describe nothing. */
export declare const EMPTY_NODE: NativeNode;
/** `described` with a sibling identity key (the layout builders only take props). */
export declare function keyed(described: NativeNode, key: string): NativeNode;
/** `described` mounted but not laid out when `hidden` (cheap visibility toggles keep ids and view state). */
export declare function withHidden(described: NativeNode, hidden: boolean): NativeNode;
/** Stable node key for an arbitrary identity string; keys join into `/` keypaths, so identities are hashed. */
export declare function stableKey(identity: string): string;
/** Drop absent entries (`undefined`, `null`, `false`) from a child list. */
export declare function compact<T>(items: readonly (T | undefined | null | false)[]): T[];
/** A `kv` grid from label/value pairs with muted labels, skipping empty values; undefined when nothing is left. */
export declare function kv(pairs: readonly (readonly [string, TspText | undefined])[]): NativeNode | undefined;
/** One list `item`, keyed by the value select/activate events report back. */
export declare function item(key: string, p: TspProps<"item">): NativeNode;
/** A `list` of items. */
export declare function list(items: readonly NativeChild[], p?: TspProps<"list">, key?: string): NativeNode;
/** Terminal-clocked elapsed counter: `age` ms already elapsed; `stopped` freezes it there. */
export declare function elapsed(age: number, stopped?: boolean): NativeNode;
/**
 * Keycap for one key id (`"ctrl+o"` → keys `["ctrl", "o"]`); the terminal
 * draws platform glyphs. A literal `+` key survives (`"+"`, `"ctrl++"`).
 */
export declare function kbd(key: string, nodeKey?: string): NativeNode;
