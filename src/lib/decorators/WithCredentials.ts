import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";

/**
 * Decorator that enables sending cookies and authentication credentials
 * with cross-origin requests.
 *
 * Can be used on both classes and methods:
 * - On class: all methods will send credentials
 * - On method: only that specific method will send credentials
 *
 * This is equivalent to setting `withCredentials: true` in Axios config.
 *
 * @example
 * ```ts
 * // Enable credentials for all requests in this class
 * @WithCredentials()
 * @Collection("/api")
 * class AuthRepository extends Restify {
 *   @GET("/profile")
 *   getProfile() {} // Will send cookies
 *
 *   @POST("/logout")
 *   logout() {} // Will send cookies
 * }
 * ```
 *
 * @example
 * ```ts
 * // Enable credentials only for specific methods
 * @Collection("/api")
 * class ApiRepository extends Restify {
 *   @GET("/public")
 *   getPublicData() {} // No credentials
 *
 *   @GET("/private")
 *   @WithCredentials()
 *   getPrivateData() {} // With credentials (cookies)
 * }
 * ```
 *
 * @example
 * ```ts
 * // Method decorator overrides class decorator
 * @WithCredentials() // Default: all methods send credentials
 * @Collection("/api")
 * class ApiRepository extends Restify {
 *   @GET("/data")
 *   getData() {} // With credentials
 *
 *   @GET("/public")
 *   @WithCredentials(false) // Explicitly disable for this method
 *   getPublicData() {} // No credentials
 * }
 * ```
 *
 * Note: The server must respond with appropriate CORS headers:
 * - `Access-Control-Allow-Credentials: true`
 * - `Access-Control-Allow-Origin` must be a specific origin, not `*`
 */
export function WithCredentials(
	enabled = true,
): ClassDecorator & MethodDecorator {
	return (target: object, propertyKey?: string | symbol): void => {
		if (propertyKey) {
			// Method decorator
			Reflect.defineMetadata(
				METADATA_KEYS.WITH_CREDENTIALS,
				enabled,
				target,
				propertyKey,
			);
		} else {
			// Class decorator
			Reflect.defineMetadata(METADATA_KEYS.WITH_CREDENTIALS, enabled, target);
		}
	};
}
