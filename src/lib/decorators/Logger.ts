import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";

/**
 * Method decorator that enables logging for HTTP requests.
 *
 * When applied to a method, it will log:
 * - Request: method, URL, headers, body
 * - Response: status, headers, data
 * - Errors: error message and details
 *
 * @example
 * ```ts
 * class TodoRepository extends Restify {
 *   @GET("/todos")
 *   @Logger()
 *   getTodos() {}
 *
 *   @POST("/todos")
 *   @Logger()
 *   createTodo(@Body() data: Todo) {}
 * }
 * ```
 */
export function Logger(): MethodDecorator {
	return (target: object, propertyKey: string | symbol): void => {
		Reflect.defineMetadata(METADATA_KEYS.LOGGER, true, target, propertyKey);
	};
}
