import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";

/**
 * Transform function type for the Transform decorator.
 * Receives the response data and returns transformed data.
 */
export type TransformFn<TInput = unknown, TOutput = unknown> = (
	data: TInput,
) => TOutput | Promise<TOutput>;

/**
 * Method decorator that transforms the response data before returning it.
 *
 * The transform function receives the response data and can:
 * - Extract nested properties
 * - Map/filter arrays
 * - Convert data structures
 * - Add computed fields
 *
 * You need to explicitly specify the input type as a generic parameter.
 *
 * @example
 * ```ts
 * interface Todo {
 *   id: number;
 *   title: string;
 * }
 *
 * class TodoRepository extends Restify {
 *   @GET("/todos")
 *   @Transform<Todo[]>((todos) => todos.map(t => t.title))
 *   getTodos(): Promise<RestifyResponse<Todo[]>> {
 *     return {} as Promise<RestifyResponse<Todo[]>>;
 *   }
 *
 *   @GET("/user/:id")
 *   @Transform<User>((user) => ({
 *     ...user,
 *     fullName: `${user.firstName} ${user.lastName}`
 *   }))
 *   getUser(@Path("id") id: number): Promise<RestifyResponse<User>> {}
 * }
 * ```
 */
export function Transform<TInput = unknown, TOutput = unknown>(
	transformFn: TransformFn<TInput, TOutput>,
): MethodDecorator {
	return (target: object, propertyKey: string | symbol): void => {
		Reflect.defineMetadata(
			METADATA_KEYS.TRANSFORM,
			transformFn,
			target,
			propertyKey,
		);
	};
}
