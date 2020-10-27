import { Client as DiscordClient, Message as DiscordMessage } from "discord.js";
import { injectable } from "./di/Injectable";
import { DangerBotConfig } from "./DangerBotConfig";

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
        execCommand(message.content, message);
    }

    public async run(): Promise<void> {
        console.log("Starting bot");
        await this.discordClient.login(this.config.getDiscordToken());
    }
}
