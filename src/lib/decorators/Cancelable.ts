import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";

/**
 * Configuration options for the Cancelable decorator.
 */
export interface CancelableOptions {
	/**
	 * Strategy for request cancellation.
	 * - 'latest': Cancel previous request when a new one is made (default)
	 * - 'all': Allow all requests, but provide manual cancellation
	 */
	strategy?: "latest" | "all";
}

// Store per-method abort controllers
const controllerStore = new WeakMap<
	object,
	Map<string | symbol, AbortController>
>();

/**
 * Method decorator that adds request cancellation support.
 *
 * By default, cancels previous request when a new one is made.
 * Useful for search inputs, autocomplete, and other scenarios where
 * only the latest request matters.
 *
 * Features:
 * - Automatic cancellation of pending requests
 * - Multiple cancellation strategies
 * - Works seamlessly with Axios
 * - Integrates with existing decorators
 *
 * @param options - Configuration options
 * @returns A method decorator
 *
 * @example
 * ```ts
 * class UserApi extends Restify {
 *   // Cancel previous search when new one starts
 *   @GET("/users/search")
 *   @Cancelable()
 *   searchUsers(@Query("q") query: string): Promise<RestifyResponse<User[]>> {
 *     return {} as Promise<RestifyResponse<User[]>>;
 *   }
 *
 *   // Allow parallel requests
 *   @GET("/users/:id")
 *   @Cancelable({ strategy: 'all' })
 *   getUser(@Path("id") id: string): Promise<RestifyResponse<User>> {
 *     return {} as Promise<RestifyResponse<User>>;
 *   }
 *
 *   // Works with other decorators
 *   @GET("/data")
 *   @Cancelable()
 *   @Retry({ attempts: 3 })
 *   @Logger()
 *   getData(@Query("page") page: number): Promise<RestifyResponse<Data>> {
 *     return {} as Promise<RestifyResponse<Data>>;
 *   }
 * }
 * ```
 */
export function Cancelable(options?: CancelableOptions): MethodDecorator {
	const strategy = options?.strategy ?? "latest";

	return (target: object, propertyKey: string | symbol): void => {
		Reflect.defineMetadata(
			METADATA_KEYS.CANCELABLE,
			{ strategy },
			target,
			propertyKey,
		);
	};
}

/**
 * Get or create abort controller for a method.
 * Internal function used by Restify to manage request cancellation.
 *
 * @param instance - The class instance
 * @param propertyKey - The method name
 * @param strategy - Cancellation strategy
 * @returns AbortController for the request
 */
export function getAbortController(
	instance: object,
	propertyKey: string | symbol,
	strategy: "latest" | "all",
): AbortController {
	if (!controllerStore.has(instance)) {
		controllerStore.set(instance, new Map());
	}

	const instanceMap = controllerStore.get(instance)!;

	// Cancel previous request if strategy is 'latest'
	if (strategy === "latest") {
		const existingController = instanceMap.get(propertyKey);
		if (existingController) {
			existingController.abort();
		}
	}

	const controller = new AbortController();
	instanceMap.set(propertyKey, controller);

	return controller;
}
