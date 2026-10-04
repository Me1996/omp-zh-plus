import type { Context, Model } from "@oh-my-pi/pi-ai";
/** Drops oldest transient image blocks so outgoing vision requests fit the active provider's image cap. */
export declare function clampProviderContextImages(context: Context, model: Model): Context;
/**
 * Last line of defence before the wire: an undecodable image makes the provider
 * reject the entire request rather than the offending block, so one bad payload
 * anywhere in history leaves the session permanently unable to send. Degrades
 * those blocks to text and leaves everything else — including the `context`
 * object itself — untouched.
 *
 * Covers all three places outbound image bytes can hide: generic `content`, the
 * native `providerPayload` items that get replayed in place of that content, and
 * a computer result's `providerMetadata.screenshot`. Only bytes that actually
 * travel are checked — see {@link sendsInlineImageBytes}.
 */
export declare function dropUnreadableContextImages(context: Context, model: Model): Promise<Context>;
