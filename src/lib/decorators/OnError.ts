import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";

/**
 * Error handler type for the OnError decorator.
 * Receives the error and can either:
 * - Return a transformed value
 * - Rethrow the error
 * - Return void to suppress the error
 */
export type ErrorHandler<T = unknown> = (
	error: unknown,
) => T | Promise<T> | void;

/**
 * Method decorator that handles errors thrown during HTTP requests.
 *
 * When an error occurs, the provided handler will be called with the error.
 * The handler can:
 * - Return a fallback value
 * - Transform the error
 * - Suppress the error (return void)
 * - Rethrow the error
 *
 * @example
 * ```ts
 * class TodoRepository extends Restify {
 *   @GET("/todos/:id")
 *   @OnError((error) => {
 *     console.error("Failed to fetch todo:", error);
 *     return { data: null, error: true };
 *   })
 *   getTodoById(@Path("id") id: number) {}
 *
 *   @POST("/todos")
 *   @OnError((error) => {
 *     if (error instanceof NetworkError) {
 *       return { data: null, offline: true };
 *     }
 *     throw error; // rethrow other errors
 *   })
 *   createTodo(@Body() todo: Todo) {}
 * }
 * ```
 */
export function OnError<T = unknown>(
	handler: ErrorHandler<T>,
): MethodDecorator {
	return (target: object, propertyKey: string | symbol): void => {
		Reflect.defineMetadata(METADATA_KEYS.ON_ERROR, handler, target, propertyKey);
	};
}
