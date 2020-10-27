import { Client as DiscordClient } from "discord.js";
import { Message as DiscordMessage } from "discord.js";
import { Signal } from "./Signal";

export class DangerBot {

    /** Underlying Discord client to receive/send chat messages. */
    private readonly discordClient: DiscordClient;

    public readonly onConnect = new Signal<void>();
    public readonly onDisconnect = new Signal<void>();
    public readonly onMessage = new Signal<DiscordMessage>();

    /**
     * Creates a new DangerBot(tm) instance.
     * @param discordToken
     *   Secret token to use for authentication.
     */
    constructor(private readonly discordToken: string) {
        this.discordClient = new DiscordClient();
        this.initialize();
    }

    /**
     * Performs basic initialization.
     * Stuff that must be done, before the bot can start it's attempt to log in,
     * such as preparing all the signals.
     */
    protected initialize(): void {

        this.discordClient.on("connect", () => {
            this.onConnect.emit();
        });

        this.discordClient.on("disconnect", () => {
            this.onDisconnect.emit();
        });

        this.discordClient.on("message", (message) => {
            this.onMessage.emit(message);
        });

    }

    public async login(): Promise<void> {

        await this.discordClient.login(this.discordToken);

        // Just discard the returned token. It is not (yet?) useful for us and should
        // equal the one that we have passed to the login request anyhow.
        return;

    }

}
