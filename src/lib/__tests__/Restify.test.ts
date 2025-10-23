import { beforeEach, describe, expect, it, vi } from "vitest";
import "reflect-metadata";

import { Collection } from "../decorators/Collection.ts";
import {
	Body,
	GET,
	Header,
	Path,
	POST,
	PUT,
	Query,
	QueryMap,
} from "../decorators/index.ts";
import { Restify } from "../Restify.ts";

describe("Restify", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("Basic HTTP requests", () => {
		it("should make GET request", async () => {
			const mockAxios = {
				request: vi.fn().mockResolvedValue({
					data: { id: 1, name: "Test" },
					status: 200,
					headers: { "content-type": "application/json" },
				}),
			};

			@Collection("/api")
			class TestRepository extends Restify {
				@GET("/users")
				getUsers() {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxios as never);

			await repo.getUsers();

			expect(mockAxios.request).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					url: "/api/users",
				}),
			);
		});

		it("should make POST request with body", async () => {
			const mockAxios = {
				request: vi.fn().mockResolvedValue({
					data: { id: 1, name: "Created" },
					status: 201,
					headers: {},
				}),
			};

			@Collection("/api")
			class TestRepository extends Restify {
				@POST("/users")
				createUser(@Body() _data: unknown) {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxios as never);

			await repo.createUser({ name: "Test" });

			expect(mockAxios.request).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					url: "/api/users",
					data: { name: "Test" },
				}),
			);
		});
	});

	describe("Path parameters", () => {
		it("should replace path parameters in URL", async () => {
			const mockAxios = {
				request: vi.fn().mockResolvedValue({
					data: { id: 123 },
					status: 200,
					headers: {},
				}),
			};

			@Collection("/api")
			class TestRepository extends Restify {
				@GET("/users/:id")
				getUser(@Path("id") _id: number) {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxios as never);

			await repo.getUser(123);

			expect(mockAxios.request).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					url: "/api/users/123",
				}),
			);
		});

		it("should handle multiple path parameters", async () => {
			const mockAxios = {
				request: vi.fn().mockResolvedValue({
					data: {},
					status: 200,
					headers: {},
				}),
			};

			@Collection("/api")
			class TestRepository extends Restify {
				@GET("/users/:userId/posts/:postId")
				getPost(
					@Path("userId") _userId: number,
					@Path("postId") _postId: number,
				) {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxios as never);

			await repo.getPost(1, 42);

			expect(mockAxios.request).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					url: "/api/users/1/posts/42",
				}),
			);
		});
	});

	describe("Query parameters", () => {
		it("should add query parameters to URL", async () => {
			const mockAxios = {
				request: vi.fn().mockResolvedValue({
					data: [],
					status: 200,
					headers: {},
				}),
			};

			@Collection("/api")
			class TestRepository extends Restify {
				@GET("/users")
				getUsers(@Query("page") _page: number, @Query("limit") _limit: number) {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxios as never);

			await repo.getUsers(1, 10);

			const callUrl = mockAxios.request.mock.calls[0][0].url as string;
			expect(callUrl).toContain("/api/users?");
			expect(callUrl).toContain("page=1");
			expect(callUrl).toContain("limit=10");
		});

		it("should handle special characters in query parameters", async () => {
			const mockAxios = {
				request: vi.fn().mockResolvedValue({
					data: [],
					status: 200,
					headers: {},
				}),
			};

			@Collection("/api")
			class TestRepository extends Restify {
				@GET("/search")
				search(@Query("q") _query: string) {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxios as never);

			await repo.search("hello world");

			expect(mockAxios.request).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					url: "/api/search?q=hello%20world",
				}),
			);
		});
	});

	describe("Headers", () => {
		it("should add custom headers", async () => {
			const mockAxios = {
				request: vi.fn().mockResolvedValue({
					data: {},
					status: 200,
					headers: {},
				}),
			};

			@Collection("/api")
			class TestRepository extends Restify {
				@GET("/users")
				getUsers(@Header("Authorization") _token: string) {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxios as never);

			await repo.getUsers("Bearer token123");

			expect(mockAxios.request).toHaveBeenCalledWith(
				expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: "Bearer token123",
					}),
				}),
			);
		});

		it("should merge headers with parameter headers", async () => {
			const mockAxios = {
				request: vi.fn().mockResolvedValue({
					data: {},
					status: 200,
					headers: {},
				}),
			};

			@Collection("/api")
			class TestRepository extends Restify {
				@GET("/users")
				getUsers(@Header("X-Custom") _custom: string) {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxios as never);

			await repo.getUsers("value");

			expect(mockAxios.request).toHaveBeenCalledWith(
				expect.objectContaining({
					headers: expect.objectContaining({
						"X-Custom": "value",
					}),
				}),
			);
		});
	});

	describe("Collection decorator", () => {
		it("should prepend collection path to endpoint", async () => {
			const mockAxios = {
				request: vi.fn().mockResolvedValue({
					data: {},
					status: 200,
					headers: {},
				}),
			};

			@Collection("/api/v1")
			class TestRepository extends Restify {
				@GET("/users")
				getUsers() {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxios as never);

			await repo.getUsers();

			expect(mockAxios.request).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					url: "/api/v1/users",
				}),
			);
		});

		it("should work without Collection decorator", async () => {
			const mockAxios = {
				request: vi.fn().mockResolvedValue({
					data: {},
					status: 200,
					headers: {},
				}),
			};

			class TestRepository extends Restify {
				@GET("/users")
				getUsers() {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxios as never);

			await repo.getUsers();

			expect(mockAxios.request).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					url: "/users",
				}),
			);
		});
	});

	describe("QueryMap support", () => {
		it("should handle dynamic query parameters from object", async () => {
			const mockAxios = {
				request: vi.fn().mockResolvedValue({
					data: [],
					status: 200,
					headers: {},
				}),
			};

			@Collection("/api")
			class TestRepository extends Restify {
				@GET("/users")
				getUsers(@QueryMap() _filters: Record<string, string | number>) {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxios as never);

			await repo.getUsers({ name: "John", age: 25, status: "active" });

			const callUrl = mockAxios.request.mock.calls[0][0].url as string;
			expect(callUrl).toContain("/api/users?");
			expect(callUrl).toContain("name=John");
			expect(callUrl).toContain("age=25");
			expect(callUrl).toContain("status=active");
		});

		it("should skip undefined and null values in QueryMap", async () => {
			const mockAxios = {
				request: vi.fn().mockResolvedValue({
					data: [],
					status: 200,
					headers: {},
				}),
			};

			@Collection("/api")
			class TestRepository extends Restify {
				@GET("/users")
				getUsers(
					@QueryMap() _filters: Record<string, string | number | undefined>,
				) {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxios as never);

			await repo.getUsers({ name: "John", age: undefined, status: "active" });

			const callUrl = mockAxios.request.mock.calls[0][0].url as string;
			expect(callUrl).toContain("name=John");
			expect(callUrl).toContain("status=active");
			expect(callUrl).not.toContain("age");
		});

		it("should work with empty QueryMap object", async () => {
			const mockAxios = {
				request: vi.fn().mockResolvedValue({
					data: [],
					status: 200,
					headers: {},
				}),
			};

			@Collection("/api")
			class TestRepository extends Restify {
				@GET("/users")
				getUsers(@QueryMap() _filters: Record<string, string>) {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxios as never);

			await repo.getUsers({});

			expect(mockAxios.request).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					url: "/api/users",
				}),
			);
		});

		it("should combine QueryMap with regular Query parameters", async () => {
			const mockAxios = {
				request: vi.fn().mockResolvedValue({
					data: [],
					status: 200,
					headers: {},
				}),
			};

			@Collection("/api")
			class TestRepository extends Restify {
				@GET("/users")
				getUsers(
					@Query("page") _page: number,
					@QueryMap() _filters: Record<string, string>,
				) {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxios as never);

			await repo.getUsers(1, { name: "John", status: "active" });

			const callUrl = mockAxios.request.mock.calls[0][0].url as string;
			expect(callUrl).toContain("/api/users?");
			expect(callUrl).toContain("page=1");
			expect(callUrl).toContain("name=John");
			expect(callUrl).toContain("status=active");
		});
	});

	describe("FormData support", () => {
		it("should handle FormData in POST request", async () => {
			const mockAxios = {
				request: vi.fn().mockResolvedValue({
					data: { id: 1, success: true },
					status: 201,
					headers: {},
				}),
			};

			@Collection("/api")
			class TestRepository extends Restify {
				@POST("/upload")
				uploadFile(@Body() _data: FormData) {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxios as never);

			const formData = new FormData();
			formData.append("file", "test.txt");
			formData.append("name", "Test File");

			await repo.uploadFile(formData);

			expect(mockAxios.request).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					url: "/api/upload",
					data: formData,
				}),
			);
		});

		it("should handle FormData in PUT request", async () => {
			const mockAxios = {
				request: vi.fn().mockResolvedValue({
					data: { id: 1, updated: true },
					status: 200,
					headers: {},
				}),
			};

			@Collection("/api")
			class TestRepository extends Restify {
				@PUT("/files/:id")
				updateFile(@Path("id") _id: number, @Body() _data: FormData) {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxios as never);

			const formData = new FormData();
			formData.append("file", "updated.txt");

			await repo.updateFile(123, formData);

			expect(mockAxios.request).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "PUT",
					url: "/api/files/123",
					data: formData,
				}),
			);
		});

		it("should handle regular JSON body when not FormData", async () => {
			const mockAxios = {
				request: vi.fn().mockResolvedValue({
					data: { id: 1 },
					status: 200,
					headers: {},
				}),
			};

			@Collection("/api")
			class TestRepository extends Restify {
				@POST("/users")
				createUser(@Body() _data: unknown) {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxios as never);

			await repo.createUser({ name: "Test" });

			expect(mockAxios.request).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					url: "/api/users",
					data: { name: "Test" },
				}),
			);
		});
	});

	describe("Complex scenarios", () => {
		it("should handle all parameter types together", async () => {
			const mockAxios = {
				request: vi.fn().mockResolvedValue({
					data: {},
					status: 200,
					headers: {},
				}),
			};

			@Collection("/api")
			class TestRepository extends Restify {
				@POST("/users/:id/posts")
				createPost(
					@Path("id") _userId: number,
					@Query("draft") _draft: boolean,
					@Body() _data: unknown,
					@Header("X-Request-ID") _requestId: string,
				) {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxios as never);

			await repo.createPost(123, true, { title: "Test" }, "req-456");

			expect(mockAxios.request).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					url: "/api/users/123/posts?draft=true",
					data: { title: "Test" },
					headers: expect.objectContaining({
						"X-Request-ID": "req-456",
					}),
				}),
			);
		});
	});

	describe("Axios instance", () => {
		it("should accept axios instance directly in constructor", async () => {
			const mockAxiosInstance = {
				request: vi.fn().mockResolvedValue({
					data: { id: 1, name: "Test" },
					status: 200,
					headers: { "content-type": "application/json" },
				}),
				get: vi.fn(),
				post: vi.fn(),
			};

			@Collection("/api")
			class TestRepository extends Restify {
				@GET("/users")
				getUsers() {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxiosInstance as never);

			await repo.getUsers();

			expect(mockAxiosInstance.request).toHaveBeenCalledWith({
				method: "GET",
				url: "/api/users",
				headers: {},
				data: undefined,
			});
		});

		it("should handle POST with axios instance", async () => {
			const mockAxiosInstance = {
				request: vi.fn().mockResolvedValue({
					data: { id: 1, created: true },
					status: 201,
					headers: {},
				}),
				get: vi.fn(),
				post: vi.fn(),
			};

			@Collection("/api")
			class TestRepository extends Restify {
				@POST("/users")
				createUser(@Body() _data: unknown) {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxiosInstance as never);

			await repo.createUser({ name: "John" });

			expect(mockAxiosInstance.request).toHaveBeenCalledWith({
				method: "POST",
				url: "/api/users",
				headers: {},
				data: { name: "John" },
			});
		});

		it("should work with custom axios instance with baseURL", async () => {
			const mockAxiosInstance = {
				request: vi.fn().mockResolvedValue({
					data: { success: true },
					status: 200,
					headers: {},
				}),
				get: vi.fn(),
				post: vi.fn(),
			};

			class TestRepository extends Restify {
				@GET("/test")
				test() {
					return {} as Promise<{ data: unknown }>;
				}
			}

			const repo = new TestRepository(mockAxiosInstance as never);
			const result = await repo.test();

			expect(result.data).toEqual({ success: true });
			expect(mockAxiosInstance.request).toHaveBeenCalled();
		});
	});
});
