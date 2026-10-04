/**
 * Version of a {@link SecretObfuscator}'s registry: every collection redaction
 * reads is a tracked collection bound to one revision, and each effective
 * write bumps it. Results reused across calls are keyed by `value`, so a write
 * can never leave a stale result in place — there is no separate invalidation
 * step to forget.
 */
export declare class RegistryRevision {
    value: number;
    bump(): void;
}
/** Map whose effective writes bump a {@link RegistryRevision}. */
export declare class TrackedMap<K, V> implements ReadonlyMap<K, V> {
    #private;
    constructor(revision: RegistryRevision);
    /** Number of effective writes to this map alone; lets derived data follow just this map. */
    get version(): number;
    get size(): number;
    get(key: K): V | undefined;
    has(key: K): boolean;
    set(key: K, value: V): this;
    keys(): MapIterator<K>;
    values(): MapIterator<V>;
    entries(): MapIterator<[K, V]>;
    forEach(callback: (value: V, key: K, map: ReadonlyMap<K, V>) => void, thisArg?: unknown): void;
    [Symbol.iterator](): MapIterator<[K, V]>;
}
/** Set whose effective writes bump a {@link RegistryRevision}. */
export declare class TrackedSet<T> {
    #private;
    constructor(revision: RegistryRevision);
    get size(): number;
    has(value: T): boolean;
    add(value: T): this;
    [Symbol.iterator](): SetIterator<T>;
}
