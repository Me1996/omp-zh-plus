/**
 * Credential-shaped token redaction for memory writes, shared by every backend.
 *
 * `recall` puts stored memories back into the prompt, so a stored credential reaches
 * every provider on every later turn. The `local` and `sharpshooter` backends each
 * carried a private copy of this pattern list. `mnemopi` carried none.
 */
export declare function redactMemorySecrets(input: string): string;
/**
 * Copy `value` with every text-bearing field and all nested metadata strings redacted.
 * Returns `value` itself when nothing changed, so a clean write allocates nothing.
 */
export declare function redactMemoryTextFields<T extends object>(value: T): T;
/**
 * Scrub a `remember(memory, options)` call pair. `memory` is either the content string
 * or an input object. `options` is `undefined` when the caller takes the facade default.
 */
export declare function redactRememberWrite<M extends string | object, O>(memory: M, options: O): [M, O];
