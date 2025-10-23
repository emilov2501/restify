import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";
import type { MethodMetadata } from "../types.ts";

/**
 * Decorator that marks a method as a POST endpoint.
 *
 * @param path - The route path for the POST endpoint. Defaults to an empty string.
 * @returns A method decorator function
 *
 * @example
 * ```ts
 * class MyController {
 *   @POST("/users")
 *   createUser() {
 *     // handler implementation
 *   }
 * }
 * ```
 */

export function POST(path: string = ""): MethodDecorator {
	return (target: object, propertyKey: string | symbol) => {
		const metadata: MethodMetadata = {
			method: "POST",
			path,
			propertyKey: String(propertyKey),
		};
		Reflect.defineMetadata(METADATA_KEYS.METHOD, metadata, target, propertyKey);
	};
}
