/** Outcome of {@link waitForRelayExtension}. */
export type RelayWaitOutcome = 
/** `/json/version` has the required relay and extension capabilities. */
"ready"
/** Nothing (or something that is not a relay) is serving the endpoint. */
 | "unreachable"
/** The relay is serving but no extension connected within the dial window. */
 | "no-extension"
/** An older relay server is still running. */
 | "outdated-relay"
/** The relay extension is older than the running server. */
 | "outdated-extension";
/**
 * Poll the relay at `cdpUrl` until its extension is connected. Gives up
 * immediately when nothing serves the endpoint, after one dial window when
 * an extension has connected before (service-worker revival), or as soon as
 * the server has been up a full dial window without ever seeing one.
 */
export declare function waitForRelayExtension(cdpUrl: string, signal?: AbortSignal): Promise<RelayWaitOutcome>;
