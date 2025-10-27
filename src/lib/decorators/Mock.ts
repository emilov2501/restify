import "reflect-metadata";
import { METADATA_KEYS } from "../constants.ts";

export type MockHandler<T = unknown> = () => T | Promise<T>;

export interface MockOptions<T = unknown> {
	data: T | MockHandler<T>;
	delay?: number;
	status?: number;
	enabled?: boolean;
}

/**
 * Decorator to mock method responses during development.
 * Useful when backend is not ready yet.
 *
 * @param options - Mock configuration
 * @param options.data - Mock data or function that returns mock data
 * @param options.delay - Delay in milliseconds to simulate network latency (optional)
 * @param options.status - HTTP status code (default: 200)
 * @param options.enabled - Whether mock is enabled (default: true in development, false in production)
 *
 * @example
 * ```ts
 * @GET("/users")
 * @Mock({
 *   data: [{ id: 1, name: "John" }],
 *   delay: 500
 * })
 * getUsers(): Promise<User[]> {}
 *
 * @GET("/:id")
 * @Mock({
 *   data: () => ({ id: 1, name: "John", timestamp: Date.now() })
 * })
 * getUser(@Path("id") id: number): Promise<User> {}
 * ```
 */
export function Mock<T = unknown>(options: MockOptions<T>): MethodDecorator {
	return (target: object, propertyKey: string | symbol) => {
		Reflect.defineMetadata(METADATA_KEYS.MOCK, options, target, propertyKey);
	};
}
