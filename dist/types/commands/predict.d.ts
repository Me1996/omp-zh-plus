import { Command } from "@oh-my-pi/pi-utils/cli";
export default class Predict extends Command {
    static description: string;
    static examples: string[];
    run(): Promise<void>;
}
