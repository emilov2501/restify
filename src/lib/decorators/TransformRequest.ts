import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";

/**
 * Transform function type for the TransformRequest decorator.
 * Receives the request data and returns transformed data.
 */
export type TransformRequestFn<TInput = unknown, TOutput = unknown> = (
	data: TInput,
) => TOutput | Promise<TOutput>;

/**
 * Method decorator that transforms the request data before sending it.
 *
 * The transform function receives the request body data and can:
 * - Serialize custom objects
 * - Convert data structures
 * - Add computed fields
 * - Normalize payloads
 *
 * You need to explicitly specify the input type as a generic parameter.
 *
 * @example
 * ```ts
 * interface CreateUserDto {
 *   firstName: string;
 *   lastName: string;
 * }
 *
 * class UserRepository extends Restify {
 *   @POST("/users")
 *   @TransformRequest<CreateUserDto>((user) => ({
 *     ...user,
 *     fullName: `${user.firstName} ${user.lastName}`
 *   }))
 *   createUser(@Body() user: CreateUserDto): Promise<RestifyResponse<User>> {
 *     return {} as Promise<RestifyResponse<User>>;
 *   }
 *
 *   @POST("/data")
 *   @TransformRequest<Record<string, unknown>>((data) => {
 *     // Convert timestamps
 *     return {
 *       ...data,
 *       createdAt: new Date().toISOString()
 *     };
 *   })
 *   sendData(@Body() data: Record<string, unknown>): Promise<RestifyResponse<void>> {}
 * }
 * ```
 */
export function TransformRequest<TInput = unknown, TOutput = unknown>(
	transformFn: TransformRequestFn<TInput, TOutput>,
): MethodDecorator {
	return (target: object, propertyKey: string | symbol): void => {
		Reflect.defineMetadata(
			METADATA_KEYS.TRANSFORM_REQUEST,
			transformFn,
			target,
			propertyKey,
		);
	};
}
