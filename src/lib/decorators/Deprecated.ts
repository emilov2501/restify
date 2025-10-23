import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";

export interface DeprecatedOptions {
	/**
	 * If true, throws an error when the method is called.
	 * If false (default), logs a warning to console.
	 */
	strict?: boolean;
}

export interface DeprecatedMetadata {
	message?: string;
	options?: DeprecatedOptions;
}

/**
 * Method decorator that marks a method as deprecated.
 *
 * When the method is called:
 * - In normal mode: logs a warning to console
 * - In strict mode: throws an error
 *
 * For IDE support, also add JSDoc @deprecated tag:
 *
 * @example
 * ```ts
 * class TodoRepository extends Restify {
 *   // Logs warning when called
 *   @GET("/old-endpoint")
 *   @Deprecated("Use getNewData() instead")
 *   getOldData() {}
 *
 *   // Throws error when called
 *   @GET("/removed-endpoint")
 *   @Deprecated("This endpoint has been removed", { strict: true })
 *   getRemovedData() {}
 *
 *   // With JSDoc for IDE support
 *   /**
 *    * @deprecated Use getNewTodos() instead
 *    *\/
 *   @GET("/todos")
 *   @Deprecated("Use getNewTodos() instead")
 *   getOldTodos() {}
 * }
 * ```
 */
export function Deprecated(
	message?: string,
	options?: DeprecatedOptions,
): MethodDecorator {
	return (target: object, propertyKey: string | symbol): void => {
		Reflect.defineMetadata(
			METADATA_KEYS.DEPRECATED,
			{ message, options },
			target,
			propertyKey,
		);
	};
}
