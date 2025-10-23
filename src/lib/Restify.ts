import "reflect-metadata";
import type { AxiosInstance } from "axios";
import { METADATA_KEYS } from "./constants.ts";
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
		const headers: Record<string, string> = {};
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

		// Build query string
		const queryString = Object.entries(queryParams)
			.map(
				([key, value]) =>
					`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
			)
			.join("&");

		const finalURL = queryString ? `${fullPath}?${queryString}` : fullPath;

		// Execute request with axios
		const response = await this.axiosInstance.request<T>({
			method: methodMetadata.method,
			url: finalURL,
			headers,
			data: body,
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
