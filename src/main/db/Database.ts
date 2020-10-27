import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { promisify } from "util";
import { Statement } from "./Statement";

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

interface Migration {
    id: number;
    name: string;
    up: string;
    down: string;
}

/**
 * Generic database wrapper.
 */
export class Database {
    /**
     * @param db - The wrapped sqlite database object.
     */
    public constructor(
        protected readonly db: sqlite3.Database
    ) {}

    /**
     * Opens the given database with the given access mode and returns it.
     *
     * @param filename - The sqlite database file.
     * @param mode     - Optional access mode. Defaults to read/write/create.
     * @return The opened database.
     */
    public static async open<T extends typeof Database>(this: T, filename: string,
            mode: number = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE): Promise<InstanceType<T>> {
        return new Promise<InstanceType<T>>((resolve, reject) => {
            const db = new sqlite3.Database(filename, mode, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve(new (<any>this)(db));
                }
            });
        });
    }

    /**
     * Closes the database.
     */
    public async close(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.close(error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Migrates the database with the migration files in the given directory.
     *
     * @param migrationsPath - The directory containing the migration files.
     */
    public async migrate(migrationsPath: string): Promise<void> {
        // Read migrations from project
        const appDbMigrations: Migration[] = [];
        let appDbId: number = 0;
        for (const file of await readdir(migrationsPath)) {
            const match = file.match(/^([0-9]+)-(.+)\.sql$/);
            if (match) {
                const id = +match[1];
                const name = match[2];
                const content = (await readFile(path.join(migrationsPath, file))).toString();
                const parts = content.match(/^-- Up$([\s\S]*?)^-- Down$([\s\S]*)/m);
                if (parts == null || parts.length !== 3) {
                    throw new Error("Can't find up and down script in migration file " + file);
                }
                const up = parts[1].trim();
                const down = parts[2].trim();
                appDbMigrations.push({ id, name, up, down });
                appDbId = Math.max(appDbId, id);
            }
        }
        appDbMigrations.sort((a, b) => a.id - b.id);

        // Read migrations from database (if present)
        let dbMigrations: Migration[];
        let dbId: number;
        if (await this.tableExists("migrations")) {
            dbMigrations = await this.all<Migration>(`SELECT * FROM "migrations"`);
            dbMigrations.sort((a, b) => b.id - a.id);
        } else {
            await this.run(`
                CREATE TABLE "migrations" (
                    "id" INTEGER PRIMARY KEY,
                    "name" TEXT NOT NULL,
                    "up" TEXT NOT NULL,
                    "down" TEXT NOT NULL
                );
            `);
            dbMigrations = [];
        }
        dbId = dbMigrations.reduce((id, migration) => Math.max(id, migration.id), 0);

        // Upgrade database if needed
        if (appDbId > dbId) {
            for (const migration of appDbMigrations) {
                if (migration.id > dbId) {
                    console.log(`Updating database to version ${migration.id} (${migration.name})`);
                    await this.exec(migration.up);
                    await this.run(`INSERT INTO "migrations" ("id", "name", "up", "down") VALUES (?, ?, ?, ?)`,
                        migration.id, migration.name, migration.up, migration.down);
                }
            }
        }

        // Downgrade database if needed
        if (appDbId < dbId) {
            for (const migration of dbMigrations) {
                if (migration.id > appDbId) {
                    console.log(`Reverting database update version ${migration.id} (${migration.name})`);
                    await this.exec(migration.down);
                    await this.run(`DELETE FROM "migrations" WHERE "id" = ?`, migration.id);
                }
            }
        }
    }

    /**
     * Checks if the given table exists.
     *
     * @return True if table exists, false if not.
     */
    public async tableExists(tableName: string): Promise<boolean> {
        const row = await this.get(`SELECT "name" FROM "sqlite_master" WHERE "type" = 'table' AND "name" = ?`,
            tableName);
        return row != null && row["name"] === tableName;
    }

    /**
     * Executes the given semicolon-separated SQL statements.
     *
     * @param sql - The semicolon-separated SQL statements to execute.
     */
    public async exec(sql: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.exec(sql, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Executes the given SQL query with the given parameters.
     *
     * @param sql    - The SQL query to execute.
     * @param params - The parameters for the SQL query.
     */
    public async run(sql: string, ...params: any[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.run(sql, params, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Executes the given SQL query with the given parameters and returns the first result row or null if query
     * returned no result.
     *
     * @param sql    - The SQL query to execute.
     * @param params - The parameters for the SQL query.
     * @return The first result row or null if no result.
     */
    public async get<T = Record<string, any>>(sql: string, ...params: any[]): Promise<T | null> {
        return new Promise<T>((resolve, reject) => {
            this.db.get(sql, params, (error, row) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Executes the given SQL query with the given parameters and returns array with all result rows.
     *
     * @param sql    - The SQL query to execute.
     * @param params - The parameters for the SQL query.
     * @return The result rows.
     */
    public async all<T = Record<string, any>>(sql: string, ...params: any[]): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            this.db.all(sql, params, (error, rows) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Prepares an SQL statement.
     *
     * @param sql - The SQL statement to prepare.
     * @return The prepared statement.
     */
    public async prepare(sql: string): Promise<Statement> {
        return new Promise<Statement>((resolve, reject) => {
            const statement = this.db.prepare(sql, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve(new Statement(statement));
                }
            });
        });
    }

    /**
     * Creates an insert-or-replace SQL query for the given table and columns.
     *
     * @param table   - The table name.
     * @param columns - The list of column names.
     * @return The created SQL query.
     */
    public createInsertOrReplaceSQL(table: string, ...columns: string[]): string {
        const columnsString = columns.map(column => `'${column}'`).join(", ");
        const valuesString = "?" + ", ?".repeat(columns.length - 1);
        return `INSERT OR REPLACE INTO "${table}" (${columnsString}) VALUES (${valuesString})`;
    }

    /**
     * Creates an insert SQL query for the given table and columns.
     *
     * @param table   - The table name.
     * @param columns - The list of column names.
     * @return The created SQL query.
     */
    public createInsertSQL(table: string, ...columns: string[]): string {
        const columnsString = columns.map(column => `"${column}"`).join(", ");
        const valuesString = "?" + ", ?".repeat(columns.length - 1);
        return `INSERT INTO "${table}" (${columnsString}) VALUES (${valuesString})`;
    }
}
