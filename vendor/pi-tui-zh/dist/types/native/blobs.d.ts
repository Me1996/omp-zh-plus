/**
 * Content-addressed binary blobs (images) for `image` nodes.
 *
 * `describe()` registers the bytes and puts the returned id in `image.p.blob`;
 * the native backend uploads each referenced blob once per surface with verb
 * `b` before the frame that first references it.
 */
import type { TspProps } from "@oh-my-pi/pi-wire";
import type { NativeNode } from "./node.js";
export interface NativeBlob {
    readonly id: string;
    readonly mime: string;
    readonly bytes: Uint8Array;
}
/** Register `bytes` and return their content address (sha256 hex) for `image.p.blob`. */
export declare function registerNativeBlob(bytes: Uint8Array, mime: string): string;
/** A registered blob by id. */
export declare function getNativeBlob(id: string): NativeBlob | undefined;
/**
 * An `image` node for a base64 payload: the bytes are registered as a blob and
 * the pixel size probed from the header. Decoding and hashing cost real time,
 * so callers cache the node per payload ({@link NativeImageCache}).
 */
export declare function base64ImageNode(data: string, mimeType: string, p?: Omit<TspProps<"image">, "blob" | "builtin" | "w" | "h">, key?: string): NativeNode;
/** `image` nodes for base64 payloads, one per slot key, rebuilt only when the slot's payload changes. */
export declare class NativeImageCache {
    #private;
    get(key: string, data: string, mimeType: string): NativeNode;
}
