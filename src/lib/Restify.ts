import "reflect-metadata";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { consola } from "consola";
import { METADATA_KEYS } from "./constants.ts";
import type { AfterResponseInterceptor } from "./decorators/AfterResponse.ts";
import type { BeforeRequestInterceptor } from "./decorators/BeforeRequest.ts";
import {
	type CancelableOptions,
	getAbortController,
} from "./decorators/Cancelable.ts";
import type { RetryOptions } from "./decorators/Retry.ts";
import type {
	MethodMetadata,
	ParameterMetadata,
	RestifyResponse,
} from "./types.ts";

/**
 * Base class for creating type-safe REST API clients.
 *
 * @example
 * ```ts
 * class MyAPI extends Restify {
 *   constructor() {
 *     super({ baseURL: "https://api.example.com" });
 *   }
 *
 *   @Get("/users/:id")
 *   async getUser(@Path("id") id: string) {}
 * }
 * ```
 */
export class Restify {
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance) {
		this.axiosInstance = axiosInstance;
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		const proto = Object.getPrototypeOf(this) as Record<string, unknown>;
		const methodNames = Object.getOwnPropertyNames(proto).filter(
			(name) => name !== "constructor" && typeof proto[name] === "function",
		);

		for (const methodName of methodNames) {
			const methodMetadata = Reflect.getMetadata(
				METADATA_KEYS.METHOD,
				proto as object,
				methodName,
			) as MethodMetadata | undefined;

			if (methodMetadata) {
				proto[methodName] = async (...args: unknown[]) => {
					return this.executeRequest<unknown>(methodMetadata, args, methodName);
				};
			}
		}
	}

	private async executeRequest<T = unknown>(
		methodMetadata: MethodMetadata,
		args: readonly unknown[],
		propertyKey: string,
	): Promise<RestifyResponse<T>> {
		const proto = Object.getPrototypeOf(this) as object;

		// Check if method is deprecated
		const deprecatedMetadata = Reflect.getMetadata(
			METADATA_KEYS.DEPRECATED,
			proto,
			propertyKey,
		) as { message?: string; options?: { strict?: boolean } } | undefined;

		if (deprecatedMetadata) {
			const message =
				deprecatedMetadata.message ||
				`Method '${String(propertyKey)}' is deprecated`;

			if (deprecatedMetadata.options?.strict) {
				throw new Error(message);
			}
			consola.warn(`⚠️  ${message}`);
		}

		const parameters = (Reflect.getMetadata(
			METADATA_KEYS.PARAMETERS,
			proto,
			propertyKey,
		) || []) as ParameterMetadata[];

		const isLoggerEnabled = Reflect.getMetadata(
			METADATA_KEYS.LOGGER,
			proto,
			propertyKey,
		) as boolean | undefined;

		const collectionMetadata = Reflect.getMetadata(
			METADATA_KEYS.COLLECTION,
			this.constructor,
		) as { basePath: string } | undefined;

		let url = methodMetadata.path;
		const queryParams: Record<string, string | number | boolean> = {};
		const headers: Record<string, string> = {};
		const formFields: Record<string, string> = {};
		let body: unknown;
		let uploadProgressCallback: ((progress: number) => void) | undefined;
		let downloadProgressCallback: ((progress: number) => void) | undefined;

		// Check if FormUrlEncoded is enabled
		const isFormUrlEncoded = Reflect.getMetadata(
			METADATA_KEYS.FORM_URL_ENCODED,
			proto,
			propertyKey,
		) as boolean | undefined;

		// Process parameters
		for (const param of parameters) {
			const value = args[param.index];

			if (param.type === "query" && param.key && value !== undefined) {
				queryParams[param.key] = value as string | number | boolean;
			} else if (param.type === "queryMap" && value !== undefined) {
				// Handle dynamic query parameters from object
				const queryObj = value as Record<
					string,
					string | number | boolean | undefined
				>;
				for (const [key, val] of Object.entries(queryObj)) {
					if (val !== undefined && val !== null) {
						queryParams[key] = val;
					}
				}
			} else if (param.type === "path" && param.key && value !== undefined) {
				url = url.replace(`:${param.key}`, String(value));
			} else if (param.type === "body") {
				body = value;
			} else if (param.type === "header" && param.key && value !== undefined) {
				headers[param.key] = String(value);
			} else if (param.type === "field" && param.key && value !== undefined) {
				// Collect form fields for x-www-form-urlencoded
				formFields[param.key] = String(value);
			} else if (param.type === "uploadProgress") {
				// Store upload progress callback
				uploadProgressCallback = value as (progress: number) => void;
			} else if (param.type === "downloadProgress") {
				// Store download progress callback
				downloadProgressCallback = value as (progress: number) => void;
			}
		}

		// If FormUrlEncoded, convert form fields to URL-encoded string
		if (isFormUrlEncoded && Object.keys(formFields).length > 0) {
			body = new URLSearchParams(formFields).toString();
			headers["Content-Type"] = "application/x-www-form-urlencoded";
		}

		// Check if BaseUrl is defined
		const baseUrlMetadata = Reflect.getMetadata(
			METADATA_KEYS.BASE_URL,
			this.constructor,
		) as { baseURL: string } | undefined;

		// Build full URL
		const basePath = collectionMetadata?.basePath || "";
		const fullPath = `${basePath}${url}`;

		// Build query string
		const queryString = Object.entries(queryParams)
			.map(
				([key, value]) =>
					`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
			)
			.join("&");

		// Combine baseURL from decorator (if exists) with path
		let finalURL = queryString ? `${fullPath}?${queryString}` : fullPath;
		if (baseUrlMetadata?.baseURL) {
			// Remove leading slash from fullPath if baseURL is present
			const path = fullPath.startsWith("/") ? fullPath : `/${fullPath}`;
			const pathWithQuery = queryString ? `${path}?${queryString}` : path;
			finalURL = `${baseUrlMetadata.baseURL}${pathWithQuery}`;
		}

		// Log request if logger is enabled
		if (isLoggerEnabled) {
			consola.info(`${propertyKey} →`, {
				method: methodMetadata.method,
				url: finalURL,
				headers: Object.keys(headers).length > 0 ? headers : undefined,
				body: body !== undefined ? body : undefined,
			});
		}

		// Check if ResponseType is defined
		const responseType = Reflect.getMetadata(
			METADATA_KEYS.RESPONSE_TYPE,
			proto,
			propertyKey,
		) as string | undefined;

		// Check if WithCredentials is defined (method overrides class)
		const methodWithCredentials = Reflect.getMetadata(
			METADATA_KEYS.WITH_CREDENTIALS,
			proto,
			propertyKey,
		) as boolean | undefined;

		const classWithCredentials = Reflect.getMetadata(
			METADATA_KEYS.WITH_CREDENTIALS,
			this.constructor,
		) as boolean | undefined;

		// Method decorator takes precedence over class decorator
		const withCredentials =
			methodWithCredentials !== undefined
				? methodWithCredentials
				: classWithCredentials;

		// Check if Retry is defined
		const retryConfig = Reflect.getMetadata(
			METADATA_KEYS.RETRY,
			proto,
			propertyKey,
		) as Required<RetryOptions> | undefined;

		// Execute request with retry logic
		const executeWithRetry = async (
			attempt = 0,
		): Promise<RestifyResponse<T>> => {
			try {
				// Check if Cancelable is enabled
				const cancelableConfig = Reflect.getMetadata(
					METADATA_KEYS.CANCELABLE,
					proto,
					propertyKey,
				) as CancelableOptions | undefined;

				let abortSignal: AbortSignal | undefined;
				if (cancelableConfig) {
					const controller = getAbortController(
						this,
						propertyKey,
						cancelableConfig.strategy ?? "latest",
					);
					abortSignal = controller.signal;
				}

				// Build request config
				let requestConfig: AxiosRequestConfig = {
					method: methodMetadata.method,
					url: finalURL,
					headers,
					data: body,
					responseType: responseType as never,
					withCredentials,
					signal: abortSignal,
					onUploadProgress: uploadProgressCallback
						? (progressEvent) => {
								const total = progressEvent.total || 0;
								const progress =
									total > 0 ? (progressEvent.loaded / total) * 100 : 0;
								uploadProgressCallback?.(Math.round(progress));
							}
						: undefined,
					onDownloadProgress: downloadProgressCallback
						? (progressEvent) => {
								const total = progressEvent.total || 0;
								const progress =
									total > 0 ? (progressEvent.loaded / total) * 100 : 0;
								downloadProgressCallback?.(Math.round(progress));
							}
						: undefined,
				};

				// Check if BeforeRequest interceptor is defined
				const beforeRequestInterceptor = Reflect.getMetadata(
					METADATA_KEYS.BEFORE_REQUEST,
					proto,
					propertyKey,
				) as BeforeRequestInterceptor | undefined;

				if (beforeRequestInterceptor) {
					requestConfig = await beforeRequestInterceptor(requestConfig);
				}

				// Execute request with axios
				let response = await this.axiosInstance.request<T>(requestConfig);

				// Check if AfterResponse interceptor is defined
				const afterResponseInterceptor = Reflect.getMetadata(
					METADATA_KEYS.AFTER_RESPONSE,
					proto,
					propertyKey,
				) as AfterResponseInterceptor<T> | undefined;

				if (afterResponseInterceptor) {
					response = await afterResponseInterceptor(
						response as AxiosResponse<T>,
					);
				}

				// Log response if logger is enabled
				if (isLoggerEnabled) {
					consola.success(`${propertyKey} ✓`, {
						status: response.status,
						data: response.data,
					});
				}

				const headersRecord: Record<string, string> = {};
				for (const [key, value] of Object.entries(response.headers)) {
					if (typeof value === "string") {
						headersRecord[key] = value;
					}
				}

				// Check if Transform function is defined
				const transformFn = Reflect.getMetadata(
					METADATA_KEYS.TRANSFORM,
					proto,
					propertyKey,
				) as ((data: unknown) => unknown) | undefined;

				let transformedData: unknown = response.data;
				if (transformFn) {
					transformedData = await transformFn(response.data);
				}

				return {
					data: transformedData as T,
					status: response.status,
					headers: headersRecord,
				};
			} catch (error) {
				// Log error if logger is enabled
				if (isLoggerEnabled) {
					consola.error(`${propertyKey} ✗`, {
						method: methodMetadata.method,
						url: finalURL,
						error: error instanceof Error ? error.message : String(error),
					});
				}

				// Check if OnError handler is defined
				const errorHandler = Reflect.getMetadata(
					METADATA_KEYS.ON_ERROR,
					proto,
					propertyKey,
				) as ((error: unknown) => unknown) | undefined;

				if (errorHandler) {
					const result = await errorHandler(error);
					// If handler returns a value, use it as the response
					if (result !== undefined) {
						return result as RestifyResponse<T>;
					}
					// If handler returns void/undefined, suppress the error
					return {
						data: undefined as T,
						status: 0,
						headers: {},
					};
				}

				// Retry logic
				if (retryConfig && attempt < retryConfig.attempts) {
					const shouldRetry = retryConfig.shouldRetry(error);

					if (shouldRetry) {
						const delay = Math.min(
							retryConfig.delay * retryConfig.backoff ** attempt,
							retryConfig.maxDelay,
						);

						if (isLoggerEnabled) {
							consola.warn(
								`${propertyKey} ⟳ Retry ${attempt + 1}/${retryConfig.attempts} after ${delay}ms`,
							);
						}

						await new Promise((resolve) => setTimeout(resolve, delay));
						return executeWithRetry(attempt + 1);
					}
				}

				throw error;
			}
		};

		return executeWithRetry();
	}
}
