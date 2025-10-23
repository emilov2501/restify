import { beforeEach, describe, expect, it, vi } from "vitest";
import "reflect-metadata";
import axios from "axios";
import { Collection } from "../decorators/Collection.ts";
import { Body, GET, POST } from "../decorators/index.ts";
import { Restify } from "../Restify.ts";

// Mock axios
vi.mock("axios");

describe("Restify with Axios", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

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

	it("should use fetch by default when client is not specified", async () => {
		global.fetch = vi.fn().mockResolvedValue({
			json: () => Promise.resolve({ id: 1 }),
			status: 200,
			headers: new Map(),
		});

		@Collection("/api")
		class TestRepository extends Restify {
			@GET("/users")
			getUsers() {
				return {} as Promise<{ data: unknown }>;
			}
		}

		const repo = new TestRepository({
			baseURL: "https://api.example.com",
		});

		await repo.getUsers();

		expect(global.fetch).toHaveBeenCalledWith(
			"https://api.example.com/api/users",
			expect.any(Object),
		);
		expect(axios.create).not.toHaveBeenCalled();
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
