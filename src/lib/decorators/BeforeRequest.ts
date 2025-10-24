import "reflect-metadata";
import type { AxiosRequestConfig } from "axios";
import { METADATA_KEYS } from "../constants.ts";

/**
 * Interceptor function type for the BeforeRequest decorator.
 * Receives the request config and returns modified config.
 */
export type BeforeRequestInterceptor = (
	config: AxiosRequestConfig,
) => AxiosRequestConfig | Promise<AxiosRequestConfig>;

/**
 * Method decorator that intercepts and modifies the request before it's sent.
 *
 * The interceptor function receives the axios request config and can:
 * - Add/modify headers
 * - Transform request data
 * - Add query parameters
 * - Log requests
 * - Add timestamps or request IDs
 *
 * @example
 * ```ts
 * class ApiRepository extends Restify {
 *   @GET("/data")
 *   @BeforeRequest((config) => {
 *     config.headers = {
 *       ...config.headers,
 *       "X-Request-ID": crypto.randomUUID(),
 *       "X-Timestamp": Date.now().toString(),
 *     };
 *     return config;
 *   })
 *   getData(): Promise<RestifyResponse<Data>> {
 *     return {} as Promise<RestifyResponse<Data>>;
 *   }
 *
 *   @POST("/users")
 *   @BeforeRequest(async (config) => {
 *     // Add auth token dynamically
 *     const token = await getAuthToken();
 *     config.headers = {
 *       ...config.headers,
 *       Authorization: `Bearer ${token}`,
 *     };
 *     return config;
 *   })
 *   createUser(@Body() user: User): Promise<RestifyResponse<User>> {
 *     return {} as Promise<RestifyResponse<User>>;
 *   }
 * }
 * ```
 */
export function BeforeRequest(
	interceptor: BeforeRequestInterceptor,
): MethodDecorator {
	return (target: object, propertyKey: string | symbol): void => {
		Reflect.defineMetadata(
			METADATA_KEYS.BEFORE_REQUEST,
			interceptor,
			target,
			propertyKey,
		);
	};
}
