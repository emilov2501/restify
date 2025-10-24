import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Restify } from "../../Restify.ts";
import { BaseUrl } from "../BaseUrl.ts";
import { Collection } from "../Collection.ts";
import { GET } from "../GET.ts";
import { POST } from "../POST.ts";
import { Body } from "../Body.ts";
import { Path } from "../Path.ts";

describe("BaseUrl decorator", () => {
	const axiosInstance = axios.create();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should use baseURL from decorator", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { id: 1, title: "Test" },
			status: 200,
			headers: {},
		});

		@BaseUrl("https://jsonplaceholder.typicode.com")
		@Collection("/todos")
		class TodoRepository extends Restify {
			@GET("/:id")
			getTodo(@Path("id") _id: number): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new TodoRepository(axiosInstance);
		await repo.getTodo(1);

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: "GET",
				url: "https://jsonplaceholder.typicode.com/todos/1",
			}),
		);
	});

	it("should work without Collection decorator", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { success: true },
			status: 200,
			headers: {},
		});

		@BaseUrl("https://api.example.com")
		class ApiRepository extends Restify {
			@GET("/status")
			getStatus(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		await repo.getStatus();

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				url: "https://api.example.com/status",
			}),
		);
	});

	it("should handle baseURL with trailing slash", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: {},
			status: 200,
			headers: {},
		});

		@BaseUrl("https://api.example.com/")
		@Collection("/users")
		class UserRepository extends Restify {
			@GET("/:id")
			getUser(@Path("id") _id: number): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new UserRepository(axiosInstance);
		await repo.getUser(42);

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				url: "https://api.example.com//users/42",
			}),
		);
	});

	it("should work with POST requests", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { id: 1, name: "John" },
			status: 201,
			headers: {},
		});

		@BaseUrl("https://api.example.com")
		@Collection("/users")
		class UserRepository extends Restify {
			@POST("")
			createUser(@Body() _user: unknown): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new UserRepository(axiosInstance);
		await repo.createUser({ name: "John" });

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: "POST",
				url: "https://api.example.com/users",
				data: { name: "John" },
			}),
		);
	});

	it("should work with query parameters", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: [],
			status: 200,
			headers: {},
		});

		@BaseUrl("https://api.example.com")
		@Collection("/search")
		class SearchRepository extends Restify {
			@GET("")
			search(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new SearchRepository(axiosInstance);
		await repo.search();

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				url: "https://api.example.com/search",
			}),
		);
	});

	it("should work without BaseUrl decorator (fallback to axios instance)", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: {},
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@GET("/data")
			getData(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		await repo.getData();

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				url: "/api/data",
			}),
		);
	});

	it("should prioritize BaseUrl over axios instance baseURL", async () => {
		const axiosWithBaseUrl = axios.create({
			baseURL: "https://old-api.example.com",
		});

		const mockRequest = vi
			.spyOn(axiosWithBaseUrl, "request")
			.mockResolvedValue({
				data: {},
				status: 200,
				headers: {},
			});

		@BaseUrl("https://new-api.example.com")
		@Collection("/users")
		class UserRepository extends Restify {
			@GET("/:id")
			getUser(@Path("id") _id: number): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new UserRepository(axiosWithBaseUrl);
		await repo.getUser(1);

		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				url: "https://new-api.example.com/users/1",
			}),
		);
	});
});
