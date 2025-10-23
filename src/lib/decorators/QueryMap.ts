import "reflect-metadata";
import type { ParameterMetadata } from "../types.ts";
import { METADATA_KEYS } from "../constants.ts";

/**
 * Decorator for dynamic query parameters from an object.
 * Useful for filters, search parameters, etc.
 *
 * @example
 * ```ts
 * @GET("/users")
 * getUsers(@QueryMap() filters: { name?: string; age?: number; status?: string }) {}
 *
 * // Usage: getUsers({ name: "John", status: "active" })
 * // Result: GET /users?name=John&status=active
 * ```
 */
export function QueryMap(): ParameterDecorator {
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
			type: "queryMap",
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
