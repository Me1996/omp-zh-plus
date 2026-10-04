import { Command } from "@oh-my-pi/pi-utils/cli";
export default class IfBench extends Command {
    static description: string;
    static args: {
        models: import("@oh-my-pi/pi-utils/cli").ArgDescriptor & {
            description: string;
            required: true;
            multiple: true;
        };
    };
    static flags: {
        turns: import("@oh-my-pi/pi-utils/cli").FlagDescriptor<"integer"> & {
            description: string;
        };
        length: import("@oh-my-pi/pi-utils/cli").FlagDescriptor<"integer"> & {
            description: string;
        };
        "max-tokens": import("@oh-my-pi/pi-utils/cli").FlagDescriptor<"integer"> & {
            description: string;
        };
        "nya-max": import("@oh-my-pi/pi-utils/cli").FlagDescriptor<"integer"> & {
            description: string;
        };
        par: import("@oh-my-pi/pi-utils/cli").FlagDescriptor<"integer"> & {
            description: string;
        };
        json: import("@oh-my-pi/pi-utils/cli").FlagDescriptor<"boolean"> & {
            description: string;
        };
    };
    static examples: string[];
    run(): Promise<void>;
}
