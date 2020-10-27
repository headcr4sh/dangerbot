import * as path from "path";
import { Database as SQLiteDatabase } from "sqlite3";

export class Database {

    private readonly dbFile: string;
    private sqliteDb?: SQLiteDatabase;

    public constructor(dbFile: string) {
        this.dbFile = dbFile;
    }

    public async open(): Promise<void> {
        const dbPath = path.resolve(this.dbFile);
        const sqliteDatabase = await new Promise<SQLiteDatabase>((resolve, reject) => {
            const sqlDb = new SQLiteDatabase(dbPath, (err) => {
                if (!!err) {
                    reject(err);
                } else {
                    // TODO Check if database has already been initialized and create schema if necessary.
                    //const result = sqlDb.exec(`SELECT count(*) FROM sqlite_master WHERE type='table' AND name='__schema';`);
                    resolve(sqlDb);
                }
            });
        });
        this.sqliteDb = sqliteDatabase;
    }

    public async close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.sqliteDb?.close(err => {
                if (!!err) {
                    reject(err)
                } else {
                    resolve();
                }
            });
        });
    }
}
