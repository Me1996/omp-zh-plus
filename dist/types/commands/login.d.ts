/**
 * Log in to a model provider from the terminal.
 */
import { Command } from "@oh-my-pi/pi-utils/cli";
export default class Login extends Command {
    static description: string;
    static args: {
        provider: import("@oh-my-pi/pi-utils/cli").ArgDescriptor & {
            description: string;
            required: false;
        };
    };
    static examples: string[];
    run(): Promise<void>;
}
