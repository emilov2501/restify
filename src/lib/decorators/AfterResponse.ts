import "reflect-metadata";
import type { AxiosResponse } from "axios";
import { METADATA_KEYS } from "../constants.ts";

/**
 * Interceptor function type for the AfterResponse decorator.
 * Receives the response and returns modified response.
 */
export type AfterResponseInterceptor<T = unknown> = (
	response: AxiosResponse<T>,
) => AxiosResponse<T> | Promise<AxiosResponse<T>>;

/**
 * Method decorator that intercepts and modifies the response after it's received.
 *
 * The interceptor function receives the axios response and can:
 * - Transform response data
 * - Extract nested properties
 * - Log responses
 * - Add computed fields
 * - Handle special response formats
 *
 * @example
 * ```ts
 * class ApiRepository extends Restify {
 *   @GET("/data")
 *   @AfterResponse((response) => {
 *     console.log("Response received:", {
 *       status: response.status,
 *       size: JSON.stringify(response.data).length,
 *     });
 *     return response;
 *   })
 *   getData(): Promise<RestifyResponse<Data>> {
 *     return {} as Promise<RestifyResponse<Data>>;
 *   }
 *
 *   @GET("/users")
 *   @AfterResponse(async (response) => {
 *     // Transform API response structure
 *     response.data = {
 *       items: response.data,
 *       timestamp: Date.now(),
 *     };
 *     return response;
 *   })
 *   getUsers(): Promise<RestifyResponse<UserResponse>> {
 *     return {} as Promise<RestifyResponse<UserResponse>>;
 *   }
 * }
 * ```
 */
export function AfterResponse<T = unknown>(
	interceptor: AfterResponseInterceptor<T>,
): MethodDecorator {
	return (target: object, propertyKey: string | symbol): void => {
		Reflect.defineMetadata(
			METADATA_KEYS.AFTER_RESPONSE,
			interceptor,
			target,
			propertyKey,
		);
	};
}
