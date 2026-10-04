import type { MemoryBackend } from "../memory-backend/types.js";
import type { AgentSession } from "../session/agent-session.js";
/** Release session-owned extraction and scheduler subscriptions. */
export declare function releaseSharpshooterSession(session: AgentSession): void;
export declare const sharpshooterBackend: MemoryBackend;
