import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Restify } from "../../Restify.ts";
import { Collection } from "../Collection.ts";
import { GET } from "../GET.ts";
import { Path } from "../Path.ts";
import { Transform } from "../Transform.ts";

describe("Transform decorator", () => {
	const axiosInstance = axios.create({
		baseURL: "https://api.example.com",
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should transform response data", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: {
				items: [
					{ id: 1, name: "Item 1" },
					{ id: 2, name: "Item 2" },
				],
			},
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@GET("/items")
			@Transform((response: { items: unknown[] }) => response.items)
			getItems(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		const result = await repo.getItems();

		expect(result.data).toEqual([
			{ id: 1, name: "Item 1" },
			{ id: 2, name: "Item 2" },
		]);
		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: "GET",
				url: "/api/items",
			}),
		);
	});

	it("should work with async transform functions", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { value: 10 },
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@GET("/value")
			@Transform(async (data: { value: number }) => {
				await new Promise((resolve) => setTimeout(resolve, 10));
				return { doubled: data.value * 2 };
			})
			getValue(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		const result = await repo.getValue();

		expect(result.data).toEqual({ doubled: 20 });
		expect(mockRequest).toHaveBeenCalled();
	});

	it("should handle array transformations", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: [
				{ id: 1, name: "Todo 1", completed: false },
				{ id: 2, name: "Todo 2", completed: true },
				{ id: 3, name: "Todo 3", completed: false },
			],
			status: 200,
			headers: {},
		});

		@Collection("/todos")
		class TodoRepository extends Restify {
			@GET("")
			@Transform(
				(todos: Array<{ id: number; name: string; completed: boolean }>) =>
					todos.filter((todo) => !todo.completed),
			)
			getActiveTodos(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new TodoRepository(axiosInstance);
		const result = await repo.getActiveTodos();

		expect(result.data).toEqual([
			{ id: 1, name: "Todo 1", completed: false },
			{ id: 3, name: "Todo 3", completed: false },
		]);
	});

	it("should add computed fields", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: {
				firstName: "John",
				lastName: "Doe",
				age: 30,
			},
			status: 200,
			headers: {},
		});

		@Collection("/users")
		class UserRepository extends Restify {
			@GET("/:id")
			@Transform(
				(user: { firstName: string; lastName: string; age: number }) => ({
					...user,
					fullName: `${user.firstName} ${user.lastName}`,
					isAdult: user.age >= 18,
				}),
			)
			getUser(@Path("id") _id: number): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new UserRepository(axiosInstance);
		const result = await repo.getUser(1);

		expect(result.data).toEqual({
			firstName: "John",
			lastName: "Doe",
			age: 30,
			fullName: "John Doe",
			isAdult: true,
		});
	});

	it("should preserve status and headers", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { items: [1, 2, 3] },
			status: 201,
			headers: { "x-custom-header": "value" },
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@GET("/data")
			@Transform((response: { items: number[] }) => response.items)
			getData(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		const result = await repo.getData();

		expect(result.data).toEqual([1, 2, 3]);
		expect(result.status).toBe(201);
		expect(result.headers).toHaveProperty("x-custom-header", "value");
	});

	it("should work without Transform decorator", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { value: 42 },
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@GET("/value")
			getValue(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		const result = await repo.getValue();

		expect(result.data).toEqual({ value: 42 });
		expect(mockRequest).toHaveBeenCalled();
	});

	it("should chain multiple transformations conceptually", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: {
				results: {
					items: [1, 2, 3, 4, 5],
				},
			},
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@GET("/data")
			@Transform(
				(response: { results: { items: number[] } }) =>
					response.results.items.map((n) => n * 2).filter((n) => n > 4),
			)
			getData(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		const result = await repo.getData();

		expect(result.data).toEqual([6, 8, 10]);
	});
});
