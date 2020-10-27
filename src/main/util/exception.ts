/**
 * Base class for all exceptions. Automatically corrects its prototype and name and also supports a cause
 * parameter.
 *
 * @param T - The exception cause type.
 */
export abstract class Exception<T = unknown> extends Error {
    /**
     * Creates a new exception.
     *
     * @param message - The exception message.
     * @param cause   - Optional error cause.
     */
    public constructor(message: string, public readonly cause: T | null = null) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, this.constructor.prototype);
    }
}

/**
 * Returns the full stack trace of the given error.
 *
 * @param error - The error for which to return the stack trace.
 * @return The stack trace.
 */
export function getStackTrace(error: unknown): string {
    if (error instanceof Error) {
        return (error.stack ?? `${error.name}: ${error.message}`) + (error instanceof Exception && error.cause != null
            ? `\nCaused by: ${getStackTrace(error.cause)}` : "");
    } else {
        return "" + error;
    }
}

/**
 * Thrown when an argument is illegal or inappropriate for the requested operation.
 */
export class IllegalArgumentException extends Exception {}

/**
 * Thrown when requested operation can not be performed because the application is in an invalid state.
 */
export class IllegalStateException extends Exception {}

/**
 * Thrown when index (array, string, ...) is out of range.
 */
export class IndexOutOfBoundsException extends Exception {}

/**
 * Thrown when requested operation is not supported.
 */
export class UnsupportedOperationException extends Exception {}

/**
 * Thrown when a requested element was not found.
 */
export class NotFoundException extends Exception {}

/**
 * Thrown when data couldn't be read or written.
 */
export class IOException extends Exception {}
