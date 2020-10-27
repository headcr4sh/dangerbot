/*
 * Copyright (C) 2019 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */

import { Constructor } from "../util/types";
import { Injectable } from "./Injectable";
import { InjectionException } from "./InjectionException";
import { createQualifier, QualifierLike } from "./Qualifier";

/**
 * Dependency Injector
 */
class Injector {
    /** The registered injectables. */
    private readonly injectables: Injectable[] = [];

    /**
     * Injects the given injectable.
     *
     * @param injectable - The injectable to inject.
     */
    private inject(injectable: Injectable): this {
        this.injectables.push(injectable);
        return this;
    }

    /**
     * Injects the given class type.
     *
     * @param type  - The class type to inject.
     * @param names - Optional qualifier names.
     */
    public injectClass(type: Constructor, names?: string[]): this {
        return this.inject(Injectable.fromClass(type, names));
    }

    /**
     * Injects the given class type created by given factory method. The factory can create an instance of the type
     * synchronously or asynchronously (by returning a Promise).
     *
     * @param type    - The class type.
     * @param factory - The factory method which creates the given type.
     * @param names   - Optional qualifier names.
     */
    public injectFactory<T>(type: Constructor<T>, factory: (...args: any[]) => T | Promise<T>, names?: string[]): this {
        return this.inject(Injectable.fromFactory(type, factory, names));
    }

    /**
     * Injects the given value.
     *
     * @param value - The value to inject. Type is automatically determined from the value constructor.
     * @param names   - Optional qualifier names.
     */
    public injectValue<T extends Record<string, unknown>>(value: T, names?: string[]): this {
        return this.inject(Injectable.fromValue(value, names));
    }

    /**
     * Creates a new instance of the given class and resolves its dependencies.
     *
     * @param type - The class.
     * @param factory - Optional static factory method which creates the class.
     * @return The created new instance. Synchronous or asynchronous.
     */
    public create<T>(type: Constructor<T>, factory?: (...args: any[]) => T | Promise<T>): T | Promise<T> {
        if (factory != null) {
            return Injectable.fromFactory(type, factory).createInstance();
        } else {
            return Injectable.fromClass(type).createInstance();
        }
    }

    /**
     * Asynchronously creates a new instance of the given class and resolves its dependencies.
     *
     * @param type - The class.
     * @param factory - Optional static factory method which creates the class.
     * @return The created new instance.
     */
    public async createAsync<T>(type: Constructor<T>, factory?: (...args: any[]) => Promise<T>): Promise<T> {
        return this.create(type, factory);
    }

    /**
     * Synchronously creates a new instance of the given class and resolves its dependencies.
     *
     * @param type - The class.
     * @param factory - Optional static factory method which creates the class.
     * @return The created new instance.
     */
    public createSync<T>(type: Constructor<T>, factory?: (...args: any[]) => T): T {
        const instance = this.create(type, factory);
        if (instance instanceof Promise) {
            throw new InjectionException("Asynchronous dependencies found during synchronous resolving");
        }
        return instance;
    }

    /**
     * Returns the dependency matching the given qualifier. An exception is thrown when multiple
     * dependencies match the qualifier.
     *
     * @param qualifier - The dependency injection qualifier, qualifier type or qualifier name.
     * @return The found dependency (Synchronous if possible, asynchronous otherwise).
     */
    public get<T>(qualifier: QualifierLike<T>): T | Promise<T> {
        const matches = this.getAll(qualifier);
        const matchCount = matches.length;
        if (matchCount === 1) {
            return matches[0];
        } else if (matchCount > 1) {
            throw new InjectionException("More than one dependency found for qualifier: " + createQualifier(qualifier));
        } else {
            throw new InjectionException("No dependency found for qualifier: " + createQualifier(qualifier));
        }
    }

    /**
     * Returns a list of dependencies matching the given qualifier.
     *
     * @param qualifier - The dependency injection qualifier, qualifier type or qualifier name.
     * @return The found dependencies (Synchronous if possible, asynchronous otherwise).
     */
    public getAll<T>(qualifier: QualifierLike<T>): Array<T | Promise<T>> {
        return this.injectables
            .filter((injectable): injectable is Injectable<T> => createQualifier(qualifier).matches(injectable))
            .map(injectable => injectable.getInstance())
            .filter((resolved): resolved is T | Promise<T> => resolved != null);
    }

    /**
     * Asynchronously returns the dependency matching the given qualifier. An exception is thrown when multiple
     * injectables match the qualifier.
     *
     * @param qualifier - The dependency injection qualifier, qualifier type or qualifier name.
     * @return The found dependency.
     */
    public async getAsync<T>(qualifier: QualifierLike<T>): Promise<T> {
        return this.get(qualifier);
    }

    /**
     * Asynchronously returns a list of dependencies matching the given qualifier.
     *
     * @param qualifier - The dependency injection qualifier, qualifier type or qualifier name.
     * @return The found dependencies.
     */
    public async getAllAsync<T>(qualifier: QualifierLike<T>): Promise<T[]> {
        return Promise.all(this.getAll(qualifier));
    }

    /**
     * Synchronously returns the dependency matching the given qualifier. An exception is thrown when dependency can
     * only be resolved asynchronously or when multiple injectables match the qualifier.
     *
     * @param qualifier - The dependency injection qualifier, qualifier type or qualifier name.
     * @return The found dependency.
     */
    public getSync<T>(qualifier: QualifierLike<T>): T {
        const dependency = this.get(qualifier);
        if (dependency instanceof Promise) {
            throw new InjectionException("Asynchronous dependency found during synchronous resolving for qualifier: "
                + createQualifier(qualifier));
        }
        return dependency;
    }

    /**
     * Synchronously returns a list of dependencies matching the given qualifier. An exception is thrown when
     * one of the dependencies can only be resolved asynchronously.
     *
     * @param qualifier - The dependency injection qualifier, qualifier type or qualifier name.
     * @return The found dependencies.
     */
    public getAllSync<T>(qualifier: QualifierLike<T>): T[] {
        const dependencies = this.getAll(qualifier);
        if (dependencies.some(dependency => dependency instanceof Promise)) {
            throw new InjectionException("Asynchronous dependencies found during synchronous resolving for qualifier: "
                + createQualifier(qualifier));
        }
        return dependencies as T[];
    }
}

/** Global injector instance. */
export const injector = new Injector();
