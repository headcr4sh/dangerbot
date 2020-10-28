import { command } from "../Command";
import { Message as DiscordMessage } from "discord.js";
import { injectable } from "../di/Injectable";

@injectable()
export class GameModule  {
    @command("time")
    public time(message: DiscordMessage): void {
        message.reply("How shall I know?");
    }

    @command("status")
    public status(message: DiscordMessage): void {
        message.reply("Server is probably well");
    }

    @command("say")
    public say(message: DiscordMessage, text: string): void {
        message.reply(text);
    }
}
