import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";
import type { MethodMetadata } from "../types.ts";

/**
 * Decorator for marking a method as a PATCH endpoint.
 * @param path - The path for the PATCH endpoint (default: "")
 * @returns A method decorator
 */

export function PATCH(path: string = ""): MethodDecorator {
	return (target: object, propertyKey: string | symbol) => {
		const metadata: MethodMetadata = {
			method: "PATCH",
			path,
			propertyKey: String(propertyKey),
		};
		Reflect.defineMetadata(METADATA_KEYS.METHOD, metadata, target, propertyKey);
	};
}
