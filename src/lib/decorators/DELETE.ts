import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";
import type { MethodMetadata } from "../types.ts";

/**
 * Decorator that marks a method as handling DELETE HTTP requests.
 *
 * @param path - The URL path for this endpoint (default: "")
 * @returns A method decorator
 *
 * @example
 * ```ts
 * class UserController {
 *   @DELETE("/users/:id")
 *   deleteUser() {
 *     // Handle DELETE request
 *   }
 * }
 * ```
 */

export function DELETE(path: string = ""): MethodDecorator {
	return (target: object, propertyKey: string | symbol) => {
		const metadata: MethodMetadata = {
			method: "DELETE",
			path,
			propertyKey: String(propertyKey),
		};
		Reflect.defineMetadata(METADATA_KEYS.METHOD, metadata, target, propertyKey);
	};
}
