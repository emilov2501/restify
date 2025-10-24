import axios from "axios";
import {
	AfterResponse,
	BeforeRequest,
	Body,
	Collection,
	GET,
	POST,
	Restify,
} from "../lib/index.ts";
import type { RestifyResponse } from "../lib/types.ts";

interface Todo {
	id: number;
	title: string;
	completed: boolean;
}

interface CreateTodoDto {
	title: string;
	completed: boolean;
}

/**
 * Example repository demonstrating BeforeRequest and AfterResponse decorators
 */
@Collection("/todos")
class TodoInterceptorRepository extends Restify {
	/**
	 * Example 1: Add request ID and timestamp to every request
	 */
	@GET("")
	@BeforeRequest((config) => {
		config.headers = {
			...config.headers,
			"X-Request-ID": crypto.randomUUID(),
			"X-Timestamp": Date.now().toString(),
		};
		console.log("🚀 Request intercepted:", config.url);
		return config;
	})
	@AfterResponse((response) => {
		console.log("✅ Response intercepted:", {
			status: response.status,
			dataSize: JSON.stringify(response.data).length,
		});
		return response;
	})
	getTodosWithInterceptors(): Promise<RestifyResponse<Todo[]>> {
		return {} as Promise<RestifyResponse<Todo[]>>;
	}

	/**
	 * Example 2: Add dynamic authentication token
	 */
	@POST("")
	@BeforeRequest(async (config) => {
		// Simulate fetching token from storage
		const token = await getAuthToken();
		config.headers = {
			...config.headers,
			Authorization: `Bearer ${token}`,
		};
		return config;
	})
	createTodoWithAuth(
		@Body() _todo: CreateTodoDto,
	): Promise<RestifyResponse<Todo>> {
		return {} as Promise<RestifyResponse<Todo>>;
	}

	/**
	 * Example 3: Transform response structure
	 */
	@GET("")
	@AfterResponse((response) => {
		// Wrap response data with metadata
		const data = response.data as Todo[];
		response.data = {
			items: data,
			total: data.length,
			timestamp: Date.now(),
		} as never;
		return response;
	})
	getTodosWithMetadata(): Promise<
		RestifyResponse<{
			items: Todo[];
			total: number;
			timestamp: number;
		}>
	> {
		return {} as Promise<
			RestifyResponse<{
				items: Todo[];
				total: number;
				timestamp: number;
			}>
		>;
	}

	/**
	 * Example 4: Combine multiple interceptors
	 */
	@GET("")
	@BeforeRequest((config) => {
		// Add tracking headers
		config.headers = {
			...config.headers,
			"X-User-Agent": "Restify/1.0",
			"X-API-Version": "v1",
		};
		return config;
	})
	@AfterResponse((response) => {
		// Log performance metrics
		console.log("Performance:", {
			status: response.status,
			contentLength: response.headers["content-length"],
		});
		return response;
	})
	getTodosWithTracking(): Promise<RestifyResponse<Todo[]>> {
		return {} as Promise<RestifyResponse<Todo[]>>;
	}
}

/**
 * Helper function to simulate token retrieval
 */
async function getAuthToken(): Promise<string> {
	// Simulate async token fetch
	await new Promise((resolve) => setTimeout(resolve, 100));
	return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
}

/**
 * Usage examples
 */
async function runInterceptorExamples() {
	const axiosInstance = axios.create({
		baseURL: "https://jsonplaceholder.typicode.com",
		headers: {
			"Content-Type": "application/json",
		},
	});

	const repo = new TodoInterceptorRepository(axiosInstance);

	console.log("=== Example 1: Request/Response Logging ===");
	const todos1 = await repo.getTodosWithInterceptors();
	console.log("Todos:", todos1.data.slice(0, 2));

	console.log("\n=== Example 2: Dynamic Authentication ===");
	const newTodo = await repo.createTodoWithAuth({
		title: "New todo with auth",
		completed: false,
	});
	console.log("Created:", newTodo.data);

	console.log("\n=== Example 3: Response Transformation ===");
	const todosWithMeta = await repo.getTodosWithMetadata();
	console.log("With metadata:", {
		total: todosWithMeta.data.total,
		timestamp: todosWithMeta.data.timestamp,
	});

	console.log("\n=== Example 4: Multiple Interceptors ===");
	const trackedTodos = await repo.getTodosWithTracking();
	console.log("Tracked todos count:", trackedTodos.data.length);
}

// Uncomment to run examples
// runInterceptorExamples().catch(console.error);

export { TodoInterceptorRepository, runInterceptorExamples };
