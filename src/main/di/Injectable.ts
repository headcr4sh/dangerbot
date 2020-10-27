import "reflect-metadata";

import { Constructor } from "../util/types";
import { injector } from "./Injector";
import { Parameter } from "./Parameter";
import { Qualifier } from "./Qualifier";

/**
 * A resolvable and injectable dependency.
 */
export class Injectable<T = unknown> {
    /** Cached instance of the dependency. */
    private instance: T | Promise<T> | null | undefined = undefined;

    /**
     * Creates a new injectable.
     *
     * @param type    - The type into which this injectable is resolved.
     * @param factory - The factory function to create the actual dependency (synchronous or asynchronous).
     * @param params  - The parameters of the constructor or static factory method to resolve and pass to the
     *                  factory function when creating the dependency.
     * @param names   - Optional qualifier names this injectable matches.
     */
    public constructor(
        private readonly type: Constructor<T>,
        private readonly factory: (...args: any[]) => T | Promise<T>,
        private readonly params: Parameter[],
        private readonly names: string[] = []
    ) {}

    public static fromClass<T>(type: Constructor<T>, names?: string[]): Injectable<T> {
        const paramQualifiers = Reflect.getMetadata("di:qualifiers", type) as Qualifier[] ?? [];
        const paramTypes = Reflect.getMetadata("design:paramtypes", type) as Constructor[] ?? [];
        const params = paramTypes.map((type, index) => new Parameter(type, paramQualifiers[index]));
        return new Injectable(type, (...args: any[]) => new type(...args), params, names);
    }

    public static fromFactory<T>(type: Constructor<T>, factory: (...args: any[]) => T | Promise<T>, names?: string[]):
            Injectable<T> {
        const paramQualifiers = Reflect.getMetadata("di:qualifiers", type, factory.name) as Qualifier[] ?? [];
        const paramTypes = Reflect.getMetadata("design:paramtypes", type, factory.name) as Constructor[] ?? [];
        const params = paramTypes.map((type, index) => new Parameter(type, paramQualifiers[index]));
        return new Injectable(type, factory, params, names);
    }

    public static fromValue<T extends Record<string, unknown>>(value: T, names?: string[]): Injectable<T> {
        return new Injectable(value.constructor as Constructor<T>, () => value, [], names);
    }

    /**
     * Checks if this injectable matches the given qualifier.
     *
     * @param qualifier - The qualifier to match.
     * @return True if injectable matches the qualifier, false if not.
     */
    public qualifiesAs<A = unknown>(qualifier: Constructor<A> | string): this is Injectable<A> {
        if (typeof qualifier === "string") {
            return this.names.includes(qualifier);
        } else {
            let type: Constructor = this.type;
            while (type != null) {
                if (type === qualifier) {
                    return true;
                }
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const nextPrototype = Object.getPrototypeOf(type.prototype);
                // eslint-disable-next-line max-len
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/strict-boolean-expressions,@typescript-eslint/no-unsafe-member-access
                type = nextPrototype && nextPrototype.constructor;
            }
            return false;
        }
    }

    /**
     * Creates and returns a new dependency instance.
     *
     * @return The created instance. Can be a promise when dependency is asynchronous.
     */
    public createInstance(): Promise<T> | T {
        const values = this.params.map(param => param.resolve());
        if (values.some(value => value instanceof Promise)) {
            return (async (): Promise<T> => this.factory.call(this.type, ...await Promise.all(values)))();
        } else {
            return this.factory.call(this.type, ...values);
        }
    }

    /**
     * Returns the dependency instance. The created instance is cached so the same instance is returned on each call.
     *
     * @return The created instance. When null is returned then the dependency couldn't be resolved because of
     *         cyclic dependencies.
     */
    public getInstance(): Promise<T> | T | null {
        if (this.instance === undefined) {
            this.instance = null;
            this.instance = this.createInstance();

            // Replace asynchronous instance with synchronous instance when resolved
            if (this.instance instanceof Promise) {
                void this.instance.then(instance => {
                    this.instance = instance;
                });
            }
        }
        return this.instance;
    }
}

/**
 * Decorator to mark a class as an injectable dependency. An injectable can be injected into other injectables.
 * The decorator can be used on a class or on a static factory method. Factory methods can also be asynchronous by
 * returning the created instance as a promise.
 *
 * @param qualifiers - Optional qualifier names. When specified then injectable is not only registered by its type but
 *                     also by these names so they can be injected into other injectables by name.
 */
export function injectable<T>(...names: string[]): (target: Constructor<T>, propertyKey?: string) => void {
    return (target: Constructor<T>, propertyKey?: string): void => {
        if (propertyKey != null) {
            injector.injectFactory(target, (target as unknown as Record<string, unknown>)[propertyKey] as
                ((...args: any[]) => T | Promise<T>), names);
        } else {
            injector.injectClass(target, names);
        }
    };
}
