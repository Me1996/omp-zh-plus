import { Command } from "@oh-my-pi/pi-utils/cli";
export default class Toks extends Command {
    static description: string;
    static args: {
        input: import("@oh-my-pi/pi-utils/cli").ArgDescriptor & {
            description: string;
            required: true;
            multiple: true;
        };
    };
    static flags: {
        json: import("@oh-my-pi/pi-utils/cli").FlagDescriptor<"boolean"> & {
            description: string;
        };
    };
    static examples: string[];
    run(): Promise<void>;
}
