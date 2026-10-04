import { Command } from "@oh-my-pi/pi-utils/cli";
export default class Play extends Command {
    static description: string;
    static args: {
        file: import("@oh-my-pi/pi-utils/cli").ArgDescriptor & {
            description: string;
        };
    };
    static flags: {
        speed: import("@oh-my-pi/pi-utils/cli").FlagDescriptor<"string"> & {
            char: string;
            description: string;
        };
        "idle-limit": import("@oh-my-pi/pi-utils/cli").FlagDescriptor<"string"> & {
            char: string;
            description: string;
        };
    };
    static examples: string[];
    run(): Promise<void>;
}
