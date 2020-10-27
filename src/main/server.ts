import { DangerBot } from "./DangerBot";

// cspell:disable-next-line
const discordTokenEnvName: string = "DANGERBOT_DISCORD_TOKEN";

(async () => {
    const discordToken = process.env[discordTokenEnvName];
    if (discordToken == null || discordToken.length === 0) {
        throw new Error(`Environment variable ${discordTokenEnvName} has not been set.`);
    }
    const bot = new DangerBot(discordToken);
    bot.onMessage.connect(msg => console.log(msg));
    bot.login();
})();
