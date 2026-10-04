import type { Recording } from "./recording.js";
export interface PlayOptions {
    /** Playback rate multiplier; 2 plays twice as fast. */
    speed: number;
    /** Cap on any pause between frames, in recording milliseconds. */
    idleLimitMs?: number;
}
/**
 * Play a recording in the controlling terminal until it ends or the viewer
 * quits. Keys: space pauses/resumes, `q`/Esc/Ctrl-C quits.
 */
export declare function playRecording(recording: Recording, options: PlayOptions): Promise<void>;
