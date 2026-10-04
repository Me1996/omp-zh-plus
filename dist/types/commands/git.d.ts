/**
 * Fullscreen interactive git TUI: split-pane diff viewer with minimap, file
 * staging sidebar, and generated or manual commit composer.
 */
import { Command } from "@oh-my-pi/pi-utils/cli";
export default class Git extends Command {
    static description: string;
    static args: {
        revision: import("@oh-my-pi/pi-utils/cli").ArgDescriptor & {
            description: string;
            required: false;
        };
    };
    static flags: {
        dir: import("@oh-my-pi/pi-utils/cli").FlagDescriptor<"string"> & {
            char: string;
            description: string;
        };
    };
    static examples: string[];
    run(): Promise<void>;
}
