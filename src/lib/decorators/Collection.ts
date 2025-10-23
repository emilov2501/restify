import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";
import type { CollectionMetadata } from "../types.ts";

/**
 * Decorator that marks a class as a collection with a specified base path.
 *
 * @param basePath - The base path for the collection
 * @returns A class decorator function
 *
 * @example
 * ```ts
 * @Collection("/users")
 * class UserCollection {
 *   // ...
 * }
 * ```
 */

export function Collection(basePath: string): ClassDecorator {
	return (target: object) => {
		const metadata: CollectionMetadata = { basePath };
		Reflect.defineMetadata(METADATA_KEYS.COLLECTION, metadata, target);
	};
}
