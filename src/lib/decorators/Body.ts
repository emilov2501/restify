import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";
import type { ParameterMetadata } from "../types.ts";

/**
 * Parameter decorator that marks a parameter to receive the request body.
 *
 * @returns A parameter decorator function
 *
 * @example
 * ```ts
 * class MyController {
 *   createUser(@Body() userData: User) {
 *     // userData contains the parsed request body
 *   }
 * }
 * ```
 */

export function Body(): ParameterDecorator {
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
			type: "body",
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
