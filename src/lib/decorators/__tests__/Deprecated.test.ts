import axios from "axios";
import { consola } from "consola";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Restify } from "../../Restify.ts";
import { Collection } from "../Collection.ts";
import { Deprecated } from "../Deprecated.ts";
import { GET } from "../GET.ts";

describe("Deprecated decorator", () => {
	const axiosInstance = axios.create({
		baseURL: "https://api.example.com",
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should log warning when deprecated method is called", async () => {
		const consolaWarnSpy = vi
			.spyOn(consola, "warn")
			.mockImplementation(() => {});
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { value: 42 },
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@GET("/old-endpoint")
			@Deprecated("Use getNewData() instead")
			getOldData(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		await repo.getOldData();

		expect(consolaWarnSpy).toHaveBeenCalledWith("⚠️  Use getNewData() instead");
		expect(mockRequest).toHaveBeenCalled();
	});

	it("should use default message when no message provided", async () => {
		const consolaWarnSpy = vi
			.spyOn(consola, "warn")
			.mockImplementation(() => {});
		vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { value: 42 },
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@GET("/old-endpoint")
			@Deprecated()
			getOldData(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		await repo.getOldData();

		expect(consolaWarnSpy).toHaveBeenCalledWith(
			"⚠️  Method 'getOldData' is deprecated",
		);
	});

	it("should throw error in strict mode", async () => {
		vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { value: 42 },
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@GET("/removed-endpoint")
			@Deprecated("This endpoint has been removed", { strict: true })
			getRemovedData(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);

		await expect(repo.getRemovedData()).rejects.toThrow(
			"This endpoint has been removed",
		);
	});

	it("should not call API in strict mode when deprecated", async () => {
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { value: 42 },
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@GET("/removed-endpoint")
			@Deprecated("Removed", { strict: true })
			getRemovedData(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);

		try {
			await repo.getRemovedData();
		} catch {
			// Expected error
		}

		expect(mockRequest).not.toHaveBeenCalled();
	});

	it("should work without Deprecated decorator", async () => {
		const consolaWarnSpy = vi
			.spyOn(consola, "warn")
			.mockImplementation(() => {});
		vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { value: 42 },
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@GET("/current-endpoint")
			getCurrentData(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		await repo.getCurrentData();

		expect(consolaWarnSpy).not.toHaveBeenCalled();
	});

	it("should allow API call after warning in normal mode", async () => {
		vi.spyOn(consola, "warn").mockImplementation(() => {});
		const mockRequest = vi.spyOn(axiosInstance, "request").mockResolvedValue({
			data: { result: "success" },
			status: 200,
			headers: {},
		});

		@Collection("/api")
		class ApiRepository extends Restify {
			@GET("/old-endpoint")
			@Deprecated("Old method")
			getOldData(): Promise<unknown> {
				return Promise.resolve();
			}
		}

		const repo = new ApiRepository(axiosInstance);
		const result = await repo.getOldData();

		expect(result.data).toEqual({ result: "success" });
		expect(mockRequest).toHaveBeenCalledWith(
			expect.objectContaining({
				method: "GET",
				url: "/api/old-endpoint",
			}),
		);
	});
});
