import path from "path";
import fs from "fs";
import pkg from "../../package.json";
import Configstore from "configstore";
import { injectable } from "./di/Injectable";
import { Config } from "./util/Config.js";

const discordTokenKey = "discordToken";
const discordTokenEnvName = "DANGERBOT_DISCORD_TOKEN";

const commandPrefixKey = "commandPrefix";
const defaultCommandPrefix = "!";

const inquiryPrefixKey = "inquiryPrefix";
const defaultInquiryPrefix = "?";

/**
 * The DangerBot configuration.
 */
@injectable()
export class DangerBotConfig implements Config {
    /** The backend configuration store. */
    private readonly store: Configstore;

    public constructor() {
        this.store = new Configstore(pkg.name, {}, { globalConfigPath: true });
    }

    /**
     * Returns the configuration file name.
     *
     * @return The configuration file name.
     */
    public getFile(): string {
        return this.store.path;
    }

    /**
     * Returns the configuration directory.
     *
     * @return The configuration directory.
     */
    public getDirectory(): string  {
        return path.dirname(this.getFile());
    }

    /** @inheritDoc */
    public set(key: string, value: any): void {
        this.store.set(key, value);
    }

    /** @inheritDoc */
    public get<T = any>(key: string, defaultValue?: T): T {
        if (this.store.has(key)) {
            return this.store.get(key);
        } else if (defaultValue !== undefined) {
            return defaultValue;
        } else {
            throw new Error("Config key not set: " + key);
        }
    }

    /** @inheritDoc */
    public delete(key: string): void {
        this.store.delete(key);
    }

    /**
     * Reads the given file from the configuration directory and returns the content.
     *
     * @param fileName - The file name relative to the configuration directory.
     * @return The content of the read file. Null if file did not exist.
     */
    public readFile(fileName: string): string | null {
        const absFileName = path.join(this.getDirectory(), fileName);
        if (fs.existsSync(absFileName)) {
            return (fs.readFileSync(absFileName)).toString();
        } else {
            return null;
        }
    }

    /**
     * Writes data to the given file within the configuration directory.
     *
     * @param fileName - The file name relative to the configuration directory.
     * @param content  - The content to write to the file.
     */
    public writeFile(fileName: string, content: string): void {
        const dir = this.getDirectory();
        const finalFile = path.join(dir, fileName);
        const newFile = path.join(dir, fileName + ".new");
        const backupFile = path.join(dir, fileName + ".bak");
        fs.writeFileSync(newFile, content);
        if (fs.existsSync(finalFile)) {
            fs.renameSync(finalFile, backupFile);
        }
        fs.renameSync(newFile, finalFile);
    }

    /**
     * Returns the discord token. When environment variable is set then this is used and stored in configuration.
     * Otherwise the token is read from configuration and an error is thrown when not found.
     *
     * @return The discord token.
     */
    public getDiscordToken(): string {
        let discordToken = process.env[discordTokenEnvName];
        if (discordToken == null || discordToken.length === 0) {
            discordToken = this.get(discordTokenKey, "");
            if (discordToken.length === 0) {
                throw new Error(`Discord token not found in config and environment variable ${discordTokenEnvName} ` +
                    `has not been set.`);
            }
        }
        this.set(discordTokenKey, discordToken);
        return discordToken;
    }

    /**
     * Returns the command prefix string with which every command recognized by the bot must start. Defaults to "!"
     *
     * @return The command prefix.
     */
    public getCommandPrefix(): string {
        return this.get(commandPrefixKey, defaultCommandPrefix);
    }

    /**
     * Returns the inquiry prefix string with which every inquiry to be analyzed by the bot's NLP unit must start.
     * Defaults to "?"
     *
     * @return The inquiry prefix.
     */
    public getInquiryPrefix(): string {
        return this.get(inquiryPrefixKey, defaultInquiryPrefix);
    }
}
