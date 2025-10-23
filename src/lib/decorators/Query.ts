import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";
import type { ParameterMetadata } from "../types.ts";

/**
 * Decorator for binding query string parameters to method parameters.
 *
 * @param key - The name of the query parameter to bind
 * @returns A parameter decorator function
 *
 * @example
 * ```ts
 * class MyController {
 *   getUser(@Query("id") userId: string) {
 *     // userId will contain the value of the "id" query parameter
 *   }
 * }
 * ```
 */

export function Query(key: string): ParameterDecorator {
	return (
		target: object,
		propertyKey: string | symbol | undefined,
		parameterIndex: number,
	) => {
		if (!propertyKey) return;
		const existingParameters: ParameterMetadata[] =
			(Reflect.getMetadata(
				METADATA_KEYS.PARAMETERS,
				target,
				propertyKey,
			) as ParameterMetadata[]) || [];

		const newParameter: ParameterMetadata = {
			index: parameterIndex,
			type: "query",
			key,
		};

		existingParameters.push(newParameter);
		Reflect.defineMetadata(
			METADATA_KEYS.PARAMETERS,
			existingParameters,
			target,
			propertyKey,
		);
	};
}
