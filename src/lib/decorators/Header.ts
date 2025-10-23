import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";
import type { ParameterMetadata } from "../types.ts";

/**
 * Parameter decorator that binds a route handler parameter to a header value.
 *
 * @param key - The name of the header to extract from the request
 * @returns A parameter decorator function
 *
 * @example
 * ```ts
 * class MyController {
 *   handleRequest(@Header("authorization") auth: string) {
 *     // auth will contain the value of the "authorization" header
 *   }
 * }
 * ```
 */

export function Header(key: string): ParameterDecorator {
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
			type: "header",
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
