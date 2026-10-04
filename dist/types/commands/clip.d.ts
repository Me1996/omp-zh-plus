import { Command } from "@oh-my-pi/pi-utils/cli";
export default class Clip extends Command {
    static description: string;
    static args: {
        file: import("@oh-my-pi/pi-utils/cli").ArgDescriptor & {
            description: string;
        };
    };
    static flags: {
        title: import("@oh-my-pi/pi-utils/cli").FlagDescriptor<"string"> & {
            char: string;
            description: string;
        };
        description: import("@oh-my-pi/pi-utils/cli").FlagDescriptor<"string"> & {
            char: string;
            description: string;
        };
        server: import("@oh-my-pi/pi-utils/cli").FlagDescriptor<"string"> & {
            description: string;
        };
    };
    static examples: string[];
    run(): Promise<void>;
}
