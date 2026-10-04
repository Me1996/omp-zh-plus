/**
 * Commit-author avatar loading for the git TUI.
 *
 * Resolution order: GitHub-noreply address → Gravatar (`d=404` so misses fall
 * through) → GitHub commits API when the repo has a github remote. Hits are
 * normalized to a 64px PNG via `Bun.Image` and cached in ~/.omp/cache/avatars;
 * definite misses leave a `.miss` marker so offline sessions stay quiet. When
 * no photo exists (or the terminal cannot draw images) the sidebar falls back
 * to a deterministic half-block identicon supplied by the view.
 */
/**
 * Async avatar cache keyed by author email. `get()` never blocks: it returns
 * the cached PNG (base64), `null` for a known miss, or `undefined` while a
 * background load is in flight (the loader re-renders via `onReady`).
 */
export declare class AvatarLoader {
    #private;
    constructor(onReady: () => void);
    /** Base64 PNG, `null` on definite miss, `undefined` while loading. */
    get(email: string, cwd: string): string | null | undefined;
}
