/**
 * Generic interface for configuration implementations.
 */
export interface Config {
    /**
     * Sets a configuration value.
     *
     * @param key   - The configuration key.
     * @param value - The configuration value to set.
     */
    set(key: string, value: unknown): void;

    /**
     * Returns a configuration value.
     *
     * @param key          - The configuration key.
     * @param defaultValue - The default value to return if configuration key does not exist. When not specified then
     *                       this method throws an error when configuration key was not found.
     * @return The configuration value.
     */
    get<T = unknown>(key: string, defaultValue?: T): T;

    /**
     * Deletes a configuration key.
     *
     * @param key - The configuration key to delete.
     */
    delete(key: string): void;
}
