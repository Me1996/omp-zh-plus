/**
 * Memoization for `describe()`: an unchanged component must hand the
 * reconciler the same node objects, so it can skip the subtree. {@link Memo}
 * is the one primitive; {@link OwnerMemo} keys it by an object for stateless
 * renderers (tool describe hooks) that re-describe the same args/result.
 */
import type { NativeNode } from "./node.js";
/** Element-wise identity (`Object.is`) of two arrays; `undefined` never matches. */
export declare function sameItems<T>(a: readonly T[] | undefined, b: readonly T[]): boolean;
/** Shallow equality of two flat prop bags built by successive describe calls. */
export declare function sameProps<T extends object>(a: T | undefined, b: T): boolean;
/** Keeps the last built value while every dependency is unchanged (`Object.is` per slot). */
export declare class Memo<T = NativeNode> {
    #private;
    get(deps: readonly unknown[], build: () => T): T;
    /** Forget the cached value (theme, glyph preset or keybindings changed). */
    clear(): void;
}
/**
 * One {@link Memo} per owner object, kept in a symbol slot on the owner; each
 * instance owns its own slot, so call and result views of one object don't
 * collide. Builds uncached without an owner or when the owner is frozen.
 */
export declare class OwnerMemo<T> {
    #private;
    get(owner: object | undefined, deps: readonly unknown[], build: () => T): T;
}
