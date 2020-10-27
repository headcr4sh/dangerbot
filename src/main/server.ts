// #!/usr/bin/env node

import "source-map-support/register";

import { DangerBot } from "./DangerBot";
import { injector } from "./di/Injector";

// import * as path from "path";

// import { DangerBot } from "./DangerBot";
// import { DangerBotSettings } from "./DangerBotSettings";

// // spell-checker:disable-next-line
// const discordTokenEnvName = "DANGERBOT_DISCORD_TOKEN";

// // spell-checker:disable-next-line
// const eddbApiEndpointEnvName = "DANGERBOT_EDDB_API_ENDPOINT";

// // spell-checker:disable-next-line
// const storagePathEnvName = "DANGERBOT_STORAGE_PATH";

// (async () => {

//     const discordToken = process.env[discordTokenEnvName];
//     const eddbApiEndpoint = process.env[eddbApiEndpointEnvName] || "https://eddb.io/archive";
//     const storagePath = process.env[storagePathEnvName] || "/usr/local/share/dangerbot";

//     if (discordToken == null || discordToken.length === 0) {
//         throw new Error(`Environment variable ${discordTokenEnvName} has not been set.`);
//     }

//     const settings: DangerBotSettings = {
//         storage: {
//             path: path.resolve(storagePath)
//         },
//         discord: {
//             token: discordToken
//         },
//         eddbApi: {
//             endpoint: eddbApiEndpoint,
//             version: "v6"
//         }
//     }

//     const bot = new DangerBot(settings);
//     bot.onMessage.connect(msg => console.log(msg));
//     await bot.start();
// })();


// Start DangerBot
(async () => {
    try {
        const bot = await injector.get(DangerBot);
        await bot.run();
    } catch (error) {
        console.log("Fatal error: " + error.message, error);
        process.exit(1);
    }
})();
