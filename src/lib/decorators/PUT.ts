import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";
import type { MethodMetadata } from "../types.ts";

/**
 * Decorator that marks a method as a PUT endpoint handler.
 *
 * @param path - The URL path for the PUT endpoint (optional, defaults to empty string)
 * @returns A method decorator
 *
 * @example
 * ```ts
 * class MyController {
 *   @PUT("/users/:id")
 *   updateUser(req: Request, res: Response) {
 *     // handler implementation
 *   }
 * }
 * ```
 */

export function PUT(path: string = ""): MethodDecorator {
	return (target: object, propertyKey: string | symbol) => {
		const metadata: MethodMetadata = {
			method: "PUT",
			path,
			propertyKey: String(propertyKey),
		};
		Reflect.defineMetadata(METADATA_KEYS.METHOD, metadata, target, propertyKey);
	};
}
