import type { ImageContent } from "@oh-my-pi/pi-ai";
/**
 * Incrementally removes terminal image control strings from subprocess output
 * and retains their images independently of the text sink's truncation policy.
 * Feed raw output here before ANSI sanitization or OutputSink buffering.
 */
export declare class TerminalGraphicsDecoder {
    #private;
    push(chunk: string): string;
    /** Finish parsing, returning text that only resembled a partial introducer. */
    finish(): string;
    /** Decode every completed image in stream order. Invalid frames are omitted. */
    images(): Promise<ImageContent[]>;
}
/** Encode an image as a Kitty direct PNG transmission. */
export declare function encodeTerminalImage(image: ImageContent): Promise<string>;
