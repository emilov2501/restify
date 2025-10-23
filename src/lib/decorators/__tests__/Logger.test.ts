import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "reflect-metadata";
import { consola } from "consola";
import { Collection } from "../Collection.ts";
import { Body, GET, Logger, POST } from "../index.ts";
import { Restify } from "../../Restify.ts";

describe("Logger decorator", () => {
	let consolaInfoSpy: ReturnType<typeof vi.spyOn>;
	let consolaSuccessSpy: ReturnType<typeof vi.spyOn>;
	let consolaErrorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		consolaInfoSpy = vi.spyOn(consola, "info").mockImplementation(() => {});
		consolaSuccessSpy = vi.spyOn(consola, "success").mockImplementation(() => {});
		consolaErrorSpy = vi.spyOn(consola, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		consolaInfoSpy.mockRestore();
		consolaSuccessSpy.mockRestore();
		consolaErrorSpy.mockRestore();
	});

	it("should log request and response when Logger decorator is applied", async () => {
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
			@Logger()
			getUsers() {
				return {} as Promise<{ data: unknown }>;
			}
		}

		const repo = new TestRepository(mockAxios as never);
		await repo.getUsers();

		// Check request log
		expect(consolaInfoSpy).toHaveBeenCalledWith(
			"getUsers →",
			expect.objectContaining({
				method: "GET",
				url: "/api/users",
			}),
		);

		// Check response log
		expect(consolaSuccessSpy).toHaveBeenCalledWith(
			"getUsers ✓",
			expect.objectContaining({
				status: 200,
				data: { id: 1, name: "Test" },
			}),
		);
	});

	it("should not log when Logger decorator is not applied", async () => {
		const mockAxios = {
			request: vi.fn().mockResolvedValue({
				data: { id: 1 },
				status: 200,
				headers: {},
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

		expect(consolaInfoSpy).not.toHaveBeenCalled();
		expect(consolaSuccessSpy).not.toHaveBeenCalled();
	});

	it("should log POST request with body", async () => {
		const mockAxios = {
			request: vi.fn().mockResolvedValue({
				data: { id: 1, created: true },
				status: 201,
				headers: {},
			}),
		};

		@Collection("/api")
		class TestRepository extends Restify {
			@POST("/users")
			@Logger()
			createUser(@Body() _data: unknown) {
				return {} as Promise<{ data: unknown }>;
			}
		}

		const repo = new TestRepository(mockAxios as never);
		await repo.createUser({ name: "John", email: "john@example.com" });

		expect(consolaInfoSpy).toHaveBeenCalledWith(
			"createUser →",
			expect.objectContaining({
				method: "POST",
				url: "/api/users",
				body: { name: "John", email: "john@example.com" },
			}),
		);
	});

	it("should log error when request fails", async () => {
		const mockError = new Error("Network error");
		const mockAxios = {
			request: vi.fn().mockRejectedValue(mockError),
		};

		@Collection("/api")
		class TestRepository extends Restify {
			@GET("/users")
			@Logger()
			getUsers() {
				return {} as Promise<{ data: unknown }>;
			}
		}

		const repo = new TestRepository(mockAxios as never);

		await expect(repo.getUsers()).rejects.toThrow("Network error");

		expect(consolaErrorSpy).toHaveBeenCalledWith(
			"getUsers ✗",
			expect.objectContaining({
				method: "GET",
				url: "/api/users",
				error: "Network error",
			}),
		);
	});

	it("should not log error when Logger is not applied", async () => {
		const mockError = new Error("Network error");
		const mockAxios = {
			request: vi.fn().mockRejectedValue(mockError),
		};

		@Collection("/api")
		class TestRepository extends Restify {
			@GET("/users")
			getUsers() {
				return {} as Promise<{ data: unknown }>;
			}
		}

		const repo = new TestRepository(mockAxios as never);

		await expect(repo.getUsers()).rejects.toThrow("Network error");

		expect(consolaErrorSpy).not.toHaveBeenCalled();
	});
});
