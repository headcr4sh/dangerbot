import { Database } from "./Database";
import { Mutex } from "../util/Mutex";

/**
 * Transactioned version of the database wrapper.
 */
export class TransactionedDatabase extends Database {
    private readonly mutex = new Mutex();

    /** @inheritDoc */
    public async close(): Promise<void> {
        const locked = this.mutex.lock();
        if (locked) await locked;
        try {
            await super.close();
        } finally {
            this.mutex.unlock();
        }
    }

    /** @inheritDoc */
    public async migrate(migrationsPath: string): Promise<void> {
        await this.transaction(async db => {
            await db.migrate(migrationsPath);
        });
    }

    /** @inheritDoc */
    public async run(sql: string, ...params: any[]): Promise<void> {
        const locked = this.mutex.lock();
        if (locked) await locked;
        try {
            return await super.run(sql, ...params);
        } finally {
            this.mutex.unlock();
        }
    }

    /** @inheritDoc */
    public async exec(sql: string): Promise<void> {
        const locked = this.mutex.lock();
        if (locked) await locked;
        try {
            return await super.exec(sql);
        } finally {
            this.mutex.unlock();
        }
    }

    /** @inheritDoc */
    public async get<T = Record<string, any>>(sql: string, ...params: any[]): Promise<T | null> {
        const locked = this.mutex.lock();
        if (locked) await locked;
        try {
            return await super.get<T>(sql, ...params);
        } finally {
            this.mutex.unlock();
        }
    }

    /** @inheritDoc */
    public async all<T = Record<string, any>>(sql: string, ...params: any[]): Promise<T[]> {
        const locked = this.mutex.lock();
        if (locked) await locked;
        try {
            return await super.all<T>(sql, ...params);
        } finally {
            this.mutex.unlock();
        }
    }

    /**
     * Runs the given function in a transaction. All database actions must be called on the database object passed
     * to the function. All other calls are blocked until the transaction is finished.
     *
     * @param func - The function to run in a transaction.
     */
    public async transaction(func: (db: Database) => Promise<void>): Promise<void> {
        const locked = this.mutex.lock();
        if (locked) await locked;
        try {
            const db = new Database(this.db);
            await db.exec("BEGIN");
            try {
                await func(db);
                await db.exec("COMMIT");
            } catch (error) {
                await db.exec("ROLLBACK");
                throw error;
            }
        } finally {
            this.mutex.unlock();
        }
    }
}
