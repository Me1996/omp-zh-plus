/** Encode 16 kHz mono float PCM chunks as a 16-bit little-endian WAV file. */
export declare function encodePcm16Wav(chunks: readonly Float32Array[], sampleRate?: number): Uint8Array;
