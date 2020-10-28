import { Client as DiscordClient, Message as DiscordMessage } from "discord.js";
import { injectable } from "./di/Injectable";
import { DangerBotConfig } from "./DangerBotConfig";

import { initialize as initializeNlpClassifier } from "./nlp/classifier";

import "./modules/GameModule";
import { execCommand } from "./Command";

@injectable()
export class DangerBot {
    /** Underlying Discord client to receive/send chat messages. */
    private readonly discordClient: DiscordClient;

    /**
     * Creates a new DangerBot(tm) instance.
     */
    constructor(
        private readonly config: DangerBotConfig
    ) {
        const client = this.discordClient = new DiscordClient();
        client.on("ready", () => this.processReady());
        client.on("message", message => this.processMessage(message));
    }

    private processReady(): void {
        console.log("Logged in as " + this.discordClient.user?.tag);
    }

    private processMessage(message: DiscordMessage): void {
        if (message.author.bot) {
            // We don't talk to filthy bots!
            return;
        }

        const text = message.cleanContent;
        if (message.channel.type === "dm") {
            // When send via direct message then every message is a full command
            this.processCommand(message, text);
        } else {
            const prefix = this.config.getCommandPrefix();
            if (text.startsWith(prefix)) {
                // When message is in text channel and starts with command prefix then process rest as command
                this.processCommand(message, text.substr(prefix.length));
            }
        }
    }

    private parseArguments(text: string): string[] {
        const regexp = /[^\s"]+|"([^"]*)"/gi;
        const args: string[] = [];
        let match: RegExpExecArray | null;
        while (match = regexp.exec(text)) {
            args.push(match[1] ? match[1] : match[0]);
        };
        return args;
    }

    private processCommand(message: DiscordMessage, text: string): void {
        const commandSplit = text.indexOf(" ");
        const command = commandSplit < 0 ? text : text.substr(0, commandSplit);
        const args = this.parseArguments(text.substr(command.length + 1));
        execCommand(command, message, args);
    }

    public async run(): Promise<void> {
        console.log("Starting bot");
        await initializeNlpClassifier();
        await this.discordClient.login(this.config.getDiscordToken());
    }
}
