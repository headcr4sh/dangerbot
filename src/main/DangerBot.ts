import { Client as DiscordClient, Message as DiscordMessage } from "discord.js";
import { injectable } from "./di/Injectable";
import { DangerBotConfig } from "./DangerBotConfig";

import { classifier, initialize as initializeNlpClassifier } from "./nlp/classifier";

import "./modules/GameModule";
import { execCommand } from "./Command";
import { WordTokenizer } from 'natural';
import { exec } from 'child_process';

@injectable()
export class DangerBot {

    /** Underlying Discord client to receive/send chat messages. */
    private readonly discordClient: DiscordClient;

    /** Tokenizer to use when de-composing incoming messages. */
    private readonly wordTokenizer = new WordTokenizer();

    /** Classifier used to figure out what a user actually wants from us. */
    private readonly intentClassifier = classifier;

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

    /**
     * Figures out if this message is to be handled by the bot.
     * Basically, all direct messages sent to the bot are considered commands,
     * wheres messages received through a channel are only examined if they are
     * prefixed by either the command- or inquiry-prefix.
     *
     * Commands are the pure and strict form of communication with the bot, inquiries
     * on the other hand are parsed by the natural language processor subsystem and
     * then in turn converted to commands.
     * @param message
     */
    private processMessage(message: DiscordMessage): void {
        if (message.author.bot) {
            // We don't talk to filthy bots!
            return;
        }

        let text = message.cleanContent;
        const cmdPrefix = this.config.getCommandPrefix();
        const inqPrefix = this.config.getInquiryPrefix();

        if (text.startsWith(cmdPrefix)) {
            text = text.substr(cmdPrefix.length);
            this.processCommand(message, text);
        } else if (text.startsWith(inqPrefix)) {
            text = text.substr(inqPrefix.length);
            this.processInquiry(message, text);
        } else if (message.channel.type === "dm") {
            this.processCommand(message, text);
        }

    }

    private processCommand(message: DiscordMessage, text: string): void {
        console.log(text);
        const tokens = this.wordTokenizer.tokenize(text);
        const command = tokens.shift();
        if (command) {
            execCommand(command, message, tokens);
        }
    }

    private processInquiry(message: DiscordMessage, text: string): void {
        const classification = this.intentClassifier.classify(text);
        const considerClassification = this.intentClassifier.getClassifications(text).filter(cls => cls.value > 0.5).length > 0;
        const tokens: string[] = []; // TODO Tokens must be extracted somehow.

        if (!considerClassification) {
            execCommand("null", message, tokens);
            return;
        }

        switch (classification) {
            case "help":
                message.reply("How can I assist you, CMDR?");
                break;
            case "explore":
                message.reply("Nice travels, CMDR!");
                break;
            default:
                execCommand("null", message, tokens);
                break;
        }

    }

    public async run(): Promise<void> {
        console.log("Starting bot");
        await initializeNlpClassifier();
        await this.discordClient.login(this.config.getDiscordToken());
    }
}
