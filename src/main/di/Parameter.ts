import { IllegalArgumentException } from "../util/exception";
import { Constructor } from "../util/types";
import { injector } from "./Injector";
import { createQualifier, Qualifier } from "./Qualifier";

/**
 * A parameter in a constructor or static factory method of an injectable class.
 */
export class Parameter<T = unknown> {
    /** Set to true if parameter type is an array. */
    private readonly isArray: boolean;

    /** The qualifier used to resolve this parameter. */
    private readonly qualifier: Qualifier<T>;

    /**
     * Creates a new dependency injection parameter.
     *
     * @param type      - The parameter type. Can also be an array to receive a list of matching dependencies but then
     *                    qualifiers are required to find the right dependencies because the array item type isn't
     *                    recorded in reflect metadata.
     * @param qualifier - Optional qualifiers. Dependencies must match one of them to be considered to be injected
     *                    into this parameter.
     */
    public constructor(type: Constructor<T>, qualifier?: Qualifier<T>) {
        if ((this.isArray = type as Constructor === Array)) {
            if (qualifier == null) {
                throw new IllegalArgumentException(
                    "Array parameters must be qualified by using the @qualify decorator");
            }
            this.qualifier = qualifier;
        } else {
            this.qualifier = qualifier != null ? qualifier.and(type) : createQualifier(type);
        }
    }

    /**
     * Resolves the parameter.
     *
     * @return The resolved parameter. Can be a promise if dependency is asynchronous. Can also be an
     *         array if parameter type is an array. The parameter is then resolved into a list of matching
     *         dependencies which can again be synchronous or asynchronous.
     */
    public resolve(): T | Promise<T> | T[] | Promise<T[]> {
        if (this.isArray) {
            const values = injector.getAll(this.qualifier);
            if (values.some(value => value instanceof Promise)) {
                return Promise.all(values);
            } else {
                return values as T[];
            }
        } else {
            return injector.get(this.qualifier);
        }
    }
}
