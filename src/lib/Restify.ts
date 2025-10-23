import "reflect-metadata";
import axios, { type AxiosInstance } from "axios";
import { METADATA_KEYS } from "./constants.ts";
import type {
	MethodMetadata,
	ParameterMetadata,
	RequestConfig,
	RestifyConfig,
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
	private config?: RestifyConfig;
	private axiosInstance?: AxiosInstance;

	constructor(configOrAxios: RestifyConfig | AxiosInstance) {
		// Check if it's an axios instance
		if (this.isAxiosInstance(configOrAxios)) {
			this.axiosInstance = configOrAxios;
		} else {
			this.config = configOrAxios;
		}

		this.initializeRoutes();
	}

	private isAxiosInstance(obj: unknown): obj is AxiosInstance {
		return (
			obj !== null &&
			typeof obj === "object" &&
			"request" in obj &&
			"get" in obj &&
			"post" in obj
		);
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
		const parameters = (Reflect.getMetadata(
			METADATA_KEYS.PARAMETERS,
			proto,
			propertyKey,
		) || []) as ParameterMetadata[];

		const collectionMetadata = Reflect.getMetadata(
			METADATA_KEYS.COLLECTION,
			this.constructor,
		) as { basePath: string } | undefined;

		let url = methodMetadata.path;
		const queryParams: Record<string, string | number | boolean> = {};
		const headers: Record<string, string> = this.config?.headers
			? { ...this.config.headers }
			: {};
		let body: unknown;

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
			}
		}

		// Build full URL
		const basePath = collectionMetadata?.basePath || "";
		const fullPath = `${basePath}${url}`;
		const baseURL = this.config?.baseURL || "";
		const fullURL = baseURL ? `${baseURL}${fullPath}` : fullPath;

		// Build query string
		const queryString = Object.entries(queryParams)
			.map(
				([key, value]) =>
					`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
			)
			.join("&");

		const finalURL = queryString ? `${fullURL}?${queryString}` : fullURL;

		// Execute request
		const requestConfig: RequestConfig = {
			method: methodMetadata.method,
			url: finalURL,
			headers,
			body,
		};

		return this.request<T>(requestConfig);
	}

	protected async request<T = unknown>(
		config: RequestConfig,
	): Promise<RestifyResponse<T>> {
		// Use axios if configured
		if (this.axiosInstance) {
			return this.requestWithAxios<T>(config);
		}

		// Default to fetch
		return this.requestWithFetch<T>(config);
	}

	private async requestWithFetch<T = unknown>(
		config: RequestConfig,
	): Promise<RestifyResponse<T>> {
		if (!this.config?.baseURL && !config.url.startsWith("http")) {
			throw new Error(
				"baseURL is required when using fetch without axios instance",
			);
		}

		const fetchOptions: RequestInit = {
			method: config.method,
			headers: config.headers,
		};

		if (config.body) {
			if (config.body instanceof FormData) {
				// Let browser set Content-Type with boundary for FormData
				fetchOptions.body = config.body;
			} else {
				fetchOptions.body = JSON.stringify(config.body);
				fetchOptions.headers = {
					...fetchOptions.headers,
					"Content-Type": "application/json",
				};
			}
		}

		const response = await fetch(config.url, fetchOptions);
		const data = (await response.json()) as T;

		const headersRecord: Record<string, string> = {};
		response.headers.forEach((value, key) => {
			headersRecord[key] = value;
		});

		return {
			data,
			status: response.status,
			headers: headersRecord,
		};
	}

	private async requestWithAxios<T = unknown>(
		config: RequestConfig,
	): Promise<RestifyResponse<T>> {
		if (!this.axiosInstance) {
			throw new Error("Axios instance not initialized");
		}

		const response = await this.axiosInstance.request<T>({
			method: config.method,
			url: config.url,
			headers: config.headers,
			data: config.body,
		});

		const headersRecord: Record<string, string> = {};
		for (const [key, value] of Object.entries(response.headers)) {
			if (typeof value === "string") {
				headersRecord[key] = value;
			}
		}

		return {
			data: response.data,
			status: response.status,
			headers: headersRecord,
		};
	}
}
