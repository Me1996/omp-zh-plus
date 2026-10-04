import { type SessionStatus } from "../session/session-listing.js";
/** A listed session. Times are ISO-8601. */
export interface ArchiveSession {
    id: string;
    /** Session JSONL file. */
    file: string;
    /** Working directory the session ran in. */
    project: string;
    /** Title, else first prompt, else a timestamp label. */
    title: string;
    created: string;
    modified: string;
    messages: number;
    status?: SessionStatus;
    /** Newest journaled idle recap. */
    recap?: string;
}
/** A project with its newest session. */
export interface ArchiveProject {
    /** Working directory; pass it as `project` to scope other views. */
    path: string;
    /** Session files in the project, empty ones included. */
    sessions: number;
    lastActive: string;
    latest: ArchiveSession;
}
/** A unique prompt from prompt history, with its latest submission's provenance. */
export interface ArchivePrompt {
    text: string;
    /** Latest submission time. */
    at: string;
    project?: string;
    session?: string;
    /** Submissions of this exact prompt. */
    uses: number;
}
/** A journaled idle recap. */
export interface ArchiveRecap {
    text: string;
    at: string;
    session: string;
    project: string;
}
/** One session with its full recap journal and prompt history. */
export interface ArchiveSessionDetail extends ArchiveSession {
    /** Session file this one was forked from. */
    parent?: string;
    /** Every journaled recap, oldest first. */
    recaps: ArchiveRecap[];
    /** Newest prompts submitted in this session, oldest first. */
    prompts: ArchivePrompt[];
}
/** Records plus the text rendering the prelude prints for them. */
export interface ArchiveView<T> {
    text: string;
    records: T;
}
/** Recent projects, newest activity first. */
export declare function archiveProjects(limit: number): Promise<ArchiveView<ArchiveProject[]>>;
/** Newest non-empty sessions of one project (`cwd`) or of every project. */
export declare function archiveSessions(cwd: string | undefined, limit: number): Promise<ArchiveView<ArchiveSession[]>>;
/**
 * One session by id prefix or absolute file path, with every recap and its
 * newest `limit` prompts.
 *
 * @throws {ToolError} when no session or several sessions match, or the file is not a session.
 */
export declare function archiveSession(idOrFile: string, limit: number): Promise<ArchiveView<ArchiveSessionDetail>>;
/** Prompt history of one project (`cwd`) or every project, newest first; `query` switches to token search. */
export declare function archivePrompts(query: string | undefined, cwd: string | undefined, limit: number): ArchiveView<ArchivePrompt[]>;
/** Journaled idle recaps of one project (`cwd`) or every project, newest first. */
export declare function archiveRecaps(cwd: string | undefined, limit: number): ArchiveView<ArchiveRecap[]>;
