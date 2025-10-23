import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";
import type { MethodMetadata } from "../types.ts";

/**
 * Decorator to mark a method as a GET route handler.
 * @param path - The path for the route (optional, defaults to empty string)
 * @returns A method decorator that stores route metadata
 */

export function GET(path: string = ""): MethodDecorator {
	return (target: object, propertyKey: string | symbol) => {
		const metadata: MethodMetadata = {
			method: "GET",
			path,
			propertyKey: String(propertyKey),
		};
		Reflect.defineMetadata(METADATA_KEYS.METHOD, metadata, target, propertyKey);
	};
}
