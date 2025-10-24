import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";

export interface BaseUrlMetadata {
	baseURL: string;
}

/**
 * Class decorator that sets the base URL for all HTTP requests.
 *
 * This allows you to define the base URL at the class level instead of
 * passing it to the constructor, making the code more declarative.
 *
 * @param baseURL - The base URL for all requests (e.g., "https://api.example.com")
 *
 * @example
 * ```ts
 * @BaseUrl("https://jsonplaceholder.typicode.com")
 * @Collection("/todos")
 * class TodoRepository extends Restify {
 *   @GET("/:id")
 *   getTodo(@Path("id") id: number) {}
 *   // Request will be made to: https://jsonplaceholder.typicode.com/todos/1
 * }
 *
 * // Usage - no need to pass baseURL to constructor
 * const repo = new TodoRepository(axiosInstance);
 * ```
 *
 * @example
 * ```ts
 * // Can be combined with Collection
 * @BaseUrl("https://api.github.com")
 * @Collection("/repos")
 * class GitHubRepository extends Restify {
 *   @GET("/:owner/:repo")
 *   getRepo(@Path("owner") owner: string, @Path("repo") repo: string) {}
 *   // Request: https://api.github.com/repos/facebook/react
 * }
 * ```
 */
export function BaseUrl(baseURL: string): ClassDecorator {
	return (target: object) => {
		const metadata: BaseUrlMetadata = { baseURL };
		Reflect.defineMetadata(METADATA_KEYS.BASE_URL, metadata, target);
	};
}
