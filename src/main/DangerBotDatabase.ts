import path from "path";
import { injectable } from "./di/Injectable";
import { TransactionedDatabase } from "./db/TransactionedDatabase";
import { DangerBotConfig } from "./DangerBotConfig";

/**
 * The Caiaphas database.
 */
export class DangerBotDatabase extends TransactionedDatabase {
    @injectable()
    public static async create(config: DangerBotConfig): Promise<DangerBotDatabase> {
        console.log(this);
        const db = await this.open(path.join(config.getDirectory(), "dangerbot.db"));
        console.log(path.join(__dirname, "..", "..", "database"));
        await db.migrate(path.join(__dirname, "..", "..", "database"));
        return db;
    }
}
