import { Client as DiscordClient, Message as DiscordMessage } from "discord.js";
import { injectable } from "./di/Injectable";
import { DangerBotConfig } from "./DangerBotConfig";

import { initialize as initializeNlpClassifier } from "./nlp/classifier";

import "./modules/GameModule";
import { execCommand } from "./Command";
import { WordTokenizer } from 'natural';

@injectable()
export class DangerBot {

    /** Underlying Discord client to receive/send chat messages. */
    private readonly discordClient: DiscordClient;

    /** Tokenizer to use when de-composing incoming messages. */
    private readonly wordTokenizer = new WordTokenizer();

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

    private processCommand(message: DiscordMessage, text: string): void {
        const tokens = this.wordTokenizer.tokenize(text);
        const command = tokens.shift();
        if (command) {
            execCommand(command, message, tokens);
        }
    }

    public async run(): Promise<void> {
        console.log("Starting bot");
        await initializeNlpClassifier();
        await this.discordClient.login(this.config.getDiscordToken());
    }
}
