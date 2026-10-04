/** Count Unicode scalar values, matching Python string length semantics. */
export declare function codePointLength(text: string): number;
/** Slice by Unicode scalar offsets rather than UTF-16 code units. */
export declare function sliceCodePoints(text: string, start: number, end?: number): string;
