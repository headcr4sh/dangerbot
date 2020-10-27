/**
 * Mutex which can be used to synchronize asynchronous operations.
 */
export class Mutex {
    private locked: Promise<void> | null = null;
    private release: (() => void) | null = null;

    /**
     * Locks the mutex. The returned promise is either resolved immediately when mutex wasn't locked before or
     * after the lock has been released from the previous locker and could be acquired for the current locker.
     */
    public lock(): Promise<void> | void {
        if (this.locked == null) {
            // Synchronously lock mutex if possible
            this.locked = new Promise(resolve => { this.release = resolve; });
        } else {
            // Otherwise wait for mutex getting unlocked and then lock it
            return this.waitAndLock();
        }
    }

    private async waitAndLock(): Promise<void> {
        while (this.locked !== null) {
            await this.locked;
        }
        this.locked = new Promise(resolve => { this.release = resolve; });
    }

    /**
     * Releases the current lock.
     */
    public unlock(): void {
        const resolve = this.release;
        if (resolve) {
            this.release = null;
            this.locked = null;
            resolve();
        }
    }
}
