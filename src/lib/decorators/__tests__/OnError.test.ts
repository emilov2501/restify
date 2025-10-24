import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Restify } from "../../Restify.ts";
import { Body } from "../Body.ts";
import { Collection } from "../Collection.ts";
import { GET } from "../GET.ts";
import { OnError } from "../OnError.ts";
import { Path } from "../Path.ts";
import { POST } from "../POST.ts";

describe("OnError decorator", () => {
	const axiosInstance = axios.create({
		baseURL: "https://api.example.com",
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should handle errors and return fallback value", async () => {
		const mockRequest = vi
			.spyOn(axiosInstance, "request")
			.mockRejectedValue(new Error("Network error"));

		@Collection("/todos")
		class TodoRepository extends Restify {
			@GET("/:id")
			@OnError(() => ({
				data: { id: 0, title: "Fallback Todo", completed: false },
				status: 200,
				headers: {},
			}))
			getTodoById(@Path("id") _id: number): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new TodoRepository(axiosInstance);
		const result = await repo.getTodoById(1);

		expect(result).toEqual({
			data: { id: 0, title: "Fallback Todo", completed: false },
			status: 200,
			headers: {},
		});
		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: "GET",
				url: "/todos/1",
			}),
		);
	});

	it("should suppress error when handler returns void", async () => {
		const mockRequest = vi
			.spyOn(axiosInstance, "request")
			.mockRejectedValue(new Error("Network error"));

		const errorHandler = vi.fn(() => undefined);

		@Collection("/todos")
		class TodoRepository extends Restify {
			@GET("/:id")
			@OnError(errorHandler)
			getTodoById(@Path("id") _id: number): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new TodoRepository(axiosInstance);
		const result = await repo.getTodoById(1);

		expect(errorHandler).toHaveBeenCalledWith(expect.any(Error));
		expect(result).toEqual({
			data: undefined,
			status: 0,
			headers: {},
		});
		expect(mockRequest).toHaveBeenCalled();
	});

	it("should rethrow error when handler throws", async () => {
		const mockRequest = vi
			.spyOn(axiosInstance, "request")
			.mockRejectedValue(new Error("Network error"));

		@Collection("/todos")
		class TodoRepository extends Restify {
			@POST("")
			@OnError((error) => {
				throw error; // rethrow
			})
			createTodo(@Body() _todo: unknown): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new TodoRepository(axiosInstance);

		await expect(repo.createTodo({ title: "New Todo" })).rejects.toThrow(
			"Network error",
		);

		expect(mockRequest).toHaveBeenCalled();
	});

	it("should handle async error handlers", async () => {
		vi.spyOn(axiosInstance, "request").mockRejectedValue(
			new Error("Network error"),
		);

		@Collection("/todos")
		class TodoRepository extends Restify {
			@GET("/:id")
			@OnError(async (error) => {
				await new Promise((resolve) => setTimeout(resolve, 10));
				return {
					data: { error: error instanceof Error ? error.message : "Unknown" },
					status: 500,
					headers: {},
				};
			})
			getTodoById(@Path("id") _id: number): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new TodoRepository(axiosInstance);
		const result = await repo.getTodoById(1);

		expect(result).toEqual({
			data: { error: "Network error" },
			status: 500,
			headers: {},
		});
	});

	it("should pass error object to handler", async () => {
		const testError = new Error("Custom error");
		const mockRequest = vi
			.spyOn(axiosInstance, "request")
			.mockRejectedValue(testError);

		const errorHandler = vi.fn(() => ({
			data: null,
			status: 500,
			headers: {},
		}));

		@Collection("/todos")
		class TodoRepository extends Restify {
			@GET("/:id")
			@OnError(errorHandler)
			getTodoById(@Path("id") _id: number): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new TodoRepository(axiosInstance);
		await repo.getTodoById(1);

		expect(errorHandler).toHaveBeenCalledWith(testError);
		expect(mockRequest).toHaveBeenCalled();
	});

	it("should work without OnError decorator", async () => {
		const mockRequest = vi
			.spyOn(axiosInstance, "request")
			.mockRejectedValue(new Error("Network error"));

		@Collection("/todos")
		class TodoRepository extends Restify {
			@GET("/:id")
			getTodoById(@Path("id") _id: number): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new TodoRepository(axiosInstance);

		await expect(repo.getTodoById(1)).rejects.toThrow("Network error");
		expect(mockRequest).toHaveBeenCalled();
	});
});
