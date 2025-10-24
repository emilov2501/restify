import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";

/**
 * Configuration options for the Retry decorator.
 */
export interface RetryOptions {
	/**
	 * Maximum number of retry attempts.
	 * @default 3
	 */
	attempts?: number;

	/**
	 * Initial delay between retries in milliseconds.
	 * @default 1000
	 */
	delay?: number;

	/**
	 * Backoff multiplier for exponential backoff.
	 * Set to 1 for constant delay, >1 for exponential backoff.
	 * @default 2
	 */
	backoff?: number;

	/**
	 * Maximum delay between retries in milliseconds.
	 * Useful to prevent exponential backoff from becoming too long.
	 * @default 30000 (30 seconds)
	 */
	maxDelay?: number;

	/**
	 * Predicate function to determine if an error should trigger a retry.
	 * Return true to retry, false to throw immediately.
	 * @default Retries on network errors and 5xx status codes
	 */
	shouldRetry?: (error: unknown) => boolean;
}

/**
 * Method decorator that automatically retries failed requests.
 *
 * Features:
 * - Configurable retry attempts
 * - Exponential backoff support
 * - Custom retry conditions
 * - Maximum delay cap
 *
 * @example
 * ```ts
 * class ApiRepository extends Restify {
 *   // Simple retry with defaults (3 attempts, 1s delay, 2x backoff)
 *   @GET("/unstable")
 *   @Retry()
 *   getUnstableData(): Promise<RestifyResponse<Data>> {
 *     return {} as Promise<RestifyResponse<Data>>;
 *   }
 *
 *   // Custom configuration
 *   @GET("/flaky")
 *   @Retry({
 *     attempts: 5,
 *     delay: 2000,
 *     backoff: 1.5,
 *     maxDelay: 10000,
 *   })
 *   getFlakyData(): Promise<RestifyResponse<Data>> {
 *     return {} as Promise<RestifyResponse<Data>>;
 *   }
 *
 *   // Custom retry condition
 *   @GET("/api")
 *   @Retry({
 *     attempts: 3,
 *     shouldRetry: (error: any) => {
 *       // Only retry on 503 Service Unavailable
 *       return error.response?.status === 503;
 *     },
 *   })
 *   getData(): Promise<RestifyResponse<Data>> {
 *     return {} as Promise<RestifyResponse<Data>>;
 *   }
 * }
 * ```
 */
export function Retry(options?: RetryOptions): MethodDecorator {
	const config: Required<RetryOptions> = {
		attempts: options?.attempts ?? 3,
		delay: options?.delay ?? 1000,
		backoff: options?.backoff ?? 2,
		maxDelay: options?.maxDelay ?? 30000,
		shouldRetry:
			options?.shouldRetry ??
			((error: unknown) => {
				// Default: retry on network errors and 5xx status codes
				if (error && typeof error === "object" && "response" in error) {
					const response = (error as { response?: { status?: number } })
						.response;
					return response?.status ? response.status >= 500 : true;
				}
				return true; // Retry on network errors (no response)
			}),
	};

	return (target: object, propertyKey: string | symbol): void => {
		Reflect.defineMetadata(METADATA_KEYS.RETRY, config, target, propertyKey);
	};
}
