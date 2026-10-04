import type { AgentSession } from "../../session/agent-session.js";
export declare const GALLERY_CONTEXT_WINDOW = 200000;
export interface GallerySessionOptions {
    contextTokens?: number;
    fastMode?: boolean;
    advisorStatus?: "running" | "quota_exhausted" | "error" | "paused";
    advisorYielded?: boolean;
    usingSubscription?: boolean;
    cost?: number;
    premiumRequests?: number;
    advisorCost?: number;
    goalStatus?: "active" | "paused" | "complete" | "budget-limited" | "dropped";
}
/** Deterministic session double for production composer/status renderers. */
export declare function createGallerySession(options?: GallerySessionOptions): AgentSession;
