export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface MethodMetadata {
	method: HttpMethod;
	path: string;
	propertyKey: string;
}

export interface ParameterMetadata {
	index: number;
	type: "query" | "path" | "body" | "header" | "queryMap" | "field";
	key?: string;
}

export interface CollectionMetadata {
	basePath: string;
}


export interface RestifyResponse<T = unknown> {
	data: T;
	status: number;
	headers: Record<string, string>;
}
