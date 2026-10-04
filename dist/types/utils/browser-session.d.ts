import type { OAuthBrowserSessionRequest } from "@oh-my-pi/pi-ai/oauth/types";
/** Own an isolated sign-in browser; return one cookie value in preference order, never the cookie jar. */
export declare function captureBrowserSession(request: OAuthBrowserSessionRequest, signal?: AbortSignal): Promise<string>;
