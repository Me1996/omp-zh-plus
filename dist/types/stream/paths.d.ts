/**
 * Resolve the Unix socket or Windows named pipe `omp stream` listens on for
 * one project directory. Shares the daemon broker's canonical-cwd hashing so
 * every omp process in the same directory agrees on the endpoint.
 *
 * With `create`, the runtime directory is created (streamer side); sessions
 * only connect and must not create it.
 */
export declare function streamSocketEndpoint(projectDir: string, options?: {
    create?: boolean;
}): Promise<string>;
