/** Read a token file; `null` when it is missing or blank. */
export declare function readTokenFile(file: string): Promise<string | null>;
/** Write a token file readable only by the current user. */
export declare function writeTokenFile(file: string, token: string): Promise<void>;
/** Generate a random URL-safe bearer token. */
export declare function generateToken(): string;
