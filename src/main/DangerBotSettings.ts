export interface DangerBotSettings {
    storage: {
        path: string
    }
    discord: {
        token: string
    },
    eddbApi: {
        endpoint: string,
        version: string
    }
};
