import { Constructor } from "./util/types";
import { Message as DiscordMessage } from "discord.js";
import { injector } from "./di/Injector";

export class Command {
    private module: Object | null = null;
    private method: Function | null = null;

    constructor(
        private moduleType: Constructor<Object>,
        private readonly methodName: string | symbol
    ) {}

    private async getModule(): Promise<Object> {
        if (this.module == null) {
            this.module = await injector.get(this.moduleType);
        }
        return this.module;
    }

    private async getMethod(): Promise<Function> {
        if (this.method == null) {
            const module = await this.getModule();
            this.method = (module as any)[this.methodName].bind(module) as Function;
        }
        return this.method;
    }

    public async exec(message: DiscordMessage, args: string[]): Promise<void> {
        await (await this.getMethod()).call(null, message, ...args);
    }
}

const commands = new Map<string, Command>();

export function command(commandName: string): <T>(target: Object, methodName: string | symbol,
        descriptor: TypedPropertyDescriptor<T>) => void {
    return function<T>(this: unknown, moduleType: Object, methodName: string | symbol,
            descriptor: TypedPropertyDescriptor<T>): void {
        commands.set(commandName, new Command(moduleType.constructor as Constructor<Object>, methodName));
    };
}

export async function execCommand(commandName: string, message: DiscordMessage, args: string[]): Promise<void> {
    let command = commands.get(commandName);
    if (!command) {
        command = commands.get("null");
    }
    await command.exec(message, args);
}
