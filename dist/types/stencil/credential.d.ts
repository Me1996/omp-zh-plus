/**
 * Bearer credential presented to Stencil services (`omp stream`, `omp clip`,
 * `omp skill`).
 *
 * `STENCIL_API_KEY` wins outright (debug and CI: `STENCIL_API_KEY=test omp
 * stream …`); otherwise the stencil.so credential stored by `/login` is used
 * and re-resolved on every call so a refreshed access token is sent after a
 * reconnect. `resolve()` returns null when neither exists.
 */
export declare class StencilCredential {
    #private;
    resolve(): Promise<string | null>;
    /** Human guidance for a missing credential. */
    static get missingMessage(): string;
    close(): void;
}
