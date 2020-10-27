import * as discord from "discord.js";

async function main() {
    const client = new discord.Client();
    client.on("ready", () => {
        console.log(`Logged in as ${client?.user?.tag}!`);
    });
    client.on('message', msg => {
        if (msg.content.indexOf("ping") !== -1) {
          msg.reply("pong!");
        }
    });
    await client.login(process.env["DANGERBOT_DISCORD_TOKEN"]);
}

(async () => {
    await main();
})();
