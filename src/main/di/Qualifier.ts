import "reflect-metadata";

import { Constructor } from "../util/types";
import { Injectable } from "./Injectable";

/**
 * Type for dependency injection qualifier like arguments. Can be either a real qualifier instance or a
 * qualifier type or name which is automatically converted into a qualifier instance.
 */
export type QualifierLike<T = unknown> = Qualifier<T> | Constructor<T> | string;

/**
 * Dependency injection qualifier. This interface is also a parameter decorator so this type can be used to
 * decorate constructor or factory method parameters of injectable types.
 */
export interface Qualifier<T = unknown> extends ParameterDecorator {
    /**
     * Combines this qualifier with the given qualifier by using an and-operation.
     *
     * @param qualifier - The other qualifier.
     * @return The new qualifier.
     */
    and<U>(qualifier: QualifierLike<U>): Qualifier<T & U>;

    /**
     * Combines this qualifier with the given qualifier by using an or-operation.
     *
     * @param qualifier - The other qualifier.
     * @return The new qualifier.
     */
    or<U>(qualifier: QualifierLike<U>): Qualifier<T | U>;

    /**
     * Checks if the given type qualifies.
     *
     * @param type - The type to check.
     * @return True if given type qualifies, false if not.
     */
    matches(type: Injectable): type is Injectable<T>;

    /**
     * Returns the string representation of the qualifier which is used in error messages.
     *
     * @return The string representation of the qualifier.
     */
    toString(): string;
}

/**
 * Checks if given object is a dependency injection qualifier.
 *
 * @param obj - The object to check.
 * @return True if object is a qualifier, false if not.
 */
export function isQualifier(obj: unknown): obj is Qualifier {
    return obj instanceof Function
        && (obj as Qualifier).and instanceof Function
        && (obj as Qualifier).or instanceof Function
        && (obj as Qualifier).matches instanceof Function;
}

/**
 * Creates a new qualifier using the given function to check if type qualifies.
 *
 * @param check - The function used to check if given type qualifies.
 * @param name  - Qualifier name. Used for creating string representations for error messages.
 * @return The created qualifier.
 */
function createNewQualifier<T>(check: (type: Injectable) => boolean, name: string): Qualifier<T> {
    const qualifierInstance = Object.assign(
        // eslint-disable-next-line @typescript-eslint/ban-types
        (target: object, propertyKey: string | symbol, index: number) => {
            const paramQualifiers = Reflect.getMetadata("di:qualifiers", target, propertyKey) as Qualifier[] ?? [];
            paramQualifiers[index] = qualifierInstance;
            Reflect.defineMetadata("di:qualifiers", paramQualifiers, target, propertyKey);
        },
        {
            and<U>(qualifier: QualifierLike<U>): Qualifier<T & U> {
                const other = createQualifier(qualifier);
                return createNewQualifier(
                    type => check(type) && other.matches(type),
                    `(${qualifierInstance} & ${other})`
                );
            },
            or<U>(qualifier: QualifierLike<U>): Qualifier<T | U> {
                const other = createQualifier(qualifier);
                return createNewQualifier(
                    type => check(type) || other.matches(type),
                    `(${qualifierInstance} | ${other})`
                );
            },
            matches(type: Injectable): type is Injectable<T> {
                return check(type);
            },
            toString(): string {
                return name;
            }
        }
    );
    return qualifierInstance;
}

/**
 * Creates a qualifier from the given qualifier-like argument. If argument is already a concrete qualifier instance
 * then this one is returned directly.
 *
 * @param qualifier - The qualifier or qualifier type or qualifier name.
 * @return The created qualifier (Or the given qualifier if already a concrete instance).
 */
export function createQualifier<T>(qualifier: QualifierLike<T>): Qualifier<T> {
    return isQualifier(qualifier) ? qualifier : createNewQualifier(
        type => type.qualifiesAs(qualifier), typeof qualifier === "string" ? `'${qualifier}'` : qualifier.name);
}

/**
 * Decorator to add qualifiers to constructor or factory method parameters.
 *
 * @param qualifier - The qualifier or qualifier type or qualifier name.
 * @return The created qualifier (Or the given qualifier if already a concrete instance).
 */
export function qualifier<T>(qualifier: QualifierLike<T>): Qualifier<T> {
    return createQualifier(qualifier);
}
