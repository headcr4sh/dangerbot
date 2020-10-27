import sqlite3 from "sqlite3";

/**
 * Prepared SQL statement.
 */
export class Statement {
    /**
     * @param statement - The wrapped sqlite statement.
     */
    public constructor(
        protected readonly statement: sqlite3.Statement
    ) {}

    /**
     * Binds parameters to the statement.
     *
     * @param params - The parameters to bind.
     */
    public bind(...params: any[]): void {
        this.statement.bind(params);
    }

    /**
     * Resets the SQL statement.
     */
    public async reset(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.statement.reset(error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Finalizes the SQL statement.
     */
    public async finalize(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.statement.finalize(error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Executes the given statement with the given parameters.
     *
     * @param params - The SQL statement parameters.
     */
    public async run(...params: any[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.statement.run(params, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Executes the statement with the given parameters and returns the first result row or null if query
     * returned no result.
     *
     * @param params - The SQL statement parameters.
     * @return The first result row or null if no result.
     */
    public async get<T = Record<string, any>>(...params: any[]): Promise<T | null> {
        return new Promise<T>((resolve, reject) => {
            this.statement.get(params, (error, row) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Executes the statement with the given parameters and returns array with all result rows.
     *
     * @param params - The SQL statement parameters.
     * @return The result rows.
     */
    public async all<T = Record<string, any>>(...params: any[]): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            this.statement.all(params, (error, rows) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}
