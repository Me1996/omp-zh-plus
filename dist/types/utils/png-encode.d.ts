export declare const PNG_SIGNATURE: Uint8Array<ArrayBuffer>;
/** Encode 8-bit RGB (3 channels) or RGBA (4 channels) pixels as a non-interlaced PNG. */
export declare function encodeRawPng(pixels: Uint8Array, width: number, height: number, channels: 3 | 4): Buffer;
