import { type CredentialDisabledEvent } from "@oh-my-pi/pi-ai";
/** `notice` source of an automatic credential disable; print mode writes these to stderr. */
export declare const CREDENTIAL_DISABLED_NOTICE_SOURCE = "auth";
/**
 * Warning for a credential the auth layer signed out on its own, or `undefined` when the
 * provider has no `/login` entry (MCP OAuth servers re-authorize through their own flow).
 *
 * The provider's failure text is left out on purpose: it is provider-controlled, and it
 * stays in the log line and the stored disable cause.
 */
export declare function formatCredentialDisabledNotice(event: CredentialDisabledEvent): string | undefined;
