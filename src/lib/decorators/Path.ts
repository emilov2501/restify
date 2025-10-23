import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";
import type { ParameterMetadata } from "../types.ts";

/**
 * A parameter decorator that binds a path parameter to a method parameter.
 *
 * @param key - The name of the path parameter to bind
 * @returns A parameter decorator function
 *
 * @example
 * ```typescript
 * class UserController {
 *   getUser(@Path("id") userId: string) {
 *     // userId will contain the value of the "id" path parameter
 *   }
 * }
 * ```
 */
export function Path(key: string): ParameterDecorator {
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
			type: "path",
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
