import { type ClipUploadResponse } from "@oh-my-pi/pi-wire";
export interface ClipUploadOptions {
    /** Stream server base URL (`stream.serverUrl`), e.g. https://live.omp.sh. */
    serverUrl: string;
    /** Stencil bearer (see `StencilCredential`); the clip belongs to its account. */
    token: string;
    /** `.ompcast` file contents. */
    recording: string;
    /** Replaces the recording's title. */
    title?: string;
    description?: string;
}
/**
 * Publish a `/record` capture as a clip at `<server>/c/<id>`. The recording is
 * validated locally, its header stamped with title/description, and sent
 * gzip-compressed.
 *
 * @throws {Error} when the recording is malformed, the server URL is not
 *   http(s), or the server rejects the upload (its error message is included).
 */
export declare function uploadClip(options: ClipUploadOptions): Promise<ClipUploadResponse>;
