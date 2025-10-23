export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type HttpClient = "fetch" | "axios";

export interface RestifyConfig {
	baseURL: string;
	headers?: Record<string, string>;
	timeout?: number;
	client?: HttpClient;
}

export interface MethodMetadata {
	method: HttpMethod;
	path: string;
	propertyKey: string;
}

export interface ParameterMetadata {
	index: number;
	type: "query" | "path" | "body" | "header" | "queryMap";
	key?: string;
}

export interface CollectionMetadata {
	basePath: string;
}

export interface RequestConfig {
	method: HttpMethod;
	url: string;
	headers?: Record<string, string>;
	params?: Record<string, string | number | boolean>;
	body?: unknown;
}

export interface RestifyResponse<T = unknown> {
	data: T;
	status: number;
	headers: Record<string, string>;
}
